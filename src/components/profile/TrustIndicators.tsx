import React from 'react'
import { Star, Shield, Clock, Users, Award } from 'lucide-react'
import type { TrustIndicators } from '@/types'

interface TrustIndicatorsProps {
  indicators: TrustIndicators
  className?: string
}

export default function TrustIndicators({ indicators, className = '' }: TrustIndicatorsProps) {
  const {
    isVerified,
    isNewToApp,
    isActiveThisWeek,
    hasMutualConnections,
    avgRating,
    totalRounds,
    totalRatings
  } = indicators

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Verified Badge */}
      {isVerified && (
        <div className="flex items-center space-x-2 text-green-600">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Verified Golfer</span>
        </div>
      )}

      {/* New to App Badge */}
      {isNewToApp && (
        <div className="flex items-center space-x-2 text-blue-600">
          <Award className="h-4 w-4" />
          <span className="text-sm font-medium">New to App</span>
        </div>
      )}

      {/* Rating Display */}
      {avgRating > 0 && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {avgRating.toFixed(1)} ({totalRatings} reviews)
          </span>
        </div>
      )}

      {/* Rounds Played */}
      {totalRounds > 0 && (
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="h-4 w-4" />
          <span className="text-sm">{totalRounds} rounds played</span>
        </div>
      )}

      {/* Activity Status */}
      {isActiveThisWeek && (
        <div className="flex items-center space-x-2 text-green-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Active this week</span>
        </div>
      )}

      {/* Mutual Connections */}
      {hasMutualConnections && (
        <div className="flex items-center space-x-2 text-purple-600">
          <Users className="h-4 w-4" />
          <span className="text-sm">Mutual connections</span>
        </div>
      )}
    </div>
  )
} 