import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'
import { parseReceipt } from '@/lib/ocr'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ab = await file.arrayBuffer()

    // Run OCR on server (Node WASM). No DOM APIs used here.
    const { data } = await Tesseract.recognize(Buffer.from(ab), 'eng', {
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-/:.,₹$%() ',
      psm: 6,
    } as any)

    const text = data.text || ''
    const confidence = (data as any).confidence ?? undefined
    const parsed = parseReceipt(text)

    return NextResponse.json({
      success: true,
      text,
      confidence,
      ...parsed,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'OCR failed' }, { status: 500 })
  }
}
