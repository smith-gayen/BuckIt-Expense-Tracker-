'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR')
  const [locale, setLocale] = useState(user?.preferences?.locale || 'en-IN')
  const [theme, setTheme] = useState(user?.preferences?.theme || 'system')
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handlePickAvatar = () => fileInputRef.current?.click()

  // Resize the image on client to keep storage small
  const resizeImage = (file: File, maxSize = 256): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas not supported'))

          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
          const w = Math.round(img.width * scale)
          const h = Math.round(img.height * scale)
          canvas.width = w
          canvas.height = h
          ctx.drawImage(img, 0, 0, w, h)
          // Use JPEG with moderate quality to reduce size
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          resolve(dataUrl)
        }
        if (typeof reader.result === 'string') {
          img.src = reader.result
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await resizeImage(file)
      setAvatar(dataUrl)
    } catch (err) {
      console.error('Failed to process image', err)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Avatar</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center ring-1 ring-neutral-300">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-neutral-500 text-sm">No photo</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-primary" onClick={handlePickAvatar}>
              Upload Photo
            </button>
            {avatar && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setAvatar(null)}
              >
                Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
        </div>
        <div className="mt-4">
          <button className="btn-primary" onClick={() => updateProfile({ avatar })}>Save Photo</button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-700 mb-1">Name</label>
            <input className="input-field" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-neutral-700 mb-1">Email</label>
            <input className="input-field" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <button className="btn-primary" onClick={()=>updateProfile({ name, email, avatar })}>Save Profile</button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Preferences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-neutral-700 mb-1">Currency</label>
            <select className="input-field" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-700 mb-1">Locale</label>
            <select className="input-field" value={locale} onChange={(e)=>setLocale(e.target.value)}>
              <option value="en-IN">en-IN</option>
              <option value="en-US">en-US</option>
              <option value="en-GB">en-GB</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-700 mb-1">Theme</label>
            <select className="input-field" value={theme} onChange={(e)=>setTheme(e.target.value as any)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button className="btn-primary" onClick={()=>updateProfile({ preferences: { currency, locale, theme: theme as any } })}>Save Preferences</button>
        </div>
      </div>
    </div>
  )
}


