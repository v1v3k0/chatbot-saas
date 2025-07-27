import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
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
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (unreadOnly) {
      query = query.eq('read', false)
    }
    
    const { data: notifications, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }
    
    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
    
    return NextResponse.json({
      notifications,
      unreadCount: unreadCount || 0,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit,
      }
    })
    
  } catch (error: any) {
    console.error('Get notifications error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds, read } = body
    
    if (!Array.isArray(notificationIds) || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
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
    
    // Update notifications
    const { error } = await supabase
      .from('notifications')
      .update({ read, read_at: read ? new Date().toISOString() : null })
      .in('id', notificationIds)
      .eq('user_id', user.id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update notifications' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Notifications updated successfully'
    })
    
  } catch (error: any) {
    console.error('Update notifications error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}