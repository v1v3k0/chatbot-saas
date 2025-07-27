'use client'

import { formatCurrency, formatDate } from '@/utils/calculations'

interface LoanCardProps {
  loan: {
    id: string
    title: string
    amount: number
    fundedAmount?: number
    interestRate: number
    status: string
    dueDate: string
    category: string
    riskLevel?: string
    borrower?: string
    createdAt: string
  }
  onClick?: () => void
}

export function LoanCard({ loan, onClick }: LoanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'status-open'
      case 'partially_funded':
        return 'status-partially-funded'
      case 'fully_funded':
        return 'status-fully-funded'
      case 'settled':
        return 'status-settled'
      case 'overdue':
        return 'status-overdue'
      case 'cancelled':
        return 'status-cancelled'
      default:
        return 'status-open'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'risk-low'
      case 'medium':
        return 'risk-medium'
      case 'high':
        return 'risk-high'
      default:
        return 'risk-medium'
    }
  }

  const fundingProgress = loan.fundedAmount 
    ? (loan.fundedAmount / loan.amount) * 100 
    : 0

  return (
    <div 
      className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{loan.title}</h3>
          {loan.borrower && (
            <p className="text-sm text-gray-600">Borrower: {loan.borrower}</p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`status-badge ${getStatusColor(loan.status)}`}>
            {loan.status.replace('_', ' ')}
          </span>
          {loan.riskLevel && (
            <span className={`status-badge ${getRiskColor(loan.riskLevel)}`}>
              {loan.riskLevel} risk
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Amount</p>
          <p className="font-semibold text-gray-900">{formatCurrency(loan.amount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Interest Rate</p>
          <p className="font-semibold text-green-600">{loan.interestRate}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Category</p>
          <p className="font-semibold text-gray-900 capitalize">
            {loan.category.replace('_', ' ')}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Due Date</p>
          <p className="font-semibold text-gray-900">{formatDate(new Date(loan.dueDate))}</p>
        </div>
      </div>

      {loan.fundedAmount !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Funding Progress</span>
            <span className="text-gray-900">{Math.round(fundingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(fundingProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Funded: {formatCurrency(loan.fundedAmount)}</span>
            <span>Remaining: {formatCurrency(loan.amount - loan.fundedAmount)}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Created {formatDate(new Date(loan.createdAt))}</span>
        <button className="btn btn-outline btn-sm">
          View Details
        </button>
      </div>
    </div>
  )
}