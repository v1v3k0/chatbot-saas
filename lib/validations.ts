import { z } from 'zod'

// User registration and profile validation
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  role: z.enum(['borrower', 'lender'], {
    required_error: 'Please select a role'
  }),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const userProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

// Loan request validation
export const loanRequestSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  principalAmount: z.number()
    .min(100, 'Minimum loan amount is $100')
    .max(50000, 'Maximum loan amount is $50,000'),
  interestRate: z.number()
    .min(1, 'Minimum interest rate is 1%')
    .max(36, 'Maximum interest rate is 36%'),
  durationDays: z.number()
    .min(7, 'Minimum duration is 7 days')
    .max(365, 'Maximum duration is 365 days'),
  purpose: z.string()
    .min(10, 'Purpose must be at least 10 characters')
    .max(200, 'Purpose must be less than 200 characters'),
  category: z.enum([
    'personal',
    'business',
    'education',
    'home_improvement',
    'debt_consolidation',
    'emergency',
    'other'
  ], {
    required_error: 'Please select a category'
  }),
})

// Loan funding validation
export const loanFundingSchema = z.object({
  amount: z.number()
    .min(50, 'Minimum funding amount is $50')
    .max(50000, 'Maximum funding amount is $50,000'),
  loanRequestId: z.string().uuid('Invalid loan request ID'),
})

// Repayment validation
export const repaymentSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be greater than 0'),
  loanRequestId: z.string().uuid('Invalid loan request ID'),
  installmentNumber: z.number().min(1, 'Invalid installment number'),
})

// Search and filter validation
export const loanSearchSchema = z.object({
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  minInterestRate: z.number().min(0).optional(),
  maxInterestRate: z.number().min(0).optional(),
  category: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['open', 'partially_funded', 'fully_funded']).optional(),
  sortBy: z.enum(['amount', 'interest_rate', 'duration', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Notification validation
export const notificationSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters'),
  type: z.enum(['info', 'success', 'warning', 'error']),
  actionUrl: z.string().url().optional().or(z.literal('')),
})

// Transaction validation
export const transactionSchema = z.object({
  type: z.enum(['funding', 'repayment', 'interest_payment', 'fee']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string()
    .min(5, 'Description must be at least 5 characters')
    .max(200, 'Description must be less than 200 characters'),
  referenceId: z.string().uuid('Invalid reference ID'),
  metadata: z.record(z.any()).optional(),
})

// Credit score validation
export const creditScoreSchema = z.object({
  score: z.number()
    .min(300, 'Credit score must be at least 300')
    .max(850, 'Credit score must be at most 850'),
  factors: z.record(z.any()),
})

// Form validation for login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Password reset validation
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const newPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Export types
export type UserRegistration = z.infer<typeof userRegistrationSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type LoanRequest = z.infer<typeof loanRequestSchema>
export type LoanFunding = z.infer<typeof loanFundingSchema>
export type Repayment = z.infer<typeof repaymentSchema>
export type LoanSearch = z.infer<typeof loanSearchSchema>
export type Notification = z.infer<typeof notificationSchema>
export type Transaction = z.infer<typeof transactionSchema>
export type CreditScore = z.infer<typeof creditScoreSchema>
export type Login = z.infer<typeof loginSchema>
export type PasswordReset = z.infer<typeof passwordResetSchema>
export type NewPassword = z.infer<typeof newPasswordSchema>