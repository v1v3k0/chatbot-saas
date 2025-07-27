import { addDays, differenceInDays, isAfter, isBefore } from 'date-fns'

// Interest calculation functions
export const calculateSimpleInterest = (
  principal: number,
  rate: number,
  days: number
): number => {
  return (principal * rate * days) / (100 * 365)
}

export const calculateTotalInterest = (
  principal: number,
  rate: number,
  durationDays: number
): number => {
  return calculateSimpleInterest(principal, rate, durationDays)
}

export const calculateTotalAmount = (
  principal: number,
  interest: number
): number => {
  return principal + interest
}

export const calculateMonthlyPayment = (
  principal: number,
  interestRate: number,
  durationMonths: number
): number => {
  const monthlyRate = interestRate / (12 * 100)
  if (monthlyRate === 0) return principal / durationMonths
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
    (Math.pow(1 + monthlyRate, durationMonths) - 1)
  )
}

// Repayment calculations
export const calculateRepaymentSchedule = (
  principal: number,
  interestRate: number,
  durationDays: number,
  startDate: Date,
  installments: number = 1
): Array<{
  installmentNumber: number
  dueDate: Date
  principalAmount: number
  interestAmount: number
  totalAmount: number
}> => {
  const schedule = []
  const principalPerInstallment = principal / installments
  const daysPerInstallment = Math.floor(durationDays / installments)
  
  for (let i = 1; i <= installments; i++) {
    const dueDate = addDays(startDate, i * daysPerInstallment)
    const interestAmount = calculateSimpleInterest(
      principalPerInstallment,
      interestRate,
      daysPerInstallment
    )
    
    schedule.push({
      installmentNumber: i,
      dueDate,
      principalAmount: principalPerInstallment,
      interestAmount,
      totalAmount: principalPerInstallment + interestAmount
    })
  }
  
  return schedule
}

// Late payment penalty calculation
export const calculateLatePenalty = (
  amount: number,
  daysLate: number,
  penaltyRate: number = 5 // 5% per month default
): number => {
  if (daysLate <= 0) return 0
  
  const monthsLate = daysLate / 30
  return (amount * penaltyRate * monthsLate) / 100
}

// Credit score calculation
export const calculateCreditScore = (
  repaymentHistory: Array<{
    dueDate: Date
    paidDate: Date | null
    amount: number
  }>,
  totalBorrowed: number,
  totalLent: number,
  loanCount: number
): number => {
  let score = 300 // Base score
  
  // Repayment history (40% weight)
  const onTimePayments = repaymentHistory.filter(
    payment => payment.paidDate && !isAfter(payment.paidDate, payment.dueDate)
  ).length
  const totalPayments = repaymentHistory.length
  
  if (totalPayments > 0) {
    const onTimeRate = onTimePayments / totalPayments
    score += onTimeRate * 200 // Up to 200 points for perfect repayment
  }
  
  // Loan volume (20% weight)
  const volumeScore = Math.min(totalBorrowed / 10000, 1) * 100 // Up to 100 points
  score += volumeScore
  
  // Loan diversity (15% weight)
  const diversityScore = Math.min(loanCount / 10, 1) * 75 // Up to 75 points
  score += diversityScore
  
  // Lending activity (15% weight)
  const lendingScore = Math.min(totalLent / 5000, 1) * 75 // Up to 75 points
  score += lendingScore
  
  // Age factor (10% weight)
  score += 50 // Base age points
  
  return Math.min(Math.max(score, 300), 850) // Clamp between 300-850
}

// Risk level calculation
export const calculateRiskLevel = (
  creditScore: number,
  loanAmount: number,
  durationDays: number
): 'low' | 'medium' | 'high' => {
  let riskScore = 0
  
  // Credit score factor
  if (creditScore >= 750) riskScore += 0
  else if (creditScore >= 650) riskScore += 1
  else if (creditScore >= 550) riskScore += 2
  else riskScore += 3
  
  // Loan amount factor
  if (loanAmount <= 1000) riskScore += 0
  else if (loanAmount <= 5000) riskScore += 1
  else if (loanAmount <= 10000) riskScore += 2
  else riskScore += 3
  
  // Duration factor
  if (durationDays <= 30) riskScore += 0
  else if (durationDays <= 90) riskScore += 1
  else if (durationDays <= 180) riskScore += 2
  else riskScore += 3
  
  if (riskScore <= 2) return 'low'
  if (riskScore <= 5) return 'medium'
  return 'high'
}

// Funding progress calculation
export const calculateFundingProgress = (
  fundedAmount: number,
  requestedAmount: number
): number => {
  if (requestedAmount === 0) return 0
  return Math.min((fundedAmount / requestedAmount) * 100, 100)
}

// ROI calculation for lenders
export const calculateROI = (
  investedAmount: number,
  totalInterestEarned: number,
  durationDays: number
): number => {
  if (investedAmount === 0 || durationDays === 0) return 0
  const annualizedROI = (totalInterestEarned / investedAmount) * (365 / durationDays) * 100
  return Math.round(annualizedROI * 100) / 100
}

// Validation functions
export const validateLoanAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 50000 // Max $50,000
}

export const validateInterestRate = (rate: number): boolean => {
  return rate >= 1 && rate <= 36 // 1% to 36% APR
}

export const validateDuration = (days: number): boolean => {
  return days >= 7 && days <= 365 // 7 days to 1 year
}

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`
}

// Date utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export const getDaysUntilDue = (dueDate: Date): number => {
  const today = new Date()
  return differenceInDays(dueDate, today)
}