'use client'

import { useMemo } from 'react'
import { 
  ChartBarIcon,
  BanknotesIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { DashboardStats } from '@/types'
import StatsCard from './StatsCard'
import ExpenseChart from './ExpenseChart'
import CategoryBreakdown from './CategoryBreakdown'
import RecentTransactions from './RecentTransactions'
import PredictiveInsights from './PredictiveInsights'
import AnomalyAlerts from './AnomalyAlerts'
import CategoryForecast from './CategoryForecast'
import CategoryAnomalies from './CategoryAnomalies'

export default function DashboardOverview() {
  const { state } = useData()

  // Calculate dashboard statistics from real data
  const stats: DashboardStats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Filter current month data
    const currentMonthExpenses = state.expenses.filter(expense => 
      expense.date.getMonth() === currentMonth && expense.date.getFullYear() === currentYear
    )
    
    const currentMonthIncome = state.income.filter(income => 
      income.date.getMonth() === currentMonth && income.date.getFullYear() === currentYear
    )
    
    // Calculate totals
    const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalIncome = currentMonthIncome.reduce((sum, income) => sum + income.amount, 0)
    const savingsThisMonth = totalIncome - totalExpenses
    
    // Calculate budget utilization
    const totalBudget = state.budgets.reduce((sum, budget) => sum + budget.amount, 0)
    const budgetUtilization = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0
    
    // Calculate top categories
    const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      const categoryName = expense.category.name
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)
    
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
    
    return {
      totalExpenses,
      totalIncome,
      savingsThisMonth,
      budgetUtilization,
      topCategories
    }
  }, [state.expenses, state.income, state.budgets])

  // Calculate percentage changes (comparing to last month)
  const percentageChanges = useMemo(() => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthNumber = lastMonth.getMonth()
    const lastMonthYear = lastMonth.getFullYear()
    
    const lastMonthExpenses = state.expenses
      .filter(expense => 
        expense.date.getMonth() === lastMonthNumber && 
        expense.date.getFullYear() === lastMonthYear
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
    
    const lastMonthIncome = state.income
      .filter(income => 
        income.date.getMonth() === lastMonthNumber && 
        income.date.getFullYear() === lastMonthYear
      )
      .reduce((sum, income) => sum + income.amount, 0)
    
    const expenseChange = lastMonthExpenses > 0 
      ? ((stats.totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0
    
    const incomeChange = lastMonthIncome > 0 
      ? ((stats.totalIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : 0
    
    const savingsChange = (lastMonthIncome - lastMonthExpenses) > 0
      ? ((stats.savingsThisMonth - (lastMonthIncome - lastMonthExpenses)) / (lastMonthIncome - lastMonthExpenses)) * 100
      : 0
    
    return {
      expense: expenseChange,
      income: incomeChange,
      savings: savingsChange
    }
  }, [state.expenses, state.income, stats])

  if (state.isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-32 bg-neutral-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card h-96 bg-neutral-200" />
          <div className="card h-96 bg-neutral-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Expenses"
          value={`₹${stats.totalExpenses.toLocaleString()}`}
          change={`${percentageChanges.expense >= 0 ? '+' : ''}${percentageChanges.expense.toFixed(1)}%`}
          changeType={percentageChanges.expense > 0 ? "negative" : "positive"}
          icon={CreditCardIcon}
          color="red"
        />
        <StatsCard
          title="Total Income"
          value={`₹${stats.totalIncome.toLocaleString()}`}
          change={`${percentageChanges.income >= 0 ? '+' : ''}${percentageChanges.income.toFixed(1)}%`}
          changeType={percentageChanges.income >= 0 ? "positive" : "negative"}
          icon={BanknotesIcon}
          color="green"
        />
        <StatsCard
          title="Savings This Month"
          value={`₹${stats.savingsThisMonth.toLocaleString()}`}
          change={`${percentageChanges.savings >= 0 ? '+' : ''}${percentageChanges.savings.toFixed(1)}%`}
          changeType={stats.savingsThisMonth >= 0 ? "positive" : "negative"}
          icon={BanknotesIcon}
          color="blue"
        />
        <StatsCard
          title="Budget Utilized"
          value={`${stats.budgetUtilization}%`}
          change={stats.budgetUtilization > 100 ? "Over budget!" : "On track"}
          changeType={stats.budgetUtilization <= 80 ? "positive" : "negative"}
          icon={ChartBarIcon}
          color="purple"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseChart />
        <CategoryBreakdown categories={stats.topCategories} />
      </div>

      {/* Predictive & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PredictiveInsights />
        <AnomalyAlerts />
      </div>

      {/* Category-level analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryForecast />
        <CategoryAnomalies />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  )
}
