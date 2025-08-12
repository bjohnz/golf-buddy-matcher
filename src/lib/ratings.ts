import { Rating, RatingFormData, PlayedTogether } from '@/types'

// Sample data for development
const sampleRatings: Rating[] = []
const samplePlayedTogether: PlayedTogether[] = []

// Check if we're in development mode
const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' ||
                         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key-here'

export class RatingService {
  // Confirm that users played golf together
  static async confirmPlayedTogether(
    matchId: string,
    userId: string,
    isUser1: boolean
  ): Promise<{ success: boolean; bothConfirmed?: boolean }> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Mock played together confirmation:', { matchId, userId, isUser1 })
        
        let playedTogether = samplePlayedTogether.find(pt => pt.match_id === matchId)
        
        if (!playedTogether) {
          playedTogether = {
            id: `pt-${Date.now()}`,
            match_id: matchId,
            user1_confirmed: isUser1,
            user2_confirmed: !isUser1,
            created_at: new Date().toISOString()
          }
          samplePlayedTogether.push(playedTogether)
        } else {
          if (isUser1) {
            playedTogether.user1_confirmed = true
          } else {
            playedTogether.user2_confirmed = true
          }
        }

        const bothConfirmed = playedTogether.user1_confirmed && playedTogether.user2_confirmed
        if (bothConfirmed) {
          playedTogether.confirmed_at = new Date().toISOString()
        }

        return { success: true, bothConfirmed }
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return { success: true, bothConfirmed: true }
    } catch (error) {
      console.error('Error confirming played together:', error)
      return { success: false }
    }
  }

  // Check if both users confirmed they played together
  static async getPlayedTogetherStatus(matchId: string): Promise<PlayedTogether | null> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Getting played together status for development')
        return samplePlayedTogether.find(pt => pt.match_id === matchId) || null
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return null
    } catch (error) {
      console.error('Error getting played together status:', error)
      return null
    }
  }

  // Submit a rating for another user
  static async submitRating(
    raterId: string,
    ratedUserId: string,
    matchId: string,
    ratingData: RatingFormData
  ): Promise<{ success: boolean; ratingId?: string }> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Mock rating submitted:', { raterId, ratedUserId, matchId, ratingData })
        
        const rating: Rating = {
          id: `rating-${Date.now()}`,
          rater_id: raterId,
          rated_user_id: ratedUserId,
          match_id: matchId,
          overall_rating: ratingData.overall_rating,
          showed_up: ratingData.showed_up,
          fun_factor: ratingData.fun_factor,
          etiquette: ratingData.etiquette,
          would_play_again: ratingData.would_play_again,
          feedback_text: ratingData.feedback_text,
          created_at: new Date().toISOString()
        }
        
        sampleRatings.push(rating)
        return { success: true, ratingId: rating.id }
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return { success: true, ratingId: `mock-rating-${Date.now()}` }
    } catch (error) {
      console.error('Error submitting rating:', error)
      return { success: false }
    }
  }

  // Get ratings for a user
  static async getUserRatings(userId: string): Promise<Rating[]> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Getting user ratings for development')
        return sampleRatings.filter(rating => rating.rated_user_id === userId)
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return []
    } catch (error) {
      console.error('Error getting user ratings:', error)
      return []
    }
  }

  // Check if user has already rated another user for a specific match
  static async hasRatedUser(
    raterId: string,
    ratedUserId: string,
    matchId: string
  ): Promise<boolean> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Checking if user has rated for development')
        return sampleRatings.some(rating => 
          rating.rater_id === raterId && 
          rating.rated_user_id === ratedUserId && 
          rating.match_id === matchId
        )
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return false
    } catch (error) {
      console.error('Error checking if user has rated:', error)
      return false
    }
  }

  // Calculate average rating for a user
  static async calculateAverageRating(userId: string): Promise<{
    avgRating: number
    totalRatings: number
    totalRounds: number
  }> {
    try {
      if (isDevelopmentMode) {
        console.log('🔧 Calculating average rating for development')
        const userRatings = sampleRatings.filter(rating => rating.rated_user_id === userId)
        
        if (userRatings.length === 0) {
          return { avgRating: 0, totalRatings: 0, totalRounds: 0 }
        }

        const totalRating = userRatings.reduce((sum, rating) => sum + rating.overall_rating, 0)
        const avgRating = totalRating / userRatings.length
        
        // Count unique matches as rounds
        const uniqueMatches = new Set(userRatings.map(rating => rating.match_id))
        
        return {
          avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
          totalRatings: userRatings.length,
          totalRounds: uniqueMatches.size
        }
      }

      // TODO: Implement real Supabase calls when properly configured
      console.log('⚠️ Supabase not properly configured, using mock data')
      return { avgRating: 0, totalRatings: 0, totalRounds: 0 }
    } catch (error) {
      console.error('Error calculating average rating:', error)
      return { avgRating: 0, totalRatings: 0, totalRounds: 0 }
    }
  }

  // Get rating categories for the form
  static getRatingCategories(): { key: keyof RatingFormData; label: string; description: string }[] {
    return [
      {
        key: 'showed_up',
        label: 'Showed up on time',
        description: 'Did they arrive when expected?'
      },
      {
        key: 'fun_factor',
        label: 'Fun to play with',
        description: 'Were they enjoyable company on the course?'
      },
      {
        key: 'etiquette',
        label: 'Good golf etiquette',
        description: 'Did they follow proper golf etiquette?'
      },
      {
        key: 'would_play_again',
        label: 'Would play again',
        description: 'Would you want to play with them again?'
      }
    ]
  }

  // Check if user is verified (has good ratings and multiple rounds)
  static async isUserVerified(userId: string): Promise<boolean> {
    try {
      const { avgRating, totalRounds, totalRatings } = await this.calculateAverageRating(userId)
      
      // User is verified if they have:
      // - At least 3 ratings
      // - At least 2 rounds played
      // - Average rating of 4.0 or higher
      return totalRatings >= 3 && totalRounds >= 2 && avgRating >= 4.0
    } catch (error) {
      console.error('Error checking if user is verified:', error)
      return false
    }
  }
} 