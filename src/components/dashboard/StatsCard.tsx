'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface StatsCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ComponentType<{ className?: string }>
  color: 'red' | 'green' | 'blue' | 'purple'
}

const colorClasses = {
  red: 'bg-red-100 text-red-600',
  green: 'bg-accent-100 text-accent-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600'
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="ml-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">{title}</p>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
            <div className="flex items-center">
              {changeType === 'positive' ? (
                <ArrowUpIcon className="h-4 w-4 text-accent-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-error" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                changeType === 'positive' ? 'text-accent-600' : 'text-error'
              }`}>
                {change}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
