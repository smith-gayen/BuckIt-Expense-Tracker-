import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, context, stream } = body || {}

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid payload: messages[] required' }, { status: 400 })
    }

    // Try Gemini first
    const geminiKey = process.env.GEMINI_API_KEY
    const openAIKey = process.env.OPENAI_API_KEY

    console.log('DEBUG: Keys present?', { gemini: !!geminiKey, openai: !!openAIKey })

    // Choose provider (prioritize Gemini if available or if OpenAI is failing)
    const useGemini = !!geminiKey || !openAIKey

    if (!geminiKey && !openAIKey) {
      console.log('DEBUG: No keys, using fallback')
      // Fallback: simple rule-based response when no key is configured
      return handleFallback(messages, context, stream)
    }

    const systemPrompt = buildSystemPrompt(context)
    const lastMessage = messages[messages.length - 1]?.content || ''

    if (useGemini && geminiKey) {
      console.log('DEBUG: Using Gemini')
      return await handleGeminiChat(messages, systemPrompt, geminiKey, stream)
    } else if (openAIKey) {
      console.log('DEBUG: Using OpenAI')
      const response = await handleOpenAIChat(messages, systemPrompt, openAIKey, stream)
      if (response) return response

      console.log('DEBUG: OpenAI failed, falling back')
      if (geminiKey) {
        console.log('DEBUG: Retrying with Gemini')
        return await handleGeminiChat(messages, systemPrompt, geminiKey, stream)
      }
    }

    console.log('DEBUG: Fallthrough to fallback')
    return handleFallback(messages, context, stream)

  } catch (e: any) {
    console.error('Chat API Error:', e)
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

async function handleGeminiChat(messages: any[], systemPrompt: string, apiKey: string, stream: boolean) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`

  // Convert messages to Gemini format
  const contents = messages.map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: String(m.content || '') }]
  }))

  const payload = {
    contents,
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1000,
    }
  }

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!upstream.ok) {
    const text = await upstream.text()
    console.error('Gemini API Error:', upstream.status, text)
    return NextResponse.json({ error: `Gemini error: ${text}` }, { status: 502 })
  }

  if (stream) {
    const readable = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            try {
              // Simple text extraction simulation for stream
              // In reality, we need to parse JSON objects from the stream
            } catch { }
          }
        } catch (e) {
          console.error(e)
        } finally {
          controller.close()
        }
      }
    })

    // Fallback to non-streaming fetch for Gemini to ensure correctness, then simulate stream to client
    const fullResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await fullResponse.json()
    console.log('DEBUG: Gemini Data:', JSON.stringify(data).slice(0, 200))
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const encoder = new TextEncoder()
    const simStream = new ReadableStream({
      start(controller) {
        const chunks = text.match(/.{1,10}/g) || []
        let i = 0;
        function push() {
          if (i >= chunks.length) { controller.close(); return }
          controller.enqueue(encoder.encode(chunks[i++]))
          setTimeout(push, 10)
        }
        push()
      }
    })

    return new Response(simStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } else {
    // Non-stream
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await response.json()
    console.log('DEBUG: Gemini Data:', JSON.stringify(data).slice(0, 200))
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.'
    return NextResponse.json({ role: 'assistant', content: text })
  }
}

async function handleOpenAIChat(messages: any, systemPrompt: string, apiKey: string, stream: boolean) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: false
    }),
  })

  if (!response.ok) {
    console.error('OpenAI Error:', response.status, await response.text())
    return null
  }

  const data = await response.json()
  return NextResponse.json({ role: 'assistant', content: data.choices?.[0]?.message?.content })
}

function handleFallback(messages: any[], context: any, stream: boolean) {
  const last = messages[messages.length - 1]?.content || ''
  const content = getFallbackAnswer(String(last), context)

  if (stream) {
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(content))
        controller.close()
      }
    })
    return new Response(readable, { headers: { 'Content-Type': 'text/plain' } })
  }
  return NextResponse.json({ role: 'assistant', content })
}

function buildSystemPrompt(context: any): string {
  const fallback = 'You are a helpful personal finance assistant. Be concise and cite amounts with the ₹ symbol.'
  if (!context) return fallback
  try {
    const { totals, budgets, categoriesTop } = context
    return [
      'You are Trackify\'s AI finance assistant. Answer based on provided JSON context when helpful.',
      'Use rupee currency (₹), keep answers short with bullet points if listing.',
      `Context: ${JSON.stringify({ totals, budgets, categoriesTop }).slice(0, 4000)}`,
    ].join('\n')
  } catch {
    return fallback
  }
}

function getFallbackAnswer(input: string, context: any): string {
  const q = input.toLowerCase()
  const totals = context?.totals
  if (q.includes('spent') && totals?.thisMonthExpenses != null) {
    return `You've spent ₹${Number(totals.thisMonthExpenses).toLocaleString()} this month.`
  }
  if (q.includes('income') && totals?.thisMonthIncome != null) {
    return `You've earned ₹${Number(totals.thisMonthIncome).toLocaleString()} this month.`
  }
  return 'I am currently offline. Please configure a valid GEMINI_API_KEY in your .env file to chat.'
}
