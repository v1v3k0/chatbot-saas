'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from './dashboard-layout'
import { LoanRequestForm } from '../loans/loan-request-form'
import { LoanCard } from '../loans/loan-card'
import { RepaymentSchedule } from '../loans/repayment-schedule'
import { FinancialOverview } from '../dashboard/financial-overview'
import { Plus, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react'

export function BorrowerDashboard() {
  const { user } = useAuthStore()
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)

  // Mock data - replace with real data from API
  const mockLoans = [
    {
      id: '1',
      title: 'Home Renovation Loan',
      amount: 15000,
      fundedAmount: 12000,
      interestRate: 8.5,
      status: 'partially_funded',
      dueDate: '2024-06-15',
      category: 'home_improvement',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Business Expansion',
      amount: 25000,
      fundedAmount: 25000,
      interestRate: 12.0,
      status: 'fully_funded',
      dueDate: '2024-08-20',
      category: 'business',
      createdAt: '2024-02-01',
    },
  ]

  const mockRepayments = [
    {
      id: '1',
      loanId: '1',
      amount: 1250,
      dueDate: '2024-03-15',
      status: 'completed',
      paidDate: '2024-03-14',
    },
    {
      id: '2',
      loanId: '1',
      amount: 1250,
      dueDate: '2024-04-15',
      status: 'pending',
    },
  ]

  const stats = {
    totalBorrowed: 40000,
    outstandingBalance: 28000,
    nextPayment: 1250,
    nextPaymentDate: '2024-04-15',
    creditScore: user?.credit_score || 650,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-gray-600">
              Manage your loans and track your repayments
            </p>
          </div>
          <button
            onClick={() => setShowLoanForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Loan Request
          </button>
        </div>

        {/* Financial Overview */}
        <FinancialOverview
          stats={[
            {
              label: 'Total Borrowed',
              value: `$${stats.totalBorrowed.toLocaleString()}`,
              icon: DollarSign,
              color: 'blue',
            },
            {
              label: 'Outstanding Balance',
              value: `$${stats.outstandingBalance.toLocaleString()}`,
              icon: TrendingUp,
              color: 'orange',
            },
            {
              label: 'Next Payment',
              value: `$${stats.nextPayment.toLocaleString()}`,
              icon: Calendar,
              color: 'green',
            },
            {
              label: 'Credit Score',
              value: stats.creditScore.toString(),
              icon: TrendingUp,
              color: 'purple',
            },
          ]}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Next Payment</h3>
                <p className="text-sm text-gray-600">
                  Due {new Date(stats.nextPaymentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-600">
                  View all your payments
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Credit Score</h3>
                <p className="text-sm text-gray-600">
                  {stats.creditScore} - Good
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Your Active Loans</h2>
          </div>
          <div className="card-body">
            {mockLoans.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No active loans
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first loan request to get started
                </p>
                <button
                  onClick={() => setShowLoanForm(true)}
                  className="btn btn-primary"
                >
                  Create Loan Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    onClick={() => setSelectedLoan(loan)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Repayments */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Repayments</h2>
          </div>
          <div className="card-body">
            <RepaymentSchedule repayments={mockRepayments} />
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
          </div>
          <div className="card-body">
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">
                  Payment Due Soon
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your next payment of $1,250 is due on April 15, 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Request Modal */}
      {showLoanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <LoanRequestForm
              onClose={() => setShowLoanForm(false)}
              onSuccess={() => {
                setShowLoanForm(false)
                // Refresh data
              }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}