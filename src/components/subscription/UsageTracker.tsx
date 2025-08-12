'use client'

import { useState, useEffect } from 'react'
import { Heart, Crown, Clock, AlertCircle } from 'lucide-react'
import { SubscriptionService } from '@/lib/subscriptions'
import { UsageStats, UserSubscription } from '@/types'
import { SimpleTooltip } from '@/components/ui/Tooltip'

interface UsageTrackerProps {
  userId: string
  className?: string
}

export default function UsageTracker({ userId, className = '' }: UsageTrackerProps) {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsageData()
  }, [userId])

  const loadUsageData = async () => {
    try {
      setLoading(true)
      const [stats, sub] = await Promise.all([
        SubscriptionService.getUsageStats(userId),
        SubscriptionService.getUserSubscription(userId)
      ])
      setUsageStats(stats)
      setSubscription(sub)
    } catch (error) {
      console.error('Error loading usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPremium = subscription?.tier === 'premium'
  const isUnlimited = isPremium || (usageStats?.isUnlimited || false)

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="loading-spinner"></div>
          <span className="text-sm text-gray-600">Loading usage...</span>
        </div>
      </div>
    )
  }

  if (!usageStats) {
    return null
  }

  const getProgressColor = () => {
    if (isUnlimited) return 'bg-green-500'
    const percentage = ((usageStats.likesUsed || 0) / usageStats.totalLikesToday) * 100
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTimeUntilReset = () => {
    const now = new Date()
    const reset = new Date(usageStats.resetDate)
    const diff = reset.getTime() - now.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isPremium ? (
            <Crown className="h-5 w-5 text-green-600" />
          ) : (
            <Heart className="h-5 w-5 text-gray-600" />
          )}
          <span className="font-medium text-gray-900">
            {isPremium ? 'Premium' : 'Daily Likes'}
          </span>
        </div>
        <SimpleTooltip content="Time until likes reset">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{getTimeUntilReset()}</span>
          </div>
        </SimpleTooltip>
      </div>

      {isUnlimited ? (
        <div className="text-center py-2">
          <div className="text-2xl font-bold text-green-600 mb-1">∞</div>
          <div className="text-sm text-gray-600">Unlimited likes</div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {usageStats.likesUsed || 0} of {usageStats.totalLikesToday} used
              </span>
              <span className="text-gray-600">
                {usageStats.likesRemaining} remaining
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{
                  width: `${Math.min(((usageStats.likesUsed || 0) / usageStats.totalLikesToday) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Warning Message */}
          {usageStats.likesRemaining <= 3 && usageStats.likesRemaining > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Only {usageStats.likesRemaining} likes remaining today
              </span>
            </div>
          )}

          {/* Upgrade Prompt */}
          {usageStats.likesRemaining === 0 && (
            <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800 mb-2 font-medium">
                Daily limit reached
              </div>
              <a
                href="/pricing"
                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
              >
                Upgrade to Premium
                <Crown className="ml-1 h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 