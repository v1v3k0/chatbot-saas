import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get loan request with borrower details
    const { data: loanRequest, error: loanError } = await supabase
      .from('loan_requests')
      .select(`
        *,
        borrower:users!loan_requests_borrower_id_fkey (
          id,
          first_name,
          last_name,
          credit_score,
          total_borrowed
        ),
        fundings:loan_fundings (
          id,
          amount,
          created_at,
          lender:users!loan_fundings_lender_id_fkey (
            id,
            first_name,
            last_name
          )
        ),
        repayments (
          id,
          amount,
          principal_amount,
          interest_amount,
          payment_date,
          due_date,
          status,
          installment_number
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (loanError || !loanRequest) {
      return NextResponse.json(
        { error: 'Loan request not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ loanRequest })
    
  } catch (error: any) {
    console.error('Get loan error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get loan request to check ownership
    const { data: existingLoan, error: loanError } = await supabase
      .from('loan_requests')
      .select('borrower_id, status')
      .eq('id', params.id)
      .single()
    
    if (loanError || !existingLoan) {
      return NextResponse.json(
        { error: 'Loan request not found' },
        { status: 404 }
      )
    }
    
    // Only borrower can update their own loan
    if (existingLoan.borrower_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this loan' },
        { status: 403 }
      )
    }
    
    // Only allow updates if loan is still open
    if (existingLoan.status !== 'open') {
      return NextResponse.json(
        { error: 'Cannot update loan that is not open' },
        { status: 400 }
      )
    }
    
    // Update loan request
    const { data: updatedLoan, error: updateError } = await supabase
      .from('loan_requests')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update loan request' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Loan request updated successfully',
      loanRequest: updatedLoan
    })
    
  } catch (error: any) {
    console.error('Update loan error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get loan request to check ownership
    const { data: existingLoan, error: loanError } = await supabase
      .from('loan_requests')
      .select('borrower_id, status, funded_amount')
      .eq('id', params.id)
      .single()
    
    if (loanError || !existingLoan) {
      return NextResponse.json(
        { error: 'Loan request not found' },
        { status: 404 }
      )
    }
    
    // Only borrower can delete their own loan
    if (existingLoan.borrower_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this loan' },
        { status: 403 }
      )
    }
    
    // Cannot delete if already funded
    if (existingLoan.funded_amount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete loan that has been funded' },
        { status: 400 }
      )
    }
    
    // Delete loan request
    const { error: deleteError } = await supabase
      .from('loan_requests')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete loan request' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Loan request deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Delete loan error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}