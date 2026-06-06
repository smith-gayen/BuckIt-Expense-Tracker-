import Tesseract from 'tesseract.js'

export interface OCRExtracted {
  text: string
  merchant?: string
  amount?: number
  date?: string
  items?: { name: string; price: number; quantity: number }[]
  categoryGuess?: string
  paymentModeGuess?: string
  confidence?: number
}

// Basic client-side image preprocessing to improve OCR quality
async function preprocessImage(file: File): Promise<HTMLCanvasElement> {
  const img = await fileToImage(file)
  const maxDim = 2000
  const scale = Math.min(maxDim / Math.max(img.width, img.height), 1)
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  // Grayscale + contrast/threshold
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  // Simple luminance + contrast stretch + light thresholding
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    let y = 0.299 * r + 0.587 * g + 0.114 * b
    // Increase contrast
    y = (y - 128) * 1.2 + 128
    // Optional light threshold to denoise
    const v = y > 240 ? 255 : y < 20 ? 0 : y
    data[i] = data[i + 1] = data[i + 2] = v
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}

export async function runOCR(file: File): Promise<OCRExtracted> {
  const canvas = await preprocessImage(file)
  const { data } = await Tesseract.recognize(canvas, 'eng', {
    // Whitelist common receipt characters to reduce confusion
    tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-/:.,₹$%() ",
    // Page segmentation mode (6: Assume a single uniform block of text)
    psm: 6,
  } as any)
  const text = data.text || ''
  const confidence = (data.confidence as any) ?? undefined
  const parsed = parseReceipt(text)
  return { text, confidence, ...parsed }
}

export function parseReceipt(text: string): Partial<OCRExtracted> {
  const rawLines = text.split(/\r?\n/)
  const lines = rawLines.map((l) => l.replace(/[\t]+/g, ' ').trim()).filter(Boolean)
  const joined = ` ${lines.join(' ').toLowerCase()} `

  // Merchant: first line with sufficient letters and without typical receipt keywords
  const merchant = detectMerchant(lines)

  // Date: support multiple formats
  const date = detectDate(joined)

  // Parse potential line items
  const items = parseItems(lines)

  // Amount detection
  const amount = detectTotal(joined, lines) ?? (items.length ? Number(items.reduce((s, it) => s + it.price * it.quantity, 0).toFixed(2)) : undefined)

  // Category & payment mode guesses
  const categoryGuess = guessCategory(joined, merchant)
  const paymentModeGuess = guessPaymentMode(joined)

  return { merchant, amount, date, items, categoryGuess, paymentModeGuess }
}

function normalizeDate(raw: string): string | undefined {
  if (/\d{4}-\d{2}-\d{2}/.test(raw)) return raw
  const m = raw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
  if (!m) return undefined
  const [_, a, b, y] = m
  // assume DD/MM/YYYY; fallback to MM/DD/YYYY if needed (can't disambiguate reliably)
  const dd = Number(a) > 12 ? a : b
  const mm = Number(a) > 12 ? b : a
  return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function detectMerchant(lines: string[]): string | undefined {
  const blacklist = /(receipt|invoice|order|no\.|cashier|store|date|time|tax|subtotal|total|thank|visit|card|visa|master|debit|change)/i
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const l = lines[i]
    if (l.length < 3) continue
    if (blacklist.test(l)) continue
    // prefer lines with letters and maybe uppercase words
    if (/[A-Za-z]{3,}/.test(l)) return l
  }
  return undefined
}

function detectDate(joinedLower: string): string | undefined {
  const patterns = [
    /(\d{4}-\d{2}-\d{2})/, // 2025-09-25
    /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/, // 25/09/2025 or 09-25-2025
    /(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+\d{4})/, // 25 Sep 2025
    /((jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+\d{1,2},?\s+\d{4})/, // Sep 25, 2025
  ]
  for (const p of patterns) {
    const m = joinedLower.match(p)
    if (m) {
      const raw = m[1]
      if (/\d{4}-\d{2}-\d{2}/.test(raw)) return raw
      if (/\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(raw)) return normalizeDate(raw)
      const d = new Date(raw.replace(/sept/g, 'sep'))
      if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    }
  }
  return undefined
}

function parseItems(lines: string[]): { name: string; price: number; quantity: number }[] {
  const results: { name: string; price: number; quantity: number }[] = []
  const itemRegexes = [
    /^(.*?)(?:\s{2,}|\s+)(\d+)\s*[xX*]\s*(\d+[\.,]\d{2})\s*$/,
    /^(.*?)(?:\s{2,}|\s+)(\d+[\.,]\d{2})\s*$/, // name ..... 12.34
    /^(.*?)(?:\.+|\s+)+(\d+[\.,]\d{2})\s*$/,   // name ....... 12.34 (dot leaders)
  ]
  for (const l of lines) {
    for (const rx of itemRegexes) {
      const m = l.match(rx)
      if (m) {
        if (rx === itemRegexes[0]) {
          const name = sanitizeName(m[1])
          const quantity = Number(m[2]) || 1
          const price = Number(String(m[3]).replace(',', '.'))
          if (name && isFinite(price)) results.push({ name, price, quantity })
        } else {
          const name = sanitizeName(m[1])
          const price = Number(String(m[2]).replace(',', '.'))
          if (name && isFinite(price)) results.push({ name, price, quantity: 1 })
        }
        break
      }
    }
  }
  return results
}

function sanitizeName(s: string): string {
  return s.replace(/\.{2,}/g, ' ').replace(/\s+/g, ' ').trim()
}

function detectTotal(joinedLower: string, lines?: string[]): number | undefined {
  const totalKeys = ['grand total', 'total amount', 'total', 'amount due', 'balance due', 'payable']
  const moneyRx = /(?:₹|inr|rs\.?|usd|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2}|[0-9]+)/i
  // Score-based: look for amounts near total keywords
  let best: number | undefined
  for (const key of totalKeys) {
    const rxLine = new RegExp(`(?:^|\n|\r)[^\n]*${key.replace(/\s+/g,'\\s+')}[^\n]*`, 'i')
    const m = joinedLower.match(rxLine)
    if (m) {
      const m2 = m[0].match(moneyRx)
      if (m2) {
        const n = Number(m2[1].replace(/,/g, ''))
        if (!isNaN(n)) best = Math.max(best ?? 0, n)
      }
    }
  }
  if (best != null) return best
  // Heuristic: pick the largest currency-like number in the last 5 lines
  const tail = (lines || []).slice(-5).join(' \n ').toLowerCase()
  const all = [...tail.matchAll(/(₹\s*\d[\d,]*\.?\d{0,2}|\b\d{1,3}(?:,\d{3})+(?:\.\d{2})?\b|\b\d+\.\d{2}\b)/g)]
  const nums = all.map(m => Number(m[0].replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, ''))).filter(n => !isNaN(n))
  if (nums.length) return Math.max(...nums)
  return undefined
}

function guessCategory(joinedLower: string, merchant?: string): string | undefined {
  const pairs: [string[], string][] = [
    [[ 'grocery', 'supermarket', 'market', 'walmart', 'aldi', 'costco' ], 'Food & Dining'],
    [[ 'restaurant', 'cafe', 'pizza', 'burger', 'starbucks', 'kfc' ], 'Food & Dining'],
    [[ 'uber', 'lyft', 'taxi', 'metro', 'bus', 'fuel', 'gas' ], 'Transportation'],
    [[ 'cinema', 'movie', 'theatre', 'netflix', 'spotify' ], 'Entertainment'],
    [[ 'pharmacy', 'clinic', 'hospital', 'health' ], 'Healthcare'],
    [[ 'electric', 'water', 'utility', 'bill', 'internet' ], 'Utilities'],
    [[ 'flight', 'airlines', 'hotel', 'booking.com', 'airbnb' ], 'Travel'],
    [[ 'gym', 'fitness', 'sports' ], 'Fitness'],
    [[ 'mall', 'shopping', 'store' ], 'Shopping'],
  ]
  const hay = `${joinedLower} ${merchant?.toLowerCase() || ''}`
  for (const [keys, cat] of pairs) {
    if (keys.some(k => hay.includes(k))) return cat
  }
  return 'Other'
}

function guessPaymentMode(joinedLower: string): string | undefined {
  if (/upi|gpay|google\s*pay|phonepe|paytm|amazon\s*pay/.test(joinedLower)) return 'digital_wallet'
  if (/(credit|debit)\s*card|visa|mastercard|rupay/.test(joinedLower)) return 'credit_card'
  if (/cash/.test(joinedLower)) return 'cash'
  return undefined
}


