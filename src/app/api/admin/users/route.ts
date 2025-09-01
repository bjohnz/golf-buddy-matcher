import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || 'all'

    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        location,
        is_active,
        is_banned,
        is_verified,
        last_active,
        created_at,
        (
          SELECT COUNT(*) FROM reports WHERE reported_user_id = profiles.id
        ) as report_count
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status === 'banned') {
      query = query.eq('is_banned', true)
    } else if (status === 'active') {
      query = query.eq('is_active', true).eq('is_banned', false)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('id', { count: 'exact' })

    if (status === 'banned') {
      countQuery = countQuery.eq('is_banned', true)
    } else if (status === 'active') {
      countQuery = countQuery.eq('is_active', true).eq('is_banned', false)
    } else if (status === 'inactive') {
      countQuery = countQuery.eq('is_active', false)
    }

    const { count } = await countQuery

    return NextResponse.json({
      success: true,
      data: users || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, action, reason } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['ban', 'unban', 'suspend', 'activate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    let updateData: {
      is_banned?: boolean;
      is_active?: boolean;
      updated_at: string;
    } = { updated_at: new Date().toISOString() }
    let logMessage = ''

    switch (action) {
      case 'ban':
        updateData = { ...updateData, is_banned: true, is_active: false }
        logMessage = `User banned${reason ? `: ${reason}` : ''}`
        break
      case 'unban':
        updateData = { ...updateData, is_banned: false, is_active: true }
        logMessage = 'User unbanned'
        break
      case 'suspend':
        updateData = { ...updateData, is_active: false }
        logMessage = `User suspended${reason ? `: ${reason}` : ''}`
        break
      case 'activate':
        updateData = { ...updateData, is_active: true, is_banned: false }
        logMessage = 'User activated'
        break
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Log the admin action
    try {
      await supabase
        .from('profile_update_logs')
        .insert({
          profile_id: userId,
          field_name: action,
          old_value: action === 'ban' ? 'active' : 'banned',
          new_value: action === 'ban' ? 'banned' : 'active',
          updated_by: 'admin', // TODO: Get actual admin user ID
          updated_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Error logging admin action:', logError)
      // Don't fail the main operation if logging fails
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: logMessage
    })

  } catch (error) {
    console.error('Error in admin user update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
