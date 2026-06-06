'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryBreakdownProps {
  categories: {
    category: string
    amount: number
    percentage: number
  }[]
}

const COLORS = ['#0A3D62', '#2ECC71', '#E74C3C', '#F39C12', '#9B59B6']

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          Expense Categories
        </h3>
        <p className="text-sm text-neutral-600">This month&apos;s breakdown</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center">
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="amount"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-1/2 lg:pl-6">
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {category.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-text-primary">
                    ₹{category.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-600">
                    {category.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
