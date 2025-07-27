import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { loanFundingSchema } from '@/lib/validations'
import { calculateFundingProgress } from '@/utils/calculations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loanFundingSchema.parse(body)
    
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Verify user is a lender
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || userProfile?.role !== 'lender') {
      return NextResponse.json(
        { error: 'Only lenders can fund loans' },
        { status: 403 }
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
    
    // Check if loan is still open for funding
    if (loanRequest.status !== 'open' && loanRequest.status !== 'partially_funded') {
      return NextResponse.json(
        { error: 'Loan is not available for funding' },
        { status: 400 }
      )
    }
    
    // Check if lender is trying to fund their own loan
    if (loanRequest.borrower_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot fund your own loan' },
        { status: 400 }
      )
    }
    
    // Check if funding amount is valid
    const remainingAmount = loanRequest.principal_amount - (loanRequest.funded_amount || 0)
    if (validatedData.amount > remainingAmount) {
      return NextResponse.json(
        { error: `Funding amount exceeds remaining loan amount of $${remainingAmount.toFixed(2)}` },
        { status: 400 }
      )
    }
    
    if (validatedData.amount <= 0) {
      return NextResponse.json(
        { error: 'Funding amount must be greater than 0' },
        { status: 400 }
      )
    }
    
    // Create funding record
    const { data: funding, error: fundingError } = await supabase
      .from('loan_fundings')
      .insert({
        loan_request_id: validatedData.loanRequestId,
        lender_id: user.id,
        amount: validatedData.amount,
        status: 'completed',
      })
      .select()
      .single()
    
    if (fundingError) {
      return NextResponse.json(
        { error: 'Failed to create funding record' },
        { status: 500 }
      )
    }
    
    // Update loan request funded amount and status
    const newFundedAmount = (loanRequest.funded_amount || 0) + validatedData.amount
    const newStatus = newFundedAmount >= loanRequest.principal_amount ? 'fully_funded' : 'partially_funded'
    
    const { error: updateError } = await supabase
      .from('loan_requests')
      .update({
        funded_amount: newFundedAmount,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.loanRequestId)
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update loan request' },
        { status: 500 }
      )
    }
    
    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'funding',
        amount: validatedData.amount,
        description: `Funded loan: ${loanRequest.title}`,
        reference_id: funding.id,
        status: 'completed',
        metadata: {
          loan_request_id: validatedData.loanRequestId,
          borrower_id: loanRequest.borrower_id,
          interest_rate: loanRequest.interest_rate,
        },
      })
    
    // Update lender's total lent amount
    await supabase
      .from('users')
      .update({
        total_lent: (userProfile.total_lent || 0) + validatedData.amount,
      })
      .eq('id', user.id)
    
    // Update borrower's total borrowed amount
    await supabase
      .from('users')
      .update({
        total_borrowed: (loanRequest.borrower?.total_borrowed || 0) + validatedData.amount,
      })
      .eq('id', loanRequest.borrower_id)
    
    // Create notification for borrower
    await supabase
      .from('notifications')
      .insert({
        user_id: loanRequest.borrower_id,
        title: 'Loan Funded',
        message: `Your loan "${loanRequest.title}" has been funded with $${validatedData.amount.toFixed(2)}.`,
        type: 'success',
        action_url: `/loans/${validatedData.loanRequestId}`,
      })
    
    // If loan is fully funded, create notification
    if (newStatus === 'fully_funded') {
      await supabase
        .from('notifications')
        .insert({
          user_id: loanRequest.borrower_id,
          title: 'Loan Fully Funded',
          message: `Congratulations! Your loan "${loanRequest.title}" has been fully funded.`,
          type: 'success',
          action_url: `/loans/${validatedData.loanRequestId}`,
        })
    }
    
    return NextResponse.json({
      message: 'Loan funded successfully',
      funding,
      newStatus,
      fundingProgress: calculateFundingProgress(newFundedAmount, loanRequest.principal_amount)
    })
    
  } catch (error: any) {
    console.error('Fund loan error:', error)
    
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