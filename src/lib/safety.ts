import { Report, BlockedUser, ReportReason } from '@/types'

// Sample data for development
const sampleReports: Report[] = []
const sampleBlockedUsers: BlockedUser[] = []

// Check if we're in development mode
const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' ||
                         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key-here'

export class SafetyService {
  // Report a user
  static async reportUser(
    reporterId: string,
    reportedUserId: string,
    reason: ReportReason,
    description?: string
  ): Promise<{ success: boolean; reportId?: string }> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Mock report created:', { reporterId, reportedUserId, reason, description })
        const report: Report = {
          id: `report-${Date.now()}`,
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          reason,
          description,
          created_at: new Date().toISOString(),
          status: 'pending'
        }
        sampleReports.push(report)
        return { success: true, reportId: report.id }
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return { success: true, reportId: `mock-report-${Date.now()}` }
    } catch (error) {
      console.error('Error reporting user:', error)
      return { success: false }
    }
  }

  // Block a user
  static async blockUser(
    blockerId: string,
    blockedUserId: string
  ): Promise<{ success: boolean; blockId?: string }> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Mock user blocked:', { blockerId, blockedUserId })
        const block: BlockedUser = {
          id: `block-${Date.now()}`,
          blocker_id: blockerId,
          blocked_user_id: blockedUserId,
          created_at: new Date().toISOString()
        }
        sampleBlockedUsers.push(block)
        return { success: true, blockId: block.id }
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return { success: true, blockId: `mock-block-${Date.now()}` }
    } catch (error) {
      console.error('Error blocking user:', error)
      return { success: false }
    }
  }

  // Unblock a user
  static async unblockUser(
    blockerId: string,
    blockedUserId: string
  ): Promise<boolean> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Mock user unblocked:', { blockerId, blockedUserId })
        const index = sampleBlockedUsers.findIndex(
          block => block.blocker_id === blockerId && block.blocked_user_id === blockedUserId
        )
        if (index !== -1) {
          sampleBlockedUsers.splice(index, 1)
        }
        return true
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return true
    } catch (error) {
      console.error('Error unblocking user:', error)
      return false
    }
  }

  // Check if a user is blocked
  static async isUserBlocked(
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Checking if user is blocked for development')
        return sampleBlockedUsers.some(
          block => 
            (block.blocker_id === userId && block.blocked_user_id === targetUserId) ||
            (block.blocker_id === targetUserId && block.blocked_user_id === userId)
        )
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return false
    } catch (error) {
      console.error('Error checking if user is blocked:', error)
      return false
    }
  }

  // Get blocked users for a user
  static async getBlockedUsers(userId: string): Promise<string[]> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Getting blocked users for development')
        return sampleBlockedUsers
          .filter(block => block.blocker_id === userId)
          .map(block => block.blocked_user_id)
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return []
    } catch (error) {
      console.error('Error getting blocked users:', error)
      return []
    }
  }

  // Get users who have blocked the current user
  static async getUsersWhoBlockedMe(userId: string): Promise<string[]> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Getting users who blocked me for development')
        return sampleBlockedUsers
          .filter(block => block.blocked_user_id === userId)
          .map(block => block.blocker_id)
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return []
    } catch (error) {
      console.error('Error getting users who blocked me:', error)
      return []
    }
  }

  // Get report reasons with labels
  static getReportReasons(): { value: ReportReason; label: string; description: string }[] {
    return [
      {
        value: ReportReason.INAPPROPRIATE_BEHAVIOR,
        label: 'Inappropriate Behavior',
        description: 'Offensive, threatening, or inappropriate conduct'
      },
      {
        value: ReportReason.FAKE_PROFILE,
        label: 'Fake Profile',
        description: 'Fake photos, false information, or impersonation'
      },
      {
        value: ReportReason.HARASSMENT,
        label: 'Harassment',
        description: 'Repeated unwanted contact or harassment'
      },
      {
        value: ReportReason.SPAM,
        label: 'Spam',
        description: 'Unwanted commercial messages or spam'
      },
      {
        value: ReportReason.OTHER,
        label: 'Other',
        description: 'Other violations of our community guidelines'
      }
    ]
  }
} 