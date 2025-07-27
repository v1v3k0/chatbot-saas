'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { BorrowerDashboard } from '@/components/dashboard/borrower-dashboard'

export default function BorrowerDashboardPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    if (!isLoading && user && user.role !== 'borrower') {
      router.push('/dashboard/lender')
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

  if (!user || user.role !== 'borrower') {
    return null
  }

  return <BorrowerDashboard />
}