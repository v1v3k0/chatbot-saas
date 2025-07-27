import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { userRegistrationSchema } from '@/lib/validations'
import { calculateCreditScore } from '@/utils/calculations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = userRegistrationSchema.parse(body)
    
    const supabase = createServerSupabaseClient()
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    })
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
    
    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        role: validatedData.role,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        phone: validatedData.phone || null,
        credit_score: 650, // Default credit score for new users
        total_borrowed: 0,
        total_lent: 0,
      })
    
    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }
    
    // Create initial credit score record
    await supabase
      .from('credit_scores')
      .insert({
        user_id: authData.user.id,
        score: 650,
        factors: {
          repayment_history: [],
          loan_volume: 0,
          loan_diversity: 0,
          lending_activity: 0,
        },
      })
    
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: authData.user.id,
          email: validatedData.email,
          role: validatedData.role,
        }
      },
      { status: 201 }
    )
    
  } catch (error: any) {
    console.error('Registration error:', error)
    
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