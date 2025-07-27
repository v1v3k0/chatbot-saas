'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loanRequestSchema } from '@/lib/validations'
import { X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoanRequestFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function LoanRequestForm({ onClose, onSuccess }: LoanRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      principalAmount: 0,
      interestRate: 8,
      durationDays: 30,
      purpose: '',
      category: 'personal',
    },
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to create loan request')
        return
      }

      toast.success('Loan request created successfully!')
      onSuccess()
    } catch (error) {
      toast.error('An error occurred while creating the loan request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create Loan Request</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="form-label">
            Loan Title
          </label>
          <input
            id="title"
            type="text"
            {...form.register('title')}
            className="form-input"
            placeholder="e.g., Home Renovation Loan"
          />
          {form.formState.errors.title && (
            <p className="form-error">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            {...form.register('description')}
            className="form-input"
            rows={3}
            placeholder="Describe the purpose and details of your loan request..."
          />
          {form.formState.errors.description && (
            <p className="form-error">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="principalAmount" className="form-label">
              Loan Amount ($)
            </label>
            <input
              id="principalAmount"
              type="number"
              {...form.register('principalAmount', { valueAsNumber: true })}
              className="form-input"
              placeholder="1000"
              min="100"
              max="50000"
            />
            {form.formState.errors.principalAmount && (
              <p className="form-error">{form.formState.errors.principalAmount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="interestRate" className="form-label">
              Interest Rate (%)
            </label>
            <input
              id="interestRate"
              type="number"
              {...form.register('interestRate', { valueAsNumber: true })}
              className="form-input"
              placeholder="8.5"
              min="1"
              max="36"
              step="0.1"
            />
            {form.formState.errors.interestRate && (
              <p className="form-error">{form.formState.errors.interestRate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="durationDays" className="form-label">
              Duration (days)
            </label>
            <input
              id="durationDays"
              type="number"
              {...form.register('durationDays', { valueAsNumber: true })}
              className="form-input"
              placeholder="30"
              min="7"
              max="365"
            />
            {form.formState.errors.durationDays && (
              <p className="form-error">{form.formState.errors.durationDays.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              {...form.register('category')}
              className="form-input"
            >
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="education">Education</option>
              <option value="home_improvement">Home Improvement</option>
              <option value="debt_consolidation">Debt Consolidation</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
            {form.formState.errors.category && (
              <p className="form-error">{form.formState.errors.category.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="purpose" className="form-label">
            Purpose
          </label>
          <input
            id="purpose"
            type="text"
            {...form.register('purpose')}
            className="form-input"
            placeholder="Brief description of how you plan to use the funds"
          />
          {form.formState.errors.purpose && (
            <p className="form-error">{form.formState.errors.purpose.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Loan Request'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}