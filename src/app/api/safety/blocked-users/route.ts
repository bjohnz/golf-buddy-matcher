import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') // 'blocked' or 'blockedBy'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!action || !['blocked', 'blockedBy'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "blocked" or "blockedBy"' },
        { status: 400 }
      )
    }

    let query
    if (action === 'blocked') {
      // Get users that this user has blocked
      query = supabase
        .from('blocks')
        .select(`
          blocked_user_id,
          created_at,
          profiles!blocks_blocked_user_id_fkey (
            id,
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('blocker_id', userId)
    } else {
      // Get users who have blocked this user
      query = supabase
        .from('blocks')
        .select(`
          blocker_id,
          created_at,
          profiles!blocks_blocker_id_fkey (
            id,
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('blocked_user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching blocked users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blocked users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Error in blocked users API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, targetUserId } = await request.json()

    if (!userId || !targetUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if users are blocked
    const { data: blockData, error } = await supabase
      .from('blocks')
      .select('*')
      .or(`blocker_id.eq.${userId},blocked_user_id.eq.${userId}`)
      .or(`blocker_id.eq.${targetUserId},blocked_user_id.eq.${targetUserId}`)

    if (error) {
      console.error('Error checking block status:', error)
      return NextResponse.json(
        { error: 'Failed to check block status' },
        { status: 500 }
      )
    }

    const isBlocked = blockData && blockData.length > 0

    return NextResponse.json({
      success: true,
      isBlocked
    })

  } catch (error) {
    console.error('Error in block check API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
