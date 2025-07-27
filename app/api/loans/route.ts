import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { loanRequestSchema, loanSearchSchema } from '@/lib/validations'
import { calculateRiskLevel, validateLoanAmount, validateInterestRate, validateDuration } from '@/utils/calculations'
import { addDays } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loanRequestSchema.parse(body)
    
    // Additional validation
    if (!validateLoanAmount(validatedData.principalAmount)) {
      return NextResponse.json(
        { error: 'Invalid loan amount' },
        { status: 400 }
      )
    }
    
    if (!validateInterestRate(validatedData.interestRate)) {
      return NextResponse.json(
        { error: 'Invalid interest rate' },
        { status: 400 }
      )
    }
    
    if (!validateDuration(validatedData.durationDays)) {
      return NextResponse.json(
        { error: 'Invalid duration' },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, credit_score')
      .eq('id', user.id)
      .single()
    
    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }
    
    if (userProfile.role !== 'borrower') {
      return NextResponse.json(
        { error: 'Only borrowers can create loan requests' },
        { status: 403 }
      )
    }
    
    // Calculate risk level
    const riskLevel = calculateRiskLevel(
      userProfile.credit_score || 650,
      validatedData.principalAmount,
      validatedData.durationDays
    )
    
    // Calculate due date
    const dueDate = addDays(new Date(), validatedData.durationDays)
    
    // Create loan request
    const { data: loanRequest, error: loanError } = await supabase
      .from('loan_requests')
      .insert({
        borrower_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        principal_amount: validatedData.principalAmount,
        interest_rate: validatedData.interestRate,
        duration_days: validatedData.durationDays,
        purpose: validatedData.purpose,
        category: validatedData.category,
        risk_level: riskLevel,
        status: 'open',
        funded_amount: 0,
        due_date: dueDate.toISOString(),
      })
      .select()
      .single()
    
    if (loanError) {
      return NextResponse.json(
        { error: 'Failed to create loan request' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Loan request created successfully',
        loanRequest 
      },
      { status: 201 }
    )
    
  } catch (error: any) {
    console.error('Create loan error:', error)
    
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
    const query = Object.fromEntries(searchParams.entries())
    
    // Validate search parameters
    const validatedQuery = loanSearchSchema.parse(query)
    
    const supabase = createServerSupabaseClient()
    
    // Build query
    let queryBuilder = supabase
      .from('loan_requests')
      .select(`
        *,
        borrower:users!loan_requests_borrower_id_fkey (
          id,
          first_name,
          last_name,
          credit_score
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (validatedQuery.minAmount) {
      queryBuilder = queryBuilder.gte('principal_amount', validatedQuery.minAmount)
    }
    
    if (validatedQuery.maxAmount) {
      queryBuilder = queryBuilder.lte('principal_amount', validatedQuery.maxAmount)
    }
    
    if (validatedQuery.minInterestRate) {
      queryBuilder = queryBuilder.gte('interest_rate', validatedQuery.minInterestRate)
    }
    
    if (validatedQuery.maxInterestRate) {
      queryBuilder = queryBuilder.lte('interest_rate', validatedQuery.maxInterestRate)
    }
    
    if (validatedQuery.category) {
      queryBuilder = queryBuilder.eq('category', validatedQuery.category)
    }
    
    if (validatedQuery.riskLevel) {
      queryBuilder = queryBuilder.eq('risk_level', validatedQuery.riskLevel)
    }
    
    if (validatedQuery.status) {
      queryBuilder = queryBuilder.eq('status', validatedQuery.status)
    }
    
    // Apply sorting
    if (validatedQuery.sortBy) {
      const sortOrder = validatedQuery.sortOrder || 'desc'
      queryBuilder = queryBuilder.order(validatedQuery.sortBy, { ascending: sortOrder === 'asc' })
    }
    
    const { data: loanRequests, error } = await queryBuilder
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch loan requests' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ loanRequests })
    
  } catch (error: any) {
    console.error('Fetch loans error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}