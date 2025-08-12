'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, X, MapPin, Star, Crown, Shield, Award, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UserProfile } from '@/types'
import { MatchingService } from '@/lib/matching'
import { getPlayingTimeDisplay } from '@/lib/utils'
import toast from 'react-hot-toast'
import { SimpleTooltip } from '@/components/ui/Tooltip'
import { SubscriptionService } from '@/lib/subscriptions'
import UpgradePrompt from '@/components/subscription/UpgradePrompt'
import UpgradeButton from '@/components/subscription/UpgradeButton'

interface IncomingLike {
  id: string
  user: UserProfile
  likedAt: string
  isViewed: boolean
}

export default function WhoLikedYouPage() {
  const [incomingLikes, setIncomingLikes] = useState<IncomingLike[]>([])
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  useEffect(() => {
    checkPremiumStatus()
    loadIncomingLikes()
  }, [])

  const checkPremiumStatus = async () => {
    try {
      const subscription = await SubscriptionService.getUserSubscription('current-user-id')
      const premium = subscription?.tier === 'premium'
      setIsPremium(premium)
      
      if (!premium) {
        setShowUpgradePrompt(true)
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  const loadIncomingLikes = async () => {
    try {
      setLoading(true)
      
      // Mock data for development
      const mockIncomingLikes: IncomingLike[] = [
        {
          id: 'like-1',
          user: {
            id: '1',
            email: 'sarah@example.com',
            full_name: 'Sarah Johnson',
            avatar_url: '',
            bio: 'Love playing golf on weekends! Looking for casual partners.',
            handicap: 15,
            location: 'San Francisco, CA',
            latitude: 37.7749,
            longitude: -122.4194,
            preferred_times: ['weekends_only', 'afternoon'],
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
            home_course: 'Presidio Golf Course',
            favorite_courses: ['Presidio Golf Course'],
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
          likedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isViewed: false
        },
        {
          id: 'like-2',
          user: {
            id: '2',
            email: 'mike@example.com',
            full_name: 'Mike Chen',
            avatar_url: '',
            bio: 'Competitive golfer looking for serious partners. Handicap 8.',
            handicap: 8,
            location: 'Oakland, CA',
            latitude: 37.8044,
            longitude: -122.2711,
            preferred_times: ['morning', 'early_morning'],
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
            home_course: 'Lake Merced Golf Club',
            favorite_courses: ['Lake Merced Golf Club', 'TPC Harding Park'],
            playing_style: 'competitive',
            pace_of_play: 'fast',
            preferred_group_size: 'foursome',
            avg_rating: 4.5,
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
          likedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          isViewed: true
        },
        {
          id: 'like-3',
          user: {
            id: '4',
            email: 'emma@example.com',
            full_name: 'Emma Rodriguez',
            avatar_url: '',
            bio: 'New to golf but loving it! Looking for patient partners.',
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
            home_course: 'Coyote Creek Golf Club',
            favorite_courses: ['Coyote Creek Golf Club'],
            playing_style: 'beginner_friendly',
            pace_of_play: 'relaxed',
            preferred_group_size: 'flexible',
            avg_rating: 4.0,
            total_rounds: 3,
            total_ratings: 2,
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
          likedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          isViewed: false
        }
      ]
      
      setIncomingLikes(mockIncomingLikes)
    } catch (error) {
      console.error('Error loading incoming likes:', error)
      toast.error('Failed to load incoming likes')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (incomingLike: IncomingLike) => {
    try {
      const result = await MatchingService.processSwipe(
        'current-user-id',
        incomingLike.user.id,
        true // Like back
      )

      if (result.success && result.isMatch) {
        toast.success(`It's a match with ${incomingLike.user.full_name}! 🎉`)
      } else {
        toast.success(`Liked ${incomingLike.user.full_name}!`)
      }

      // Remove from incoming likes
      setIncomingLikes(prev => prev.filter(like => like.id !== incomingLike.id))
    } catch (error) {
      console.error('Error processing like:', error)
      toast.error('Failed to process like')
    }
  }

  const handlePass = async (incomingLike: IncomingLike) => {
    try {
      await MatchingService.processSwipe(
        'current-user-id',
        incomingLike.user.id,
        false // Pass
      )

      toast.success(`Passed on ${incomingLike.user.full_name}`)
      
      // Remove from incoming likes
      setIncomingLikes(prev => prev.filter(like => like.id !== incomingLike.id))
    } catch (error) {
      console.error('Error processing pass:', error)
      toast.error('Failed to process pass')
    }
  }

  const getPlayingStyleDisplay = (style: string) => {
    switch (style) {
      case 'competitive': return 'Competitive'
      case 'casual': return 'Casual'
      case 'beginner_friendly': return 'Beginner-Friendly'
      default: return style
    }
  }

  const getPaceDisplay = (pace: string) => {
    switch (pace) {
      case 'fast': return 'Fast'
      case 'moderate': return 'Moderate'
      case 'relaxed': return 'Relaxed'
      default: return pace
    }
  }

  const getGroupSizeDisplay = (size: string) => {
    switch (size) {
      case 'twosome': return 'Twosome'
      case 'foursome': return 'Foursome'
      case 'flexible': return 'Flexible'
      default: return size
    }
  }

  const isActiveThisWeek = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return lastActiveDate > oneWeekAgo
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading incoming likes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">Who Liked You</span>
                {isPremium && (
                  <Crown className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {incomingLikes.length} incoming {incomingLikes.length === 1 ? 'like' : 'likes'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!isPremium ? (
          /* Premium Upgrade Prompt */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <Crown className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h2>
              <p className="text-gray-600 mb-6">
                See who liked you and never miss a potential match! Upgrade to Premium to unlock this exclusive feature.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Premium Benefits:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <Heart className="h-4 w-4 text-green-600 mr-2" />
                  See who liked you before matching
                </li>
                <li className="flex items-center">
                  <Target className="h-4 w-4 text-green-600 mr-2" />
                  Unlimited likes per day
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 text-green-600 mr-2" />
                  100-mile search radius
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  Advanced matching filters
                </li>
              </ul>
            </div>
            
            <UpgradeButton size="lg" className="w-full max-w-md" />
          </div>
        ) : incomingLikes.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Incoming Likes Yet</h2>
            <p className="text-gray-600 mb-6">
              When someone likes your profile, they&apos;ll appear here. Keep swiping to increase your chances!
            </p>
            <Link href="/matching">
              <Button className="bg-green-600 hover:bg-green-700">
                Start Matching
              </Button>
            </Link>
          </div>
        ) : (
          /* Incoming Likes List */
          <div className="space-y-4">
            {incomingLikes.map((incomingLike) => (
              <div 
                key={incomingLike.id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${!incomingLike.isViewed ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Profile Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      {incomingLike.user.avatar_url ? (
                        <img
                          src={incomingLike.user.avatar_url}
                          alt={incomingLike.user.full_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Target className="h-8 w-8 text-white opacity-50" />
                      )}
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {incomingLike.user.full_name}
                        </h3>
                        {!incomingLike.isViewed && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{incomingLike.user.location}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm">{incomingLike.user.handicap} handicap</span>
                      </div>

                      {/* Rating */}
                      {incomingLike.user.avg_rating > 0 && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= Math.round(incomingLike.user.avg_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {incomingLike.user.avg_rating.toFixed(1)} ({incomingLike.user.total_ratings} reviews)
                          </span>
                        </div>
                      )}

                      {/* Trust Indicators */}
                      <div className="flex items-center space-x-2 mb-3">
                        {incomingLike.user.is_verified && (
                          <SimpleTooltip content="Verified golfer with good ratings">
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </div>
                          </SimpleTooltip>
                        )}
                        {incomingLike.user.total_ratings === 0 && (
                          <SimpleTooltip content="New to the app">
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              New to App
                            </div>
                          </SimpleTooltip>
                        )}
                        {isActiveThisWeek(incomingLike.user.last_active) && (
                          <SimpleTooltip content="Active this week">
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              Active
                            </div>
                          </SimpleTooltip>
                        )}
                      </div>

                      {/* Bio */}
                      {incomingLike.user.bio && (
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {incomingLike.user.bio}
                        </p>
                      )}

                      {/* Enhanced Profile Details */}
                      <div className="space-y-1 mb-3">
                        {incomingLike.user.home_course && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Target className="h-3 w-3 mr-1 text-green-600" />
                            <span>Home: {incomingLike.user.home_course}</span>
                          </div>
                        )}
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="h-3 w-3 mr-1 text-blue-600" />
                          <span>
                            {getPlayingStyleDisplay(incomingLike.user.playing_style)} • {getPaceDisplay(incomingLike.user.pace_of_play)} • {getGroupSizeDisplay(incomingLike.user.preferred_group_size)}
                          </span>
                        </div>
                      </div>

                      {/* Liked Time */}
                      <div className="text-xs text-gray-500 mb-4">
                        Liked {formatTimeAgo(incomingLike.likedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handlePass(incomingLike)}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Pass
                    </Button>
                    <Button
                      onClick={() => handleLike(incomingLike)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Like Back
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        trigger="feature_lock"
      />
    </div>
  )
} 