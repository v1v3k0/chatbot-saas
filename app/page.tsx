'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { AuthForm } from '@/components/auth/auth-form'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      // Redirect to appropriate dashboard based on user role
      if (user.role === 'borrower') {
        router.push('/dashboard/borrower')
      } else {
        router.push('/dashboard/lender')
      }
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                P2P Lending Platform
              </h1>
              <p className="text-gray-600">
                Connect borrowers and lenders securely
              </p>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  )
}