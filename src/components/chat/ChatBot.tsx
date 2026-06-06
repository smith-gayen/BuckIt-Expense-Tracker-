'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hi! I&apos;m your AI expense assistant. I can help you analyze your spending, answer questions about your finances, and provide personalized insights. Try asking me something like &quot;Show me my food expenses this month&quot; or &quot;How can I save more money?&quot;',
    timestamp: new Date()
  }
]

export default function ChatBot() {
  const { state } = useData()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = (smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(() => {
    // Scroll on new messages or loading indicator changes
    scrollToBottom(true)
  }, [messages, isLoading])

  const facts = useMemo(() => {
    // current month aggregates
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const monthExpenses = state.expenses.filter(e => e.date.getMonth() === month && e.date.getFullYear() === year)
    const monthIncome = state.income.filter(i => i.date.getMonth() === month && i.date.getFullYear() === year)
    const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0)
    const totalIncome = monthIncome.reduce((s, i) => s + i.amount, 0)
    const byCategory = monthExpenses.reduce((acc, e) => { acc[e.category.name] = (acc[e.category.name] || 0) + e.amount; return acc }, {} as Record<string, number>)
    const top = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,3)
    const budgets = state.budgets
    const utilization = budgets.reduce((s,b)=>s + (b.amount>0? (b.spent/b.amount):0),0)
    return { totalExpenses, totalIncome, byCategory, top, budgets, utilization }
  }, [state.expenses, state.income, state.budgets])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const payload = {
        messages: [
          ...messages.map(m => ({ role: m.type, content: m.content })),
          { role: 'user', content: inputValue },
        ],
        context: buildContext(),
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: true }),
      })
      if (res.headers.get('Content-Type')?.includes('text/plain')) {
        // stream text
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let acc = ''
        const id = (Date.now() + 1).toString()
        const base: Message = { id, type: 'assistant', content: '', timestamp: new Date() }
        setMessages(prev => [...prev, base])
        while (reader) {
          const { value, done } = await reader.read()
          if (done) break
          acc += decoder.decode(value)
          setMessages(prev => prev.map(m => m.id === id ? { ...m, content: acc } : m))
        }
      } else {
        const data = await res.json()
        const content = data?.content || getAIResponse(inputValue)
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiResponse])
      }
    } catch (e) {
      const fallback: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, fallback])
    } finally {
      setIsLoading(false)
    }
  }

  const getAIResponse = (input: string): string => {
    const q = input.toLowerCase()
    // totals
    if (q.includes('total expense') || q.includes('spent this month')) {
      return `You've spent ₹${facts.totalExpenses.toLocaleString()} this month.`
    }
    if (q.includes('total income') || q.includes('earned this month')) {
      return `You've earned ₹${facts.totalIncome.toLocaleString()} this month.`
    }
    // category breakdown
    const catMatch = q.match(/(food|dining|transportation|shopping|entertainment|utilities|healthcare|education|travel|fitness|other)/i)
    if (catMatch) {
      const cat = Object.keys(facts.byCategory).find(c => c.toLowerCase().includes(catMatch[0].toLowerCase()))
      const amt = cat ? facts.byCategory[cat] : 0
      return `You've spent ₹${(amt||0).toLocaleString()} on ${cat || catMatch[0]} this month.`
    }
    if (q.includes('top categories') || q.includes('biggest categories')) {
      const lines = facts.top.map(([c,a]) => `• ${c}: ₹${(a as number).toLocaleString()}`).join('\n')
      return lines ? `Your top categories this month:\n${lines}` : 'No expenses yet this month.'
    }
    // budgets
    if (q.includes('budget')) {
      if (facts.budgets.length === 0) return 'You have no budgets set.'
      const rows = facts.budgets.map(b => `${b.category.name}: ${Math.round((b.spent/(b.amount||1))*100)}% used (₹${b.spent.toLocaleString()}/₹${b.amount.toLocaleString()})`).join('\n')
      return `Budget utilization:\n${rows}`
    }
    // savings
    if (q.includes('save') || q.includes('saving')) {
      return 'Try enabling round-up or behavior rules in Savings to automate saving when you spend.'
    }
    return 'Ask about totals ("spent this month"), categories ("food"), budgets ("budget utilization"), or savings.'
  }

  const buildContext = () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const monthExpenses = state.expenses.filter(e => e.date.getMonth() === month && e.date.getFullYear() === year)
    const monthIncome = state.income.filter(i => i.date.getMonth() === month && i.date.getFullYear() === year)
    const totals = {
      thisMonthExpenses: monthExpenses.reduce((s,e)=>s+e.amount,0),
      thisMonthIncome: monthIncome.reduce((s,i)=>s+i.amount,0),
    }
    const budgets = state.budgets.map(b => ({
      category: b.category.name,
      amount: b.amount,
      spent: b.spent,
      utilization: b.amount ? Math.round((b.spent/b.amount)*100) : 0,
    }))
    const categoriesTop = Object.entries(monthExpenses.reduce((acc, e) => { acc[e.category.name] = (acc[e.category.name]||0)+e.amount; return acc }, {} as Record<string, number>))
      .sort((a,b)=>b[1]-a[1])
      .slice(0,5)
      .map(([name, amt]) => ({ name, amount: amt }))
    return { totals, budgets, categoriesTop }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-text-primary">AI Assistant</h2>
        <p className="text-neutral-600">Ask me anything about your finances and spending patterns</p>
      </div>

      {/* Chat Container */}
      <div className="card h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-text-primary'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-primary-100' : 'text-neutral-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 text-text-primary px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your expenses, budgets, or savings..."
                className="input-field pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button 
                  className="p-2 text-neutral-400 hover:text-neutral-600"
                  title="Voice input"
                >
                  <MicrophoneIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 text-primary-500 hover:text-primary-600 disabled:text-neutral-400"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Try: &quot;Show me food expenses&quot; or &quot;How can I save more money?&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
