import { Message, MatchWithProfile, ChatMessage, UserProfile } from '@/types'

// Sample messages for development
const sampleMessages: Message[] = [
  {
    id: '1',
    match_id: 'match-1',
    sender_id: '1',
    content: 'Hey! I saw we matched. Would you be interested in playing a round this weekend?',
    created_at: '2024-01-15T10:30:00Z',
    is_read: true
  },
  {
    id: '2',
    match_id: 'match-1',
    sender_id: 'current-user-id',
    content: 'Absolutely! I\'d love to. What course were you thinking?',
    created_at: '2024-01-15T10:35:00Z',
    is_read: true
  },
  {
    id: '3',
    match_id: 'match-1',
    sender_id: '1',
    content: 'I was thinking Harding Park. I have a tee time available for Saturday morning at 8 AM.',
    created_at: '2024-01-15T10:40:00Z',
    is_read: false
  }
]

// Check if we're in development mode
const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' ||
                         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key-here'

export class MessagingService {
  // Get all matches with profile info and last message
  static async getMatchesWithProfiles(userId: string): Promise<MatchWithProfile[]> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Using sample matches for development')
        return this.getSampleMatchesWithProfiles(userId)
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using sample data')
      return this.getSampleMatchesWithProfiles(userId)
    } catch (error) {
      console.error('Error getting matches with profiles:', error)
      return []
    }
  }

  // Get sample matches with profiles for development
  private static getSampleMatchesWithProfiles(userId: string): MatchWithProfile[] {
    const sampleProfiles: UserProfile[] = [
      {
        id: '1',
        email: 'sarah@example.com',
        full_name: 'Sarah Johnson',
        avatar_url: '',
        bio: 'Love playing early morning rounds and looking for consistent golf partners.',
        handicap: 15,
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        preferred_times: ['early_morning', 'morning', 'weekends_only'],
        photos: [],
        is_active: true,
        is_banned: false,
        show_distance: true,
        show_online_status: true,
        notification_preferences: {
          new_matches: true,
          new_messages: true,
          profile_views: true
        },
        // Enhanced profile fields
        home_course: 'Harding Park Golf Course',
        favorite_courses: ['Harding Park Golf Course', 'Presidio Golf Course', 'Lincoln Park Golf Course'],
        playing_style: 'casual',
        pace_of_play: 'moderate',
        preferred_group_size: 'twosome',
        avg_rating: 4.2,
        total_rounds: 8,
        total_ratings: 6,
        is_verified: true,
        last_active: new Date().toISOString(),
        // Subscription fields
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_plan_id: 'premium-monthly',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        email: 'mike@example.com',
        full_name: 'Mike Chen',
        avatar_url: '',
        bio: 'Scratch golfer who enjoys helping others improve their game.',
        handicap: 0,
        location: 'Oakland, CA',
        latitude: 37.8044,
        longitude: -122.2711,
        preferred_times: ['afternoon', 'evening', 'weekends_only'],
        photos: [],
        is_active: true,
        is_banned: false,
        show_distance: true,
        show_online_status: true,
        notification_preferences: {
          new_matches: true,
          new_messages: true,
          profile_views: true
        },
        // Enhanced profile fields
        home_course: 'Metropolitan Golf Links',
        favorite_courses: ['Metropolitan Golf Links', 'Lake Chabot Golf Course', 'Skywest Golf Course'],
        playing_style: 'competitive',
        pace_of_play: 'fast',
        preferred_group_size: 'flexible',
        avg_rating: 4.8,
        total_rounds: 15,
        total_ratings: 12,
        is_verified: true,
        last_active: new Date().toISOString(),
        // Subscription fields
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_plan_id: 'premium-monthly',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    return [
      {
        match: {
          id: 'match-1',
          user1_id: 'current-user-id',
          user2_id: '1',
          created_at: '2024-01-10T00:00:00Z',
          is_active: true
        },
        profile: sampleProfiles[0],
        lastMessage: sampleMessages[2], // Latest message
        unreadCount: 1
      },
      {
        match: {
          id: 'match-2',
          user1_id: 'current-user-id',
          user2_id: '2',
          created_at: '2024-01-12T00:00:00Z',
          is_active: true
        },
        profile: sampleProfiles[1],
        lastMessage: undefined,
        unreadCount: 0
      }
    ]
  }

  // Get messages for a specific match
  static async getMessages(matchId: string, userId: string): Promise<ChatMessage[]> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Using sample messages for development')
        return this.getSampleChatMessages(matchId, userId)
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using sample data')
      return this.getSampleChatMessages(matchId, userId)
    } catch (error) {
      console.error('Error getting messages:', error)
      return []
    }
  }

  // Get sample chat messages for development
  private static getSampleChatMessages(matchId: string, userId: string): ChatMessage[] {
    const matchMessages = sampleMessages.filter(msg => msg.match_id === matchId)
    
    return matchMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.sender_id === '1' ? 'Sarah Johnson' : 'You',
      timestamp: msg.created_at,
      isOwn: msg.sender_id === userId,
      isRead: msg.is_read
    }))
  }

  // Send a new message
  static async sendMessage(
    matchId: string, 
    senderId: string, 
    content: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Mock message sent:', { matchId, senderId, content })
        // Add to sample messages
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          match_id: matchId,
          sender_id: senderId,
          content,
          created_at: new Date().toISOString(),
          is_read: false
        }
        sampleMessages.push(newMessage)
        return { success: true, messageId: newMessage.id }
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return { success: true, messageId: `mock-${Date.now()}` }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false }
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(matchId: string, userId: string): Promise<boolean> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Marking messages as read for development')
        // Update sample messages
        sampleMessages.forEach(msg => {
          if (msg.match_id === matchId && msg.sender_id !== userId) {
            msg.is_read = true
          }
        })
        return true
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return true
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return false
    }
  }

  // Get unread message count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Getting unread count for development')
        return sampleMessages.filter(msg => 
          msg.sender_id !== userId && !msg.is_read
        ).length
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
} 