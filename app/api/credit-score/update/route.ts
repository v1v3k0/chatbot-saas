import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { calculateCreditScore } from '@/utils/calculations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseClient()
    
    // Get user's repayment history
    const { data: repayments, error: repaymentError } = await supabase
      .from('repayments')
      .select('*')
      .eq('borrower_id', userId)
      .order('created_at', { ascending: false })
    
    if (repaymentError) {
      return NextResponse.json(
        { error: 'Failed to fetch repayment history' },
        { status: 500 }
      )
    }
    
    // Get user's loan history
    const { data: loans, error: loanError } = await supabase
      .from('loan_requests')
      .select('*')
      .eq('borrower_id', userId)
    
    if (loanError) {
      return NextResponse.json(
        { error: 'Failed to fetch loan history' },
        { status: 500 }
      )
    }
    
    // Get user's lending history
    const { data: fundings, error: fundingError } = await supabase
      .from('loan_fundings')
      .select('*')
      .eq('lender_id', userId)
    
    if (fundingError) {
      return NextResponse.json(
        { error: 'Failed to fetch lending history' },
        { status: 500 }
      )
    }
    
    // Calculate credit score
    const creditScore = calculateCreditScore(
      repayments || [],
      loans?.reduce((sum, loan) => sum + loan.principal_amount, 0) || 0,
      fundings?.reduce((sum, funding) => sum + funding.amount, 0) || 0,
      loans?.length || 0
    )
    
    // Determine credit score factors
    const factors = {
      repaymentHistory: repayments?.filter(r => r.status === 'completed').length || 0,
      totalLoans: loans?.length || 0,
      totalBorrowed: loans?.reduce((sum, loan) => sum + loan.principal_amount, 0) || 0,
      totalLent: fundings?.reduce((sum, funding) => sum + funding.amount, 0) || 0,
      onTimePayments: repayments?.filter(r => 
        r.status === 'completed' && 
        new Date(r.payment_date) <= new Date(r.due_date)
      ).length || 0,
      latePayments: repayments?.filter(r => 
        r.status === 'completed' && 
        new Date(r.payment_date) > new Date(r.due_date)
      ).length || 0,
    }
    
    // Update credit score
    const { data: updatedCreditScore, error: updateError } = await supabase
      .from('credit_scores')
      .upsert({
        user_id: userId,
        score: creditScore,
        factors,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update credit score' },
        { status: 500 }
      )
    }
    
    // Update user's credit score in users table
    await supabase
      .from('users')
      .update({ credit_score: creditScore })
      .eq('id', userId)
    
    return NextResponse.json({
      message: 'Credit score updated successfully',
      creditScore: updatedCreditScore
    })
    
  } catch (error: any) {
    console.error('Update credit score error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}