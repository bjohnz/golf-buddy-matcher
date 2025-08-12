'use client'

import { useState, useEffect } from 'react'
import { Heart, AlertTriangle, Crown } from 'lucide-react'
import { SubscriptionService } from '@/lib/subscriptions'
import { UsageStats } from '@/types'
import UpgradeButton from './UpgradeButton'

interface LikeLimitWarningProps {
  userId: string
  className?: string
}

export default function LikeLimitWarning({ userId, className = '' }: LikeLimitWarningProps) {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsageStats()
  }, [userId])

  const loadUsageStats = async () => {
    try {
      setLoading(true)
      const stats = await SubscriptionService.getUsageStats(userId)
      setUsageStats(stats)
    } catch (error) {
      console.error('Error loading usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !usageStats) {
    return null
  }

  const isUnlimited = usageStats.isUnlimited
  const remainingLikes = usageStats.likesRemaining
  const totalLikes = usageStats.totalLikesToday
  const usedLikes = usageStats.likesUsed

  // Don't show warning if unlimited or plenty of likes remaining
  if (isUnlimited || remainingLikes > 5) {
    return null
  }

  // Show critical warning when no likes remaining
  if (remainingLikes === 0) {
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Daily Like Limit Reached</h3>
            <p className="text-sm text-red-700">
              You&apos;ve used all {totalLikes} likes for today. Upgrade to Premium for unlimited likes!
            </p>
          </div>
          <UpgradeButton size="sm" />
        </div>
      </div>
    )
  }

  // Show warning when running low on likes
  if (remainingLikes <= 3) {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Heart className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">Running Low on Likes</h3>
            <p className="text-sm text-yellow-700">
              Only {remainingLikes} likes remaining today. Upgrade to Premium for unlimited likes!
            </p>
          </div>
          <UpgradeButton size="sm" />
        </div>
      </div>
    )
  }

  // Show info when getting close to limit
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Heart className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Like Usage</h3>
          <p className="text-sm text-blue-700">
            {usedLikes} of {totalLikes} likes used today ({remainingLikes} remaining)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(usedLikes / totalLikes) * 100}%` }}
            />
          </div>
          <UpgradeButton size="sm" variant="outline" />
        </div>
      </div>
    </div>
  )
} 