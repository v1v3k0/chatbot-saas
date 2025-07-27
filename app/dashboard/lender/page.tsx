'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { LenderDashboard } from '@/components/dashboard/lender-dashboard'

export default function LenderDashboardPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    if (!isLoading && user && user.role !== 'lender') {
      router.push('/dashboard/borrower')
      return
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!user || user.role !== 'lender') {
    return null
  }

  return <LenderDashboard />
}