import { UserProfile, Swipe, Match, MatchingPreferences } from '@/types'
import { calculateDistance } from './utils'
import { SafetyService } from './safety'
import { RatingService } from './ratings'

// Sample data for development when Supabase is not configured
const sampleProfiles: UserProfile[] = [
  {
    id: '1',
    email: 'sarah@example.com',
    full_name: 'Sarah Johnson',
    avatar_url: '',
    bio: 'Love playing early morning rounds and looking for consistent golf partners. Prefer casual, friendly games over competitive play.',
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
    bio: 'Scratch golfer who enjoys helping others improve their game. Available for weekend rounds and occasional weekday evenings.',
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
  },
  {
    id: '3',
    email: 'david@example.com',
    full_name: 'David Wilson',
    avatar_url: '',
    bio: 'Intermediate golfer looking to break 90 consistently. Prefer morning rounds and patient playing partners.',
    handicap: 18,
    location: 'Berkeley, CA',
    latitude: 37.8716,
    longitude: -122.2727,
    preferred_times: ['morning', 'weekends_only'],
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
    home_course: 'Tilden Park Golf Course',
    favorite_courses: ['Tilden Park Golf Course', 'Chabot Golf Course'],
    playing_style: 'beginner_friendly',
    pace_of_play: 'relaxed',
    preferred_group_size: 'twosome',
    avg_rating: 3.9,
    total_rounds: 5,
    total_ratings: 4,
    is_verified: false,
    last_active: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    // Subscription fields
    subscription_tier: 'free',
    subscription_status: 'active',
    subscription_expires_at: undefined,
    subscription_plan_id: 'free',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    email: 'emma@example.com',
    full_name: 'Emma Rodriguez',
    avatar_url: '',
    bio: 'New to golf but passionate about learning! Looking for patient partners who don\'t mind playing with beginners.',
    handicap: 25,
    location: 'San Jose, CA',
    latitude: 37.3382,
    longitude: -121.8863,
    preferred_times: ['afternoon', 'weekends_only'],
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
    home_course: 'Santa Teresa Golf Club',
    favorite_courses: ['Santa Teresa Golf Club', 'Cinnabar Hills Golf Club'],
    playing_style: 'beginner_friendly',
    pace_of_play: 'relaxed',
    preferred_group_size: 'twosome',
    avg_rating: 0,
    total_rounds: 0,
    total_ratings: 0,
    is_verified: false,
    last_active: new Date().toISOString(),
    // Subscription fields
    subscription_tier: 'free',
    subscription_status: 'active',
    subscription_expires_at: undefined,
    subscription_plan_id: 'free',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    email: 'james@example.com',
    full_name: 'James Thompson',
    avatar_url: '',
    bio: 'Experienced golfer who loves the social aspect of the game. Always up for a friendly round and good conversation.',
    handicap: 8,
    location: 'Palo Alto, CA',
    latitude: 37.4419,
    longitude: -122.1430,
    preferred_times: ['morning', 'afternoon', 'weekends_only'],
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
    home_course: 'Stanford Golf Course',
    favorite_courses: ['Stanford Golf Course', 'Sharon Heights Golf & Country Club', 'Palo Alto Municipal Golf Course'],
    playing_style: 'casual',
    pace_of_play: 'moderate',
    preferred_group_size: 'foursome',
    avg_rating: 4.5,
    total_rounds: 12,
    total_ratings: 10,
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

// Check if we're in development mode without proper Supabase config
const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' ||
                         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key-here'

export class MatchingService {
  // Find potential matches for a user
  static async findPotentialMatches(
    userId: string,
    userProfile: UserProfile,
    preferences: MatchingPreferences,
    searchRadius: number
  ): Promise<UserProfile[]> {
    if (isDevelopmentMode) {
      // Filter sample profiles based on preferences
      let filteredProfiles = sampleProfiles.filter(profile => {
        // Skip if it's the same user
        if (profile.id === userId) return false

        // Calculate distance
        const distance = calculateDistance(
          userProfile.latitude,
          userProfile.longitude,
          profile.latitude,
          profile.longitude
        )

        // Check distance filter
        if (distance > preferences.maxDistance) return false

        // Check handicap compatibility
        if (profile.handicap < preferences.handicapRange.min || profile.handicap > preferences.handicapRange.max) return false

        // Check playing style filter
        if (preferences.playingStyle && profile.playing_style !== preferences.playingStyle) return false

        // Check pace of play filter
        if (preferences.paceOfPlay && profile.pace_of_play !== preferences.paceOfPlay) return false

        // Check group size filter
        if (preferences.groupSize && profile.preferred_group_size !== preferences.groupSize) return false

        // Check verified users filter
        if (preferences.onlyVerified && !profile.is_verified) return false

        // Check minimum rating filter
        if (preferences.minRating && (profile.avg_rating || 0) < preferences.minRating) return false

        return true
      })

      // Apply priority placement for premium users
      filteredProfiles = this.applyPriorityPlacement(filteredProfiles, userId)

      // Sort by verification status, rating, and activity
      filteredProfiles.sort((a, b) => {
        // Premium users get priority placement
        const aIsPremium = this.isPremiumUser(a.id)
        const bIsPremium = this.isPremiumUser(b.id)
        
        if (aIsPremium && !bIsPremium) return -1
        if (!aIsPremium && bIsPremium) return 1

        // Then by verification status
        if (a.is_verified && !b.is_verified) return -1
        if (!a.is_verified && b.is_verified) return 1

        // Then by average rating
        const ratingDiff = (b.avg_rating || 0) - (a.avg_rating || 0)
        if (ratingDiff !== 0) return ratingDiff

        // Then by total rounds (more active users)
        return (b.total_rounds || 0) - (a.total_rounds || 0)
      })

      return filteredProfiles
    }

    try {
      const response = await fetch('/api/matching/potential-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userProfile,
          preferences,
          searchRadius
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch potential matches')
      }

      return await response.json()
    } catch (error) {
      console.error('Error finding potential matches:', error)
      return []
    }
  }

  // Apply priority placement for premium users
  private static applyPriorityPlacement(profiles: UserProfile[], currentUserId: string): UserProfile[] {
    // Check if current user is premium
    const currentUserIsPremium = this.isPremiumUser(currentUserId)
    
    if (!currentUserIsPremium) {
      // For free users, premium profiles get priority placement
      return profiles.sort((a, b) => {
        const aIsPremium = this.isPremiumUser(a.id)
        const bIsPremium = this.isPremiumUser(b.id)
        
        if (aIsPremium && !bIsPremium) return -1
        if (!aIsPremium && bIsPremium) return 1
        return 0
      })
    }

    // For premium users, other premium users get priority placement
    return profiles.sort((a, b) => {
      const aIsPremium = this.isPremiumUser(a.id)
      const bIsPremium = this.isPremiumUser(b.id)
      
      if (aIsPremium && !bIsPremium) return -1
      if (!aIsPremium && bIsPremium) return 1
      return 0
    })
  }

  // Check if a user is premium (mock implementation)
  private static isPremiumUser(userId: string): boolean {
    // Mock premium users for development - using the actual sample profile IDs
    const premiumUserIds = ['1', '2', '5'] // Sarah, Mike, and James are premium
    return premiumUserIds.includes(userId)
  }

  // Process a swipe (like or pass)
  static async processSwipe(
    userId: string,
    targetUserId: string,
    isLike: boolean
  ): Promise<{ success: boolean; isMatch?: boolean; matchId?: string }> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Mock swipe processed:', { userId, targetUserId, isLike })
        const isMatch = isLike && Math.random() < 0.2
        return { success: true, isMatch, matchId: isMatch ? 'mock-match-id' : undefined }
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      const isMatch = isLike && Math.random() < 0.2
      return { success: true, isMatch, matchId: isMatch ? 'mock-match-id' : undefined }
    } catch (error) {
      console.error('Error processing swipe:', error)
      return { success: false }
    }
  }

  // Get user's matches
  static async getUserMatches(userId: string): Promise<Match[]> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Returning mock matches')
        return []
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, returning empty matches')
      return []
    } catch (error) {
      console.error('Error getting user matches:', error)
      return []
    }
  }

  // Get profiles for user's matches
  static async getMatchProfiles(userId: string): Promise<UserProfile[]> {
    try {
      const matches = await this.getUserMatches(userId)
      
      if (matches.length === 0) return []

      // TODO: Implement real Supabase calls when properly configured
      return []
    } catch (error) {
      console.error('Error getting match profiles:', error)
      return []
    }
  }

  // Calculate compatibility score between two users
  static calculateCompatibilityScore(user1: UserProfile, user2: UserProfile): number {
    let score = 0
    const maxScore = 100

    // Distance compatibility (closer is better)
    const distance = calculateDistance(user1.latitude, user1.longitude, user2.latitude, user2.longitude)
    const distanceScore = Math.max(0, 25 - distance) / 25 * 20 // Max 20 points
    score += distanceScore

    // Handicap compatibility (closer is better)
    const handicapDiff = Math.abs(user1.handicap - user2.handicap)
    const handicapScore = Math.max(0, 10 - handicapDiff) / 10 * 15 // Max 15 points
    score += handicapScore

    // Playing style compatibility
    if (user1.playing_style === user2.playing_style) {
      score += 15
    } else if (
      (user1.playing_style === 'casual' && user2.playing_style === 'beginner_friendly') ||
      (user1.playing_style === 'beginner_friendly' && user2.playing_style === 'casual')
    ) {
      score += 10
    }

    // Pace of play compatibility
    if (user1.pace_of_play === user2.pace_of_play) {
      score += 15
    } else if (
      (user1.pace_of_play === 'moderate' && user2.pace_of_play === 'relaxed') ||
      (user1.pace_of_play === 'relaxed' && user2.pace_of_play === 'moderate')
    ) {
      score += 10
    }

    // Group size preference compatibility
    if (user1.preferred_group_size === user2.preferred_group_size) {
      score += 10
    } else if (user1.preferred_group_size === 'flexible' || user2.preferred_group_size === 'flexible') {
      score += 5
    }

    // Time preference overlap
    const timeOverlap = user1.preferred_times.filter(time => user2.preferred_times.includes(time))
    const timeScore = (timeOverlap.length / Math.max(user1.preferred_times.length, user2.preferred_times.length)) * 15
    score += timeScore

    // Rating bonus (higher rated users get a small bonus)
    const avgRating = (user1.avg_rating + user2.avg_rating) / 2
    const ratingBonus = Math.min(10, avgRating - 3) * 2 // Max 10 points for 5-star average
    score += ratingBonus

    return Math.min(maxScore, Math.round(score))
  }

  // Utility function to shuffle array
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
} 