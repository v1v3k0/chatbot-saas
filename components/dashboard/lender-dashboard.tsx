'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from './dashboard-layout'
import { FinancialOverview } from './financial-overview'
import { LoanCard } from '../loans/loan-card'
import { TrendingUp, DollarSign, Users, PieChart, Eye, Plus } from 'lucide-react'

export function LenderDashboard() {
  const { user } = useAuthStore()
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock data - replace with real data from API
  const mockInvestments = [
    {
      id: '1',
      title: 'Home Renovation Loan',
      amount: 5000,
      totalInvested: 5000,
      interestRate: 8.5,
      status: 'active',
      borrower: 'John Smith',
      dueDate: '2024-06-15',
      category: 'home_improvement',
      expectedReturn: 425,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Business Expansion',
      amount: 3000,
      totalInvested: 3000,
      interestRate: 12.0,
      status: 'active',
      borrower: 'Sarah Johnson',
      dueDate: '2024-08-20',
      category: 'business',
      expectedReturn: 360,
      createdAt: '2024-02-01',
    },
  ]

  const mockAvailableLoans = [
    {
      id: '3',
      title: 'Education Loan',
      amount: 8000,
      fundedAmount: 4000,
      interestRate: 9.5,
      status: 'partially_funded',
      borrower: 'Mike Wilson',
      dueDate: '2024-07-10',
      category: 'education',
      riskLevel: 'low',
      createdAt: '2024-03-01',
    },
    {
      id: '4',
      title: 'Debt Consolidation',
      amount: 12000,
      fundedAmount: 0,
      interestRate: 11.0,
      status: 'open',
      borrower: 'Lisa Brown',
      dueDate: '2024-09-15',
      category: 'debt_consolidation',
      riskLevel: 'medium',
      createdAt: '2024-03-05',
    },
  ]

  const stats = {
    totalInvested: 8000,
    totalReturns: 785,
    activeInvestments: 2,
    averageReturn: 9.8,
    portfolioValue: 8785,
  }

  const portfolioStats = [
    {
      label: 'Total Invested',
      value: `$${stats.totalInvested.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue' as const,
    },
    {
      label: 'Total Returns',
      value: `$${stats.totalReturns.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green' as const,
    },
    {
      label: 'Active Investments',
      value: stats.activeInvestments.toString(),
      icon: Users,
      color: 'purple' as const,
    },
    {
      label: 'Avg. Return Rate',
      value: `${stats.averageReturn}%`,
      icon: PieChart,
      color: 'orange' as const,
    },
  ]

  const filteredInvestments = selectedFilter === 'all' 
    ? mockInvestments 
    : mockInvestments.filter(investment => investment.status === selectedFilter)

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
              Track your investments and discover new opportunities
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Browse Loans
          </button>
        </div>

        {/* Financial Overview */}
        <FinancialOverview stats={portfolioStats} />

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Value</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${stats.portfolioValue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">
              +${stats.totalReturns.toLocaleString()} in returns
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Return</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.averageReturn}%
            </div>
            <p className="text-sm text-gray-600">
              Annualized return rate
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              Low
            </div>
            <p className="text-sm text-gray-600">
              Diversified portfolio
            </p>
          </div>
        </div>

        {/* My Investments */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Investments</h2>
              <div className="flex space-x-2">
                {['all', 'active', 'completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedFilter === filter
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card-body">
            {filteredInvestments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No investments yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start investing in loans to earn returns
                </p>
                <button className="btn btn-primary">
                  Browse Available Loans
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInvestments.map((investment) => (
                  <div key={investment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{investment.title}</h3>
                        <p className="text-sm text-gray-600">Borrower: {investment.borrower}</p>
                      </div>
                      <span className="status-badge status-fully-funded">
                        {investment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Invested</p>
                        <p className="font-semibold">${investment.totalInvested.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interest Rate</p>
                        <p className="font-semibold text-green-600">{investment.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expected Return</p>
                        <p className="font-semibold text-blue-600">${investment.expectedReturn}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-semibold">{new Date(investment.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <button className="btn btn-outline btn-sm w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Loans */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Loans</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockAvailableLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onClick={() => {/* Handle loan selection */}}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Interest Payment Received</p>
                    <p className="text-sm text-gray-600">Home Renovation Loan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+$42.50</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Investment</p>
                    <p className="text-sm text-gray-600">Business Expansion Loan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">-$3,000</p>
                  <p className="text-sm text-gray-600">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Loan Fully Funded</p>
                    <p className="text-sm text-gray-600">Education Loan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">Funded</p>
                  <p className="text-sm text-gray-600">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}