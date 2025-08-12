import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { blockerId, blockedUserId } = await request.json()

    // Validation
    if (!blockerId || !blockedUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is trying to block themselves
    if (blockerId === blockedUserId) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      )
    }

    // Check if already blocked
    const { data: existingBlock } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_user_id', blockedUserId)
      .single()

    if (existingBlock) {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 409 }
      )
    }

    // Start a transaction to block user and remove matches
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .insert({
        blocker_id: blockerId,
        blocked_user_id: blockedUserId
      })
      .select()
      .single()

    if (blockError) {
      console.error('Error creating block:', blockError)
      return NextResponse.json(
        { error: 'Failed to block user' },
        { status: 500 }
      )
    }

    // Remove any existing matches between the users
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .or(`user1_id.eq.${blockerId},user2_id.eq.${blockerId}`)
      .or(`user1_id.eq.${blockedUserId},user2_id.eq.${blockedUserId}`)

    if (matchError) {
      console.error('Error removing matches:', matchError)
      // Don't fail the block if match removal fails
    }

    return NextResponse.json({
      success: true,
      blockId: block.id
    })

  } catch (error) {
    console.error('Error in block API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { blockerId, blockedUserId } = await request.json()

    if (!blockerId || !blockedUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_user_id', blockedUserId)

    if (error) {
      console.error('Error removing block:', error)
      return NextResponse.json(
        { error: 'Failed to unblock user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in unblock API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
