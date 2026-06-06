'use client'

  import { useState } from 'react'
  import { useAuth } from '@/contexts/AuthContext'
  import { useData } from '@/contexts/DataContext'
  import { useEffect } from 'react'
  import type { ReactNode } from 'react'
  import { usePathname, useSearchParams } from 'next/navigation'
  import Link from 'next/link'
  import Image from 'next/image'
  import { motion, AnimatePresence } from 'framer-motion'
  import { 
    HomeIcon,
    CreditCardIcon, 
    ChartBarIcon, 
    BanknotesIcon,
    CameraIcon,
    ChatBubbleLeftRightIcon,
    BellIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon
  } from '@heroicons/react/24/outline'

  import LoadingOverlay from '@/components/ui/LoadingOverlay'

  interface DashboardLayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
  }

const navigation = [
  { id: 'overview', name: 'Overview', icon: HomeIcon },
  { id: 'expenses', name: 'Expenses', icon: CreditCardIcon },
  { id: 'income', name: 'Income', icon: BanknotesIcon },
  { id: 'categories', name: 'Categories', icon: ChartBarIcon },
  { id: 'scanner', name: 'Scan Receipt', icon: CameraIcon },
  { id: 'chat', name: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
]
export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { state } = useData()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [routeTransition, setRouteTransition] = useState(false)

  // Show overlay briefly on every route change
  useEffect(() => {
    if (!pathname) return
    setRouteTransition(true)
    const t = setTimeout(() => setRouteTransition(false), 900) // ~0.9s
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()])

  // Content transitions handled by framer-motion below

  return (
    <div className="min-h-screen bg-neutral-50">
      <LoadingOverlay show={state.isLoading || routeTransition} durationMs={700} />
      {/* Mobile sidebar */}
      <AnimatePresence>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="fixed inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
          <motion.div
            className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white"
            initial={{ x: -24, opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200">
              <Link href="/" className="hover:opacity-90">
                <div className="flex items-center gap-2">
                  <Image src="/hero-poster.jpg" alt="Trackify" width={24} height={24} className="h-6 w-6 rounded object-cover" />
                  <span className="text-2xl font-heading font-bold text-primary-500">Trackify</span>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    activeTab === item.id
                      ? 'bg-primary-100 text-primary-700 border-l-2 border-primary-500'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-primary-700' : ''}`} />
                  {item.name}
                </button>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-neutral-200">
          <div className="flex h-16 items-center px-6 border-b border-neutral-200">
            <Link href="/" className="hover:opacity-90">
              <div className="flex items-center gap-2">
                <Image src="/hero-poster.jpg" alt="Trackify" width={24} height={24} className="h-6 w-6 rounded object-cover" />
                <span className="text-2xl font-heading font-bold text-primary-500">Trackify</span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  activeTab === item.id
                    ? 'bg-primary-100 text-primary-700 border-l-2 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-primary-700' : ''}`} />
                {item.name}
              </button>
            ))}
          </nav>
          {/* Removed sidebar Settings button to ensure only one entry point */}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-neutral-200">
          <button
            className="px-4 border-r border-neutral-200 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8 gap-2 flex-wrap items-center min-w-0">
            <div className="flex flex-1 min-w-0">
              <div className="flex items-center min-w-0">
                <h2 className="text-xl font-heading font-semibold text-text-primary capitalize truncate">
                  {navigation.find(item => item.id === activeTab)?.name || 'Overview'}
                </h2>
              </div>
            </div>
            <div className="ml-0 sm:ml-4 flex items-center space-x-3 sm:space-x-4">
              <button
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:bg-neutral-100/60"
                title="Notifications"
                onClick={() => onTabChange('notifications')}
              >
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-neutral-300 bg-neutral-200 flex items-center justify-center transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  title="Profile & Settings"
                  onClick={() => onTabChange('settings')}
                >
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name || 'User'} className="h-8 w-8 object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-white bg-primary-500 h-full w-full flex items-center justify-center">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </button>
                <details className="dropdown">
                  <summary className="p-2 rounded-md cursor-pointer list-none text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                    <ChevronDownIcon className="h-5 w-5" />
                  </summary>
                  <div className="dropdown-menu card p-2 absolute right-0 mt-2 w-48 z-10 rounded-lg border border-neutral-200 shadow-lg bg-white">
                    <div className="px-2 py-1 text-sm text-neutral-600 truncate">{user?.email || 'Guest'}</div>
                    <button className="w-full text-left px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-sm" onClick={()=>onTabChange('settings')}>Profile & Settings</button>
                    <button className="w-full text-left px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-sm" onClick={logout}>Logout</button>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Single Settings entry: floating button bottom-left */}
      <button
        className="fixed left-3 bottom-3 sm:left-4 sm:bottom-4 z-40 inline-flex items-center gap-2 px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        title="Settings"
        onClick={() => onTabChange('settings')}
      >
        <Cog6ToothIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Settings</span>
      </button>
    </div>
  )
}
