import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { userProfileSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
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
    
    // Get user profile with credit score
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        credit_scores (
          score,
          factors,
          last_updated
        )
      `)
      .eq('id', user.id)
      .single()
    
    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user: userProfile })
    
  } catch (error: any) {
    console.error('Get profile error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = userProfileSchema.parse(body)
    
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedProfile
    })
    
  } catch (error: any) {
    console.error('Update profile error:', error)
    
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