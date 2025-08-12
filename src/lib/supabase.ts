import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are not set. Please add them to your .env.local file:')
  console.warn('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.warn('For now, the app will use mock data for development.')
}

// Create a mock client if environment variables are missing
const createMockClient = () => {
  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    neq: () => mockQueryBuilder,
    in: () => mockQueryBuilder,
    or: () => mockQueryBuilder,
    single: () => Promise.resolve({ data: null, error: null })
  }

  return {
    from: () => mockQueryBuilder,
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  }
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          bio?: string
          handicap: number
          location: string
          latitude: number
          longitude: number
          preferred_times: string[]
          photos: string[]
          is_active: boolean
          is_banned: boolean
          show_distance: boolean
          show_online_status: boolean
          notification_preferences: {
            new_matches: boolean
            new_messages: boolean
            profile_views: boolean
          }
          // Enhanced profile fields
          home_course?: string
          favorite_courses?: string[]
          playing_style: 'competitive' | 'casual' | 'beginner_friendly'
          pace_of_play: 'fast' | 'moderate' | 'relaxed'
          preferred_group_size: 'twosome' | 'foursome' | 'flexible'
          avg_rating: number
          total_rounds: number
          total_ratings: number
          is_verified: boolean
          last_active: string
          // Subscription fields
          subscription_tier: 'free' | 'premium'
          subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_expires_at?: string
          subscription_plan_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          bio?: string
          handicap: number
          location: string
          latitude: number
          longitude: number
          preferred_times: string[]
          photos?: string[]
          is_active?: boolean
          is_banned?: boolean
          show_distance?: boolean
          show_online_status?: boolean
          notification_preferences?: {
            new_matches: boolean
            new_messages: boolean
            profile_views: boolean
          }
          home_course?: string
          favorite_courses?: string[]
          playing_style?: 'competitive' | 'casual' | 'beginner_friendly'
          pace_of_play?: 'fast' | 'moderate' | 'relaxed'
          preferred_group_size?: 'twosome' | 'foursome' | 'flexible'
          avg_rating?: number
          total_rounds?: number
          total_ratings?: number
          is_verified?: boolean
          last_active?: string
          subscription_tier?: 'free' | 'premium'
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_expires_at?: string
          subscription_plan_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          bio?: string
          handicap?: number
          location?: string
          latitude?: number
          longitude?: number
          preferred_times?: string[]
          photos?: string[]
          is_active?: boolean
          is_banned?: boolean
          show_distance?: boolean
          show_online_status?: boolean
          notification_preferences?: {
            new_matches: boolean
            new_messages: boolean
            profile_views: boolean
          }
          home_course?: string
          favorite_courses?: string[]
          playing_style?: 'competitive' | 'casual' | 'beginner_friendly'
          pace_of_play?: 'fast' | 'moderate' | 'relaxed'
          preferred_group_size?: 'twosome' | 'foursome' | 'flexible'
          avg_rating?: number
          total_rounds?: number
          total_ratings?: number
          is_verified?: boolean
          last_active?: string
          subscription_tier?: 'free' | 'premium'
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_expires_at?: string
          subscription_plan_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      swipes: {
        Row: {
          id: string
          user_id: string
          target_user_id: string
          is_like: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_user_id: string
          is_like: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_user_id?: string
          is_like?: boolean
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
          is_active?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          created_at: string
          is_read: boolean
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          created_at?: string
          is_read?: boolean
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          is_read?: boolean
        }
      }
      ratings: {
        Row: {
          id: string
          rater_id: string
          rated_user_id: string
          match_id: string
          overall_rating: number
          showed_up: number
          fun_factor: number
          etiquette: number
          would_play_again: number
          feedback_text?: string
          created_at: string
        }
        Insert: {
          id?: string
          rater_id: string
          rated_user_id: string
          match_id: string
          overall_rating: number
          showed_up: number
          fun_factor: number
          etiquette: number
          would_play_again: number
          feedback_text?: string
          created_at?: string
        }
        Update: {
          id?: string
          rater_id?: string
          rated_user_id?: string
          match_id?: string
          overall_rating?: number
          showed_up?: number
          fun_factor?: number
          etiquette?: number
          would_play_again?: number
          feedback_text?: string
          created_at?: string
        }
      }
      played_together: {
        Row: {
          id: string
          match_id: string
          user1_confirmed: boolean
          user2_confirmed: boolean
          confirmed_at?: string
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          user1_confirmed?: boolean
          user2_confirmed?: boolean
          confirmed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          user1_confirmed?: boolean
          user2_confirmed?: boolean
          confirmed_at?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string
          reason: string
          description?: string
          created_at: string
          status: 'pending' | 'reviewed' | 'resolved'
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id: string
          reason: string
          description?: string
          created_at?: string
          status?: 'pending' | 'reviewed' | 'resolved'
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string
          reason?: string
          description?: string
          created_at?: string
          status?: 'pending' | 'reviewed' | 'resolved'
        }
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_user_id?: string
          created_at?: string
        }
      }
      // New subscription-related tables
      subscription_plans: {
        Row: {
          id: string
          name: string
          tier: 'free' | 'premium'
          price: number
          billing_period: 'monthly' | 'yearly'
          features: string[]
          limits: {
            daily_likes: number
            max_radius: number
            advanced_filters: boolean
            see_who_liked_you: boolean
            priority_support: boolean
            profile_boosts: number
          }
          is_popular?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tier: 'free' | 'premium'
          price: number
          billing_period: 'monthly' | 'yearly'
          features: string[]
          limits: {
            daily_likes: number
            max_radius: number
            advanced_filters: boolean
            see_who_liked_you: boolean
            priority_support: boolean
            profile_boosts: number
          }
          is_popular?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tier?: 'free' | 'premium'
          price?: number
          billing_period?: 'monthly' | 'yearly'
          features?: string[]
          limits?: {
            daily_likes: number
            max_radius: number
            advanced_filters: boolean
            see_who_liked_you: boolean
            priority_support: boolean
            profile_boosts: number
          }
          is_popular?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          tier: 'free' | 'premium'
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          trial_end?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          tier: 'free' | 'premium'
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          trial_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          tier?: 'free' | 'premium'
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          trial_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_usage: {
        Row: {
          id: string
          user_id: string
          date: string
          likes_used: number
          likes_remaining: number
          reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          likes_used?: number
          likes_remaining?: number
          reset_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          likes_used?: number
          likes_remaining?: number
          reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      profile_boosts: {
        Row: {
          id: string
          user_id: string
          is_active: boolean
          started_at: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          is_active?: boolean
          started_at?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          is_active?: boolean
          started_at?: string
          expires_at?: string
          created_at?: string
        }
      }
      incoming_likes: {
        Row: {
          id: string
          liker_id: string
          liked_user_id: string
          is_viewed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          liker_id: string
          liked_user_id: string
          is_viewed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          liker_id?: string
          liked_user_id?: string
          is_viewed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 