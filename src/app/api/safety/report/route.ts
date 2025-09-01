import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ReportReason } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { reporterId, reportedUserId, reason, description } = await request.json()

    // Validation
    if (!reporterId || !reportedUserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const validReasons = Object.values(ReportReason);
    if (!validReasons.includes(reason as ReportReason)) {
      return NextResponse.json(
        { error: `Invalid report reason. Valid reasons are: ${validReasons.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if user is trying to report themselves
    if (reporterId === reportedUserId) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      )
    }

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reporterId)
      .eq('reported_user_id', reportedUserId)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this user' },
        { status: 409 }
      )
    }

    // Create the report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
        description: description?.trim() || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      )
    }

    // Optionally auto-block if it's a serious report
    if (reason === 'harassment' || reason === 'inappropriate_behavior') {
      try {
        await supabase
          .from('blocks')
          .insert({
            blocker_id: reporterId,
            blocked_user_id: reportedUserId,
            reason: `Auto-blocked due to ${reason} report`
          })
      } catch (blockError) {
        console.error('Error auto-blocking user:', blockError)
        // Don't fail the report if auto-block fails
      }
    }

    return NextResponse.json({
      success: true,
      reportId: report.id
    })

  } catch (error) {
    console.error('Error in report API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
