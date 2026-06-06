export async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}


