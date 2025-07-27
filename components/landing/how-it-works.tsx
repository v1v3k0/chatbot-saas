'use client'

import { ArrowRight, CheckCircle, FileText, Handshake, TrendingUp, Users } from 'lucide-react'

export function HowItWorks() {
  const borrowerSteps = [
    {
      icon: FileText,
      title: 'Create Loan Request',
      description: 'Fill out a simple application with your loan amount, purpose, and preferred terms.'
    },
    {
      icon: Users,
      title: 'Get Funded',
      description: 'Lenders review your request and fund your loan. You can receive partial or full funding.'
    },
    {
      icon: TrendingUp,
      title: 'Repay on Schedule',
      description: 'Make regular payments according to your agreed schedule with transparent interest calculations.'
    }
  ]

  const lenderSteps = [
    {
      icon: FileText,
      title: 'Browse Opportunities',
      description: 'Review loan requests from verified borrowers with detailed credit scores and risk assessments.'
    },
    {
      icon: Handshake,
      title: 'Fund Loans',
      description: 'Choose loans that match your investment criteria and fund them with as little as $50.'
    },
    {
      icon: TrendingUp,
      title: 'Earn Returns',
      description: 'Receive regular interest payments and principal repayments as borrowers make their payments.'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes peer-to-peer lending simple and secure for both borrowers and lenders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Borrower Process */}
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">For Borrowers</h3>
              <p className="text-gray-600">
                Get the funds you need with competitive rates and flexible terms.
              </p>
            </div>

            <div className="space-y-8">
              {borrowerSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center mb-2">
                      <step.icon className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Borrower Benefits:</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Competitive interest rates starting from 5%
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  No prepayment penalties
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Quick approval process
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Transparent fee structure
                </li>
              </ul>
            </div>
          </div>

          {/* Lender Process */}
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">For Lenders</h3>
              <p className="text-gray-600">
                Earn attractive returns by funding loans to creditworthy borrowers.
              </p>
            </div>

            <div className="space-y-8">
              {lenderSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center mb-2">
                      <step.icon className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Lender Benefits:</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  High returns up to 15% annually
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Diversify across multiple loans
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Low minimum investment ($50)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Automated payment processing
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already benefiting from our P2P lending platform. 
              Whether you need a loan or want to invest, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100">
                Start Lending
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                Apply for Loan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}