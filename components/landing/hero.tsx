'use client'

import { useState } from 'react'
import { ArrowRight, Shield, TrendingUp, Users, Zap } from 'lucide-react'

export function Hero() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="block">Revolutionary</span>
            <span className="block text-yellow-300">P2P Lending</span>
            <span className="block">Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100 leading-relaxed">
            Connect directly with borrowers and lenders. Earn better returns, get better rates, 
            and build financial relationships that work for everyone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="btn btn-lg bg-yellow-400 text-gray-900 hover:bg-yellow-300 transform transition-all duration-200 hover:scale-105"
            >
              Start Lending
              <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
            </button>
            
            <button className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-gray-900">
              Apply for Loan
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">$50M+</div>
              <div className="text-blue-100">Total Loans Funded</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">15%</div>
              <div className="text-blue-100">Average Returns</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">10K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Transparent</h3>
              <p className="text-gray-600">
                Bank-level security with complete transparency. Every transaction is recorded and verifiable.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-200">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Better Returns</h3>
              <p className="text-gray-600">
                Earn up to 15% annual returns on your investments, far exceeding traditional savings accounts.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-200">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Join a community of like-minded individuals building wealth together through peer-to-peer lending.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}