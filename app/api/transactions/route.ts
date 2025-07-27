import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    
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
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (type) {
      query = query.eq('type', type)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: transactions, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (type) {
      countQuery = countQuery.eq('type', type)
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    
    const { count } = await countQuery
    
    return NextResponse.json({
      transactions,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      }
    })
    
  } catch (error: any) {
    console.error('Get transactions error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}