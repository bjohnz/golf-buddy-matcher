// User Profile Types
export interface UserProfile {
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

// Swipe Types
export interface Swipe {
  id: string
  user_id: string
  target_user_id: string
  is_like: boolean
  created_at: string
}

// Match Types
export interface Match {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  is_active: boolean
}

// Message Types
export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

// Rating Types
export interface Rating {
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

export interface RatingFormData {
  overall_rating: number
  showed_up: number
  fun_factor: number
  etiquette: number
  would_play_again: number
  feedback_text?: string
}

// Played Together Types
export interface PlayedTogether {
  id: string
  match_id: string
  user1_confirmed: boolean
  user2_confirmed: boolean
  confirmed_at?: string
  created_at: string
}

// Report Types
export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  description?: string
  created_at: string
  status: 'pending' | 'reviewed' | 'resolved'
}

export enum ReportReason {
  INAPPROPRIATE_BEHAVIOR = 'inappropriate_behavior',
  FAKE_PROFILE = 'fake_profile',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  OTHER = 'other'
}

// Block Types
export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_user_id: string
  created_at: string
}

// UI Types
export type SwipeDirection = 'left' | 'right'

// Golf-specific Types
export type PlayingTime = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'weekends_only'

export interface HandicapRange {
  min: number
  max: number
}

export interface Location {
  latitude: number
  longitude: number
  address?: string
}

export interface MatchingPreferences {
  maxDistance: number // in miles
  handicapRange: HandicapRange
  preferredTimes: PlayingTime[]
  playingStyle?: 'competitive' | 'casual' | 'beginner_friendly'
  paceOfPlay?: 'fast' | 'moderate' | 'relaxed'
  groupSize?: 'twosome' | 'foursome' | 'flexible'
  onlyVerified?: boolean
  minRating?: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Chat Types
export interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: string
  isOwn: boolean
  isRead: boolean
}

// Match with Profile Info
export interface MatchWithProfile {
  match: Match
  profile: UserProfile
  lastMessage?: Message
  unreadCount: number
  playedTogether?: PlayedTogether
  canRate?: boolean
}

// Settings Types
export interface UserSettings {
  show_distance: boolean
  show_online_status: boolean
  notification_preferences: {
    new_matches: boolean
    new_messages: boolean
    profile_views: boolean
  }
}

// Admin Types
export interface AdminStats {
  total_users: number
  total_matches: number
  total_messages: number
  reported_users: number
  banned_users: number
  total_ratings: number
  avg_rating: number
}

// Trust Indicators
export interface TrustIndicators {
  isVerified: boolean
  isNewToApp: boolean
  isActiveThisWeek: boolean
  hasMutualConnections: boolean
  avgRating: number
  totalRounds: number
  totalRatings: number
}

// Navigation Types
export type AppRoute = 
  | '/'
  | '/auth/login'
  | '/auth/register'
  | '/auth/complete-profile'
  | '/dashboard'
  | '/matching'
  | '/matches'
  | '/chat'
  | '/profile'
  | '/settings'
  | '/admin'
  | '/pricing'
  | '/who-liked-you'

// Subscription Types
export type SubscriptionTier = 'free' | 'premium'

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number
  billingPeriod: 'monthly' | 'yearly'
  features: string[]
  limits: {
    dailyLikes: number
    maxRadius: number
    advancedFilters: boolean
    seeWhoLikedYou: boolean
    prioritySupport: boolean
    profileBoosts: number
  }
  popular?: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  tier: SubscriptionTier
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  createdAt: string
  updatedAt: string
}

export interface UsageStats {
  userId: string
  date: string
  likesUsed: number
  likesRemaining: number
  resetDate: string
  totalLikesToday: number
  isUnlimited: boolean
}

export interface Notification {
  id: string
  type: 'match' | 'message' | 'rating' | 'profile_view' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  metadata?: {
    userId?: string
    userName?: string
    matchId?: string
    rating?: number
  }
} 