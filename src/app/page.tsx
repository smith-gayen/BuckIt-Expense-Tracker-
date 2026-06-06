'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ShieldCheckIcon, ChartBarIcon, BoltIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import CookieConsent from '@/components/ui/CookieConsent'

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90">
            <div className="flex items-center space-x-2">
              <Image src="/hero-poster.jpg" alt="Trackify" width={32} height={32} className="h-8 w-8 rounded object-cover" />
              <span className="text-lg font-heading font-semibold text-text-primary">Trackify</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm text-neutral-700">
            <a href="#about" className="hover:text-primary-600">About</a>
            <a href="#contact" className="hover:text-primary-600">Contact</a>
            <a href="/pricing" className="hover:text-primary-600">Pricing</a>
            <a href="/security" className="hover:text-primary-600">Security</a>
          </nav>
          <div className="flex items-center space-x-2">
            {!user && (
              <>
                <Link href="/login" className="btn-secondary">Sign in</Link>
                <Link href="/signup" className="btn-primary">Sign up</Link>
              </>
            )}
            {user && (
              <button className="btn-primary" onClick={()=>router.push('/dashboard')}>Open Dashboard</button>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline src="/hero.mp4" poster="/logo.svg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/60" />
        <div className="relative max-w-4xl mx-auto px-4 py-28 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Master Your Money With AI</h1>
          <p className="text-base md:text-lg text-neutral-100 mb-6">Track expenses, scan receipts, predict spending, and save smarter — all in one place.</p>
          <div className="flex items-center justify-center space-x-3">
            <Link href={user ? '/dashboard' : '/signup'} className="btn-primary">Get Started</Link>
            <a href="#about" className="btn-secondary">About</a>
          </div>
        </div>
      </section>

      

      <section id="about" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary text-center mb-10">Why Trackify?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-accent-600 mr-2" />
                <h3 className="text-lg font-semibold text-text-primary">AI Insights</h3>
              </div>
              <p className="text-sm text-neutral-600">Predictive analytics and anomaly alerts that highlight what matters before it does.</p>
            </div>
            <div className="card">
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-text-primary">Effortless Tracking</h3>
              </div>
              <p className="text-sm text-neutral-600">Scan receipts with OCR, auto-categorize spending, and visualize budgets in seconds.</p>
            </div>
            <div className="card">
              <div className="flex items-center mb-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-text-primary">Smart Assistant</h3>
              </div>
              <p className="text-sm text-neutral-600">Ask natural questions and get contextual answers from your data in real time.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="card">
              <div className="flex items-center mb-2">
                <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-text-primary">Clarity & Control</h3>
              </div>
              <p className="text-sm text-neutral-600">Clean dashboards and exports to keep your finances audit‑ready.</p>
            </div>
            <div className="card">
              <div className="flex items-center mb-2">
                <BoltIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-text-primary">Fast & Lightweight</h3>
              </div>
              <p className="text-sm text-neutral-600">Built with modern tech for a snappy, responsive experience across devices.</p>
            </div>
            <div className="card">
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-text-primary">Security First</h3>
              </div>
              <p className="text-sm text-neutral-600">HTTPS everywhere, data portability, consented analytics, and clear privacy controls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary text-center mb-10">What users say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <p className="text-sm text-neutral-700">“Trackify replaced my spreadsheet. The AI summaries save me hours every month.”</p>
              <p className="mt-3 text-sm font-medium text-text-primary">Aarav, Freelancer</p>
            </div>
            <div className="card">
              <p className="text-sm text-neutral-700">“Receipt scanning is insanely accurate. Budgets finally stick.”</p>
              <p className="mt-3 text-sm font-medium text-text-primary">Meera, Product Manager</p>
            </div>
            <div className="card">
              <p className="text-sm text-neutral-700">“Anomaly alerts caught duplicate charges twice. Paid for itself instantly.”</p>
              <p className="mt-3 text-sm font-medium text-text-primary">Rahul, Small Business Owner</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary text-center mb-10">FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-medium text-text-primary">Do you connect to my bank?</summary>
              <p className="text-sm text-neutral-700 mt-2">Not by default. You can import/export data anytime. Bank connections are optional and opt‑in when available.</p>
            </details>
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-medium text-text-primary">How do you handle my data?</summary>
              <p className="text-sm text-neutral-700 mt-2">We prioritize privacy. See our <a className="text-primary-600 hover:underline" href="/privacy">Privacy Policy</a> and <a className="text-primary-600 hover:underline" href="/security">Security</a> page.</p>
            </details>
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-medium text-text-primary">Is there a free plan?</summary>
              <p className="text-sm text-neutral-700 mt-2">Yes. Upgrade anytime for OCR, AI assistant, and predictive insights.</p>
            </details>
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-medium text-text-primary">Can I export my data?</summary>
              <p className="text-sm text-neutral-700 mt-2">Yes, download CSV/Excel from Settings. You own your data.</p>
            </details>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary text-center mb-8">Contact Us</h2>
          <div className="card max-w-2xl mx-auto">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field" placeholder="Name" />
              <input className="input-field" placeholder="Email" type="email" />
              <textarea className="input-field md:col-span-2" placeholder="Message" rows={4} />
              <div className="md:col-span-2 flex justify-end">
                <button type="button" className="btn-primary">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-600">
          <p>© {new Date().getFullYear()} Trackify. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <a href="#about" className="hover:text-primary-600">About</a>
            <a href="#contact" className="hover:text-primary-600">Contact</a>
            <a className="hover:text-primary-600" href="/pricing">Pricing</a>
            <a className="hover:text-primary-600" href="/security">Security</a>
            <a className="hover:text-primary-600" href="/privacy">Privacy</a>
            <a className="hover:text-primary-600" href="/terms">Terms</a>
            <a className="hover:text-primary-600" href="/cookies">Cookies</a>
            <Link className="hover:text-primary-600" href={user ? '/dashboard' : '/login'}>Sign in</Link>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  )
}
