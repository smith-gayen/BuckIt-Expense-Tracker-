import type { Metadata } from 'next'
import { DataProvider } from '@/contexts/DataContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfirmProvider } from '@/components/ui/ConfirmDialog'
import GlobalRouteLoader from '@/components/ui/GlobalRouteLoader'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trackify',
  description: 'Smart expense tracking with OCR, predictive analytics, and AI-powered insights',
  keywords: 'expense tracker, budgeting, AI, OCR, financial management',
  icons: {
    icon: '/hero-poster.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body bg-neutral-50 min-h-screen">
        <AuthProvider>
          <DataProvider>
            <ConfirmProvider>
              <GlobalRouteLoader />
              {children}
            </ConfirmProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
