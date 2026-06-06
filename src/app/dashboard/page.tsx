'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import ExpenseList from '@/components/expenses/ExpenseList'
import IncomeList from '@/components/expenses/IncomeList'
import BudgetOverview from '@/components/budget/BudgetOverview'
import SavingsGoals from '@/components/savings/SavingsGoals'
import ReceiptScanner from '@/components/receipt/ReceiptScanner'
import ChatBot from '@/components/chat/ChatBot'
import CategoryManager from '@/components/ui/CategoryManager'
import NotificationsCenter from '@/components/ui/NotificationsCenter'
import SettingsPanel from '@/components/ui/SettingsPanel'
import ProfileForm from '@/components/profile/ProfileForm'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />
      case 'expenses':
        return <ExpenseList />
      case 'income':
        return <IncomeList />
      case 'budget':
        return <BudgetOverview />
      case 'savings':
        return <SavingsGoals />
      case 'categories':
        return <CategoryManager />
      case 'scanner':
        return <ReceiptScanner />
      case 'chat':
        return <ChatBot />
      case 'notifications':
        return <NotificationsCenter />
      case 'settings':
        return (
          <div className="space-y-6">
            <ProfileForm />
            <SettingsPanel />
          </div>
        )
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {user && renderContent()}
    </DashboardLayout>
  )
}


