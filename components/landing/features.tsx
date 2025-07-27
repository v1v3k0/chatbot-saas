'use client'

import { CheckCircle, DollarSign, Lock, PieChart, Shield, TrendingUp, Users, Zap } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your funds are protected with enterprise-grade encryption and secure infrastructure.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Earn up to 15% annual returns, significantly higher than traditional savings accounts.',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Diversified Portfolio',
      description: 'Spread your investments across multiple loans to minimize risk and maximize returns.',
      color: 'purple'
    },
    {
      icon: Lock,
      title: 'Transparent Process',
      description: 'Complete visibility into loan details, borrower profiles, and transaction history.',
      color: 'indigo'
    },
    {
      icon: PieChart,
      title: 'Risk Assessment',
      description: 'Advanced credit scoring and risk analysis to help you make informed decisions.',
      color: 'orange'
    },
    {
      icon: Zap,
      title: 'Instant Funding',
      description: 'Quick and seamless funding process with real-time updates and notifications.',
      color: 'yellow'
    }
  ]

  const benefits = [
    'No hidden fees or charges',
    '24/7 customer support',
    'Mobile-responsive platform',
    'Real-time loan tracking',
    'Automated repayment processing',
    'Credit score monitoring'
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our P2P Lending Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built the most comprehensive and user-friendly peer-to-peer lending platform 
            to help you achieve your financial goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className={`w-12 h-12 ${getColorClasses(feature.color)} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Everything You Need for Successful P2P Lending
            </h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Platform Statistics</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Average Return Rate</span>
                <span className="font-semibold text-green-600">12.5%</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Default Rate</span>
                <span className="font-semibold text-red-600">2.1%</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Active Loans</span>
                <span className="font-semibold text-blue-600">1,247</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Total Volume</span>
                <span className="font-semibold text-purple-600">$12.8M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}