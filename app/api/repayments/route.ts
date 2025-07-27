import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { repaymentSchema } from '@/lib/validations'
import { calculateSimpleInterest, calculateLatePenalty } from '@/utils/calculations'
import { addDays, differenceInDays } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = repaymentSchema.parse(body)
    
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get loan request details
    const { data: loanRequest, error: loanError } = await supabase
      .from('loan_requests')
      .select('*')
      .eq('id', validatedData.loanRequestId)
      .single()
    
    if (loanError || !loanRequest) {
      return NextResponse.json(
        { error: 'Loan request not found' },
        { status: 404 }
      )
    }
    
    // Verify borrower owns this loan
    if (loanRequest.borrower_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to make payments for this loan' },
        { status: 403 }
      )
    }
    
    // Check if loan is funded
    if (loanRequest.status === 'open') {
      return NextResponse.json(
        { error: 'Cannot make payments on unfunded loan' },
        { status: 400 }
      )
    }
    
    // Calculate interest and penalties
    const dueDate = new Date(loanRequest.due_date)
    const paymentDate = new Date()
    const daysLate = differenceInDays(paymentDate, dueDate)
    
    // Calculate interest for this payment period
    const interestAmount = calculateSimpleInterest(
      validatedData.amount,
      loanRequest.interest_rate,
      Math.max(0, daysLate)
    )
    
    // Calculate late penalty if applicable
    const latePenalty = daysLate > 0 ? calculateLatePenalty(validatedData.amount, daysLate) : 0
    
    const totalPayment = validatedData.amount + interestAmount + latePenalty
    const principalAmount = validatedData.amount
    
    // Create repayment record
    const { data: repayment, error: repaymentError } = await supabase
      .from('repayments')
      .insert({
        loan_request_id: validatedData.loanRequestId,
        borrower_id: user.id,
        amount: totalPayment,
        principal_amount: principalAmount,
        interest_amount: interestAmount + latePenalty,
        payment_date: paymentDate.toISOString(),
        due_date: dueDate.toISOString(),
        status: 'completed',
        installment_number: validatedData.installmentNumber,
      })
      .select()
      .single()
    
    if (repaymentError) {
      return NextResponse.json(
        { error: 'Failed to create repayment record' },
        { status: 500 }
      )
    }
    
    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'repayment',
        amount: totalPayment,
        description: `Repayment for loan: ${loanRequest.title}`,
        reference_id: repayment.id,
        status: 'completed',
        metadata: {
          loan_request_id: validatedData.loanRequestId,
          principal_amount: principalAmount,
          interest_amount: interestAmount,
          late_penalty: latePenalty,
          installment_number: validatedData.installmentNumber,
        },
      })
    
    // Update loan status if fully repaid
    const { data: totalRepaid } = await supabase
      .from('repayments')
      .select('amount')
      .eq('loan_request_id', validatedData.loanRequestId)
      .eq('status', 'completed')
    
    const totalRepaidAmount = totalRepaid?.reduce((sum, r) => sum + r.amount, 0) || 0
    const totalLoanAmount = loanRequest.principal_amount + 
      calculateSimpleInterest(loanRequest.principal_amount, loanRequest.interest_rate, loanRequest.duration_days)
    
    if (totalRepaidAmount >= totalLoanAmount) {
      await supabase
        .from('loan_requests')
        .update({
          status: 'settled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', validatedData.loanRequestId)
    }
    
    // Create notification for lenders
    const { data: fundings } = await supabase
      .from('loan_fundings')
      .select('lender_id')
      .eq('loan_request_id', validatedData.loanRequestId)
    
    if (fundings) {
      const notifications = fundings.map(funding => ({
        user_id: funding.lender_id,
        title: 'Payment Received',
        message: `A payment of $${totalPayment.toFixed(2)} has been received for loan "${loanRequest.title}".`,
        type: 'success',
        action_url: `/investments/${validatedData.loanRequestId}`,
      }))
      
      await supabase
        .from('notifications')
        .insert(notifications)
    }
    
    return NextResponse.json({
      message: 'Repayment processed successfully',
      repayment: {
        ...repayment,
        interestAmount,
        latePenalty,
        totalPayment,
      }
    })
    
  } catch (error: any) {
    console.error('Repayment error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const loanId = searchParams.get('loanId')
    
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    let query = supabase
      .from('repayments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (loanId) {
      query = query.eq('loan_request_id', loanId)
    }
    
    // If user is borrower, only show their repayments
    // If user is lender, show repayments for loans they've funded
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userProfile?.role === 'borrower') {
      query = query.eq('borrower_id', user.id)
    } else if (userProfile?.role === 'lender') {
      // Get loans funded by this lender
      const { data: fundedLoans } = await supabase
        .from('loan_fundings')
        .select('loan_request_id')
        .eq('lender_id', user.id)
      
      if (fundedLoans && fundedLoans.length > 0) {
        const loanIds = fundedLoans.map(f => f.loan_request_id)
        query = query.in('loan_request_id', loanIds)
      } else {
        // No funded loans, return empty array
        return NextResponse.json({ repayments: [] })
      }
    }
    
    const { data: repayments, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch repayments' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ repayments })
    
  } catch (error: any) {
    console.error('Get repayments error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}