'use client'

import { LucideIcon } from 'lucide-react'

interface Stat {
  label: string
  value: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}

interface FinancialOverviewProps {
  stats: Stat[]
}

export function FinancialOverview({ stats }: FinancialOverviewProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="card p-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${getColorClasses(stat.color)} rounded-lg flex items-center justify-center mr-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}