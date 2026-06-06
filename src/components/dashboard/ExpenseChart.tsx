'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useData } from '@/contexts/DataContext'

export default function ExpenseChart() {
  const { state } = useData()

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    
    // Get last 6 months data
    const data = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      
      const monthExpenses = state.expenses
        .filter(expense => 
          expense.date.getMonth() === month && 
          expense.date.getFullYear() === year
        )
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      const monthIncome = state.income
        .filter(income => 
          income.date.getMonth() === month && 
          income.date.getFullYear() === year
        )
        .reduce((sum, income) => sum + income.amount, 0)
      
      data.push({
        month: months[month],
        expenses: monthExpenses,
        income: monthIncome,
        year: year
      })
    }
    
    return data
  }, [state.expenses, state.income])

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          Income vs Expenses
        </h3>
        <p className="text-sm text-neutral-600">Last 6 months overview</p>
      </div>
      
      {chartData.some(item => item.expenses > 0 || item.income > 0) ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `₹${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
            />
            <Tooltip 
              formatter={(value: number, _name: string, item: any) => [
                `₹${value.toLocaleString()}`, 
                item?.dataKey === 'income' ? 'Income' : 'Expenses'
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#2ECC71" 
              strokeWidth={3}
              dot={{ fill: '#2ECC71', strokeWidth: 2 }}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#E74C3C" 
              strokeWidth={3}
              dot={{ fill: '#E74C3C', strokeWidth: 2 }}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-neutral-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">No data available</p>
            <p className="text-xs">Add some expenses and income to see your chart</p>
          </div>
        </div>
      )}
    </div>
  )
}
