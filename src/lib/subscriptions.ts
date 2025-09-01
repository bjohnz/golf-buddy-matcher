import { SubscriptionPlan, UserSubscription, UsageStats, SubscriptionTier } from '@/types'
import { createClient } from '@supabase/supabase-js'

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    billingPeriod: 'monthly',
    features: [
      '15 likes per day',
      '25-mile search radius',
      'Basic matching filters',
      'Standard support'
    ],
    limits: {
      dailyLikes: 15,
      maxRadius: 25,
      advancedFilters: false,
      seeWhoLikedYou: false,
      prioritySupport: false,
      profileBoosts: 0
    }
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    tier: 'premium',
    price: 9.99,
    billingPeriod: 'monthly',
    features: [
      'Unlimited likes',
      '100-mile search radius',
      'Advanced matching filters',
      'See who liked you',
      'Priority support',
      'Profile boosts',
      'Read receipts'
    ],
    limits: {
      dailyLikes: -1, // Unlimited
      maxRadius: 100,
      advancedFilters: true,
      seeWhoLikedYou: true,
      prioritySupport: true,
      profileBoosts: 3
    },
    popular: true
  },
  {
    id: 'premium-yearly',
    name: 'Premium',
    tier: 'premium',
    price: 99.99,
    billingPeriod: 'yearly',
    features: [
      'Unlimited likes',
      '100-mile search radius',
      'Advanced matching filters',
      'See who liked you',
      'Priority support',
      'Profile boosts',
      'Read receipts',
      '2 months free'
    ],
    limits: {
      dailyLikes: -1, // Unlimited
      maxRadius: 100,
      advancedFilters: true,
      seeWhoLikedYou: true,
      prioritySupport: true,
      profileBoosts: 3
    }
  }
]

export class SubscriptionService {
  private static isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                                   process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co'

  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here'
  )

  // Get all available subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (this.isDevelopmentMode) {
      return SUBSCRIPTION_PLANS
    }

    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error

      return data.map(plan => ({
        id: plan.id,
        name: plan.name,
        tier: plan.tier,
        price: plan.price,
        billingPeriod: plan.billing_period,
        features: plan.features,
        limits: plan.limits,
        popular: plan.is_popular
      }))
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      return SUBSCRIPTION_PLANS
    }
  }

  // Get user's current subscription
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    if (this.isDevelopmentMode) {
      // Return mock subscription for development
      return {
        id: 'mock-subscription',
        userId,
        planId: 'free',
        tier: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    try {
      // Use the database function to get user subscription
      const { data, error } = await this.supabase
        .rpc('get_user_subscription', { user_id: userId })

      if (error) throw error
      if (!data || data.length === 0) return null

      const subscription = data[0]
      return {
        id: subscription.id,
        userId: subscription.user_id,
        planId: subscription.plan_id,
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  }

  // Get user's usage statistics
  static async getUsageStats(userId: string): Promise<UsageStats | null> {
    if (this.isDevelopmentMode) {
      // Return mock usage stats with more realistic data
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      return {
        userId,
        date: today,
        likesUsed: 12, // Mock: user has used 12 likes today
        likesRemaining: 3, // Mock: 3 likes remaining (15 - 12)
        resetDate: tomorrow.toISOString(),
        totalLikesToday: 15,
        isUnlimited: false
      }
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Use the database function to get daily usage
      const { data, error } = await this.supabase
        .rpc('get_daily_usage', { 
          user_id: userId, 
          usage_date: today 
        })

      if (error) throw error

      // If no usage record exists, create one
      if (!data || data.length === 0) {
        const { data: newUsage, error: insertError } = await this.supabase
          .from('daily_usage')
          .insert({
            user_id: userId,
            date: today,
            likes_used: 0,
            likes_remaining: 15,
            reset_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single()

        if (insertError) throw insertError

        return {
          userId,
          date: today,
          likesUsed: newUsage.likes_used,
          likesRemaining: newUsage.likes_remaining,
          resetDate: newUsage.reset_date,
          totalLikesToday: 15,
          isUnlimited: false
        }
      }

      const usage = data[0]
      return {
        userId,
        date: usage.date,
        likesUsed: usage.likes_used,
        likesRemaining: usage.likes_remaining,
        resetDate: usage.reset_date,
        totalLikesToday: 15,
        isUnlimited: false
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return null
    }
  }

  // Check if user can like (based on subscription and daily limits)
  static async canUserLike(userId: string): Promise<{ canLike: boolean; reason?: string }> {
    if (this.isDevelopmentMode) {
      // Mock implementation for development
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) {
        return { canLike: false, reason: 'No subscription found' }
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId) || SUBSCRIPTION_PLANS[0]

      // Premium users have unlimited likes
      if (plan.tier === 'premium') {
        return { canLike: true }
      }

      // Free users have daily limits
      const usageStats = await this.getUsageStats(userId)
      if (!usageStats) {
        return { canLike: false, reason: 'Usage stats not available' }
      }

      if (usageStats.likesRemaining <= 0) {
        return { 
          canLike: false, 
          reason: `Daily limit reached. Reset in ${this.getTimeUntilReset(usageStats.resetDate)}` 
        }
      }

      return { canLike: true }
    }

    try {
      // Use the database function to record like and check limits
      const { data, error } = await this.supabase
        .rpc('record_like', { user_id: userId })

      if (error) throw error

      if (data) {
        return { canLike: true }
      } else {
        return { 
          canLike: false, 
          reason: 'Daily like limit reached. Upgrade to Premium for unlimited likes!' 
        }
      }
    } catch (error) {
      console.error('Error checking if user can like:', error)
      return { canLike: false, reason: 'Error checking like availability' }
    }
  }

  // Record a like action
  static async recordLike(userId: string): Promise<boolean> {
    if (this.isDevelopmentMode) {
      console.log('🔧 Mock like recorded for user:', userId)
      return true
    }

    try {
      // The record_like function already handles the recording
      const { data, error } = await this.supabase
        .rpc('record_like', { user_id: userId })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error recording like:', error)
      return false
    }
  }

  // Subscribe to a plan
  static async subscribeToPlan(
    userId: string, 
    planId: string, 
    paymentMethodId?: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    if (this.isDevelopmentMode) {
      console.log('🔧 Mock subscription created:', { userId, planId })
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
      const mockSubscription: UserSubscription = {
        id: `mock-sub-${Date.now()}`,
        userId,
        planId,
        tier: plan?.tier || 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return { success: true, subscription: mockSubscription }
    }

    try {
      // Get the plan details
      const { data: plan, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (planError) throw planError

      // Create subscription record
      const { data: subscription, error: subError } = await this.supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          tier: plan.tier,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        })
        .select()
        .single()

      if (subError) throw subError

      // Update user profile with subscription info
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({
          subscription_tier: plan.tier,
          subscription_status: 'active',
          subscription_plan_id: planId,
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      return { 
        success: true, 
        subscription: {
          id: subscription.id,
          userId: subscription.user_id,
          planId: subscription.plan_id,
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end,
          createdAt: subscription.created_at,
          updatedAt: subscription.updated_at
        }
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error)
      return { success: false, error: 'Subscription failed' }
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId: string): Promise<boolean> {
    if (this.isDevelopmentMode) {
      console.log('🔧 Mock subscription cancelled for user:', userId)
      return true
    }

    try {
      const response = await fetch(`/api/subscriptions/${userId}/cancel`, {
        method: 'POST'
      })
      return response.ok
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return false
    }
  }

  // Get subscription limits for a user
  static async getSubscriptionLimits(userId: string): Promise<SubscriptionPlan['limits'] | null> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return null

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId)
    return plan?.limits || null
  }

  // Check if user has premium features
  static async hasPremiumFeature(
    userId: string, 
    feature: keyof SubscriptionPlan['limits']
  ): Promise<boolean> {
    const limits = await this.getSubscriptionLimits(userId)
    if (!limits) return false

    const value = limits[feature]
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'number') {
      return value > 0 || value === -1 // -1 means unlimited
    }
    return false
  }

  // Helper function to format time until reset
  private static getTimeUntilReset(resetDate: string): string {
    const now = new Date()
    const reset = new Date(resetDate)
    const diff = reset.getTime() - now.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Profile Boost Methods
  static async getBoostStatus(userId: string): Promise<{
    isActive: boolean
    remainingTime?: number
    boostsRemaining: number
  }> {
    if (this.isDevelopmentMode) {
      return {
        isActive: false,
        boostsRemaining: 3
      }
    }

    try {
      // Get active boost
      const { data: activeBoost, error: boostError } = await this.supabase
        .from('profile_boosts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (boostError && boostError.code !== 'PGRST116') throw boostError

      // Get user's subscription to determine boost count
      const subscription = await this.getUserSubscription(userId)
      const plan = await this.getSubscriptionPlans()
      const userPlan = plan.find(p => p.id === subscription?.planId)
      const boostsRemaining = userPlan?.limits.profileBoosts || 0

      if (activeBoost) {
        const now = new Date()
        const expiresAt = new Date(activeBoost.expires_at)
        const remainingTime = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))

        return {
          isActive: true,
          remainingTime,
          boostsRemaining
        }
      }

      return {
        isActive: false,
        boostsRemaining
      }
    } catch (error) {
      console.error('Error fetching boost status:', error)
      return { isActive: false, boostsRemaining: 0 }
    }
  }

  static async activateBoost(userId: string): Promise<{ success: boolean; error?: string }> {
    if (this.isDevelopmentMode) {
      console.log('🔧 Mock boost activated for user:', userId)
      return { success: true }
    }

    try {
      // Check if user has boosts remaining
      const boostStatus = await this.getBoostStatus(userId)
      if (boostStatus.boostsRemaining <= 0) {
        return { success: false, error: 'No boosts remaining' }
      }

      // Create new boost
      const { error } = await this.supabase
        .from('profile_boosts')
        .insert({
          user_id: userId,
          is_active: true,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error activating boost:', error)
      return { success: false, error: 'Failed to activate boost' }
    }
  }

  // Priority Placement Methods
  static async hasPriorityPlacement(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return false

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId)
    return plan?.tier === 'premium'
  }

  // Incoming Likes Methods
  static async getIncomingLikes(userId: string): Promise<Array<{
    id: string
    likerId: string
    likedUserId: string
    isViewed: boolean
    createdAt: string
  }>> {
    if (this.isDevelopmentMode) {
      return []
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_incoming_likes', { user_id: userId })

      if (error) throw error

      return data.map((like: { id: string; liker_id: string; liked_user_id: string; is_viewed: boolean; created_at: string }) => ({
        id: like.id,
        likerId: like.liker_id,
        likedUserId: like.liked_user_id,
        isViewed: like.is_viewed,
        createdAt: like.created_at
      }))
    } catch (error) {
      console.error('Error fetching incoming likes:', error)
      return []
    }
  }

  // Mark incoming like as viewed
  static async markIncomingLikeAsViewed(likeId: string): Promise<boolean> {
    if (this.isDevelopmentMode) {
      return true
    }

    try {
      const { error } = await this.supabase
        .from('incoming_likes')
        .update({ is_viewed: true })
        .eq('id', likeId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking incoming like as viewed:', error)
      return false
    }
  }

  // Enhanced Matching Features
  static async canUseAdvancedFilters(userId: string): Promise<boolean> {
    return this.hasPremiumFeature(userId, 'advancedFilters')
  }

  static async canUseExtendedRadius(userId: string): Promise<boolean> {
    const limits = await this.getSubscriptionLimits(userId)
    return limits ? limits.maxRadius > 25 : false
  }

  static async canSeeWhoLikedYou(userId: string): Promise<boolean> {
    return this.hasPremiumFeature(userId, 'seeWhoLikedYou')
  }

  static async getProfileBoostCount(userId: string): Promise<number> {
    const limits = await this.getSubscriptionLimits(userId)
    return limits ? limits.profileBoosts : 0
  }
} 