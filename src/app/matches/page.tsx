'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target, ArrowLeft, MessageCircle, MapPin, Star, Calendar, Clock, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MatchWithProfile } from '@/types'
import { MessagingService } from '@/lib/messaging'
import { formatDistance, getPlayingTimeDisplay, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import { UserProfile } from '@/types'
import { SimpleTooltip } from '@/components/ui/Tooltip'
import { NoMatchesEmptyState } from '@/components/ui/EmptyState'

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      
      // TODO: Get current user ID from auth context
      const currentUserId = 'current-user-id'
      
      // For now, use sample user profile
      const sampleUserProfile: UserProfile = {
        id: 'current-user-id',
        email: 'user@example.com',
        full_name: 'Current User',
        avatar_url: '',
        bio: 'Looking for golf partners!',
        handicap: 12,
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
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
        home_course: 'Presidio Golf Course',
        favorite_courses: ['Presidio Golf Course', 'Harding Park Golf Course'],
        playing_style: 'casual',
        pace_of_play: 'moderate',
        preferred_group_size: 'twosome',
        avg_rating: 4.1,
        total_rounds: 6,
        total_ratings: 5,
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
      
      setUserProfile(sampleUserProfile)

      // Get matches with profiles and messaging info
      const matchesWithProfiles = await MessagingService.getMatchesWithProfiles(currentUserId)
      setMatches(matchesWithProfiles)
    } catch (error) {
      console.error('Error loading matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (matchProfile: UserProfile) => {
    if (!userProfile) return 0
    
    const R = 3959 // Earth's radius in miles
    const dLat = (matchProfile.latitude - userProfile.latitude) * (Math.PI / 180)
    const dLon = (matchProfile.longitude - userProfile.longitude) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userProfile.latitude * (Math.PI / 180)) *
        Math.cos(matchProfile.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
  }

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  const handleStartMatching = () => {
    // Navigate to matching page
    window.location.href = '/matching'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your matches...</p>
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
                <Target className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">Your Matches</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <SimpleTooltip content="Total number of successful matches">
                <span className="text-sm text-gray-500">
                  {matches.length} match{matches.length !== 1 ? 'es' : ''}
                </span>
              </SimpleTooltip>
              <SimpleTooltip content="Get help with matches and messaging">
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </SimpleTooltip>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {matches.length === 0 ? (
          <NoMatchesEmptyState onStartMatching={handleStartMatching} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Your Golf Matches ({matches.length})
              </h1>
              <SimpleTooltip content="Tips for better matches">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-1">💡 Pro Tip</h4>
                  <p className="text-xs text-blue-700">
                    Send a message within 24 hours for the best chance of connecting!
                  </p>
                </div>
              </SimpleTooltip>
            </div>
            
            <div className="space-y-3">
              {matches.map((matchWithProfile) => (
                <SimpleTooltip 
                  key={matchWithProfile.match.id} 
                  content={`Click to chat with ${matchWithProfile.profile.full_name}`}
                >
                  <Link
                    href={`/chat/${matchWithProfile.match.id}`}
                    className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Profile Image */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          {matchWithProfile.profile.avatar_url ? (
                            <img
                              src={matchWithProfile.profile.avatar_url}
                              alt={matchWithProfile.profile.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-lg">
                              {matchWithProfile.profile.full_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        
                        {/* Unread badge */}
                        {matchWithProfile.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {matchWithProfile.unreadCount > 9 ? '9+' : matchWithProfile.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Match Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {matchWithProfile.profile.full_name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatMatchDate(matchWithProfile.match.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium mr-2">
                            {matchWithProfile.profile.handicap} handicap
                          </span>
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{matchWithProfile.profile.location}</span>
                        </div>

                        {/* Last Message Preview */}
                        {matchWithProfile.lastMessage ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <MessageCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {matchWithProfile.lastMessage.content}
                            </span>
                            <Clock className="h-3 w-3 ml-2 flex-shrink-0" />
                            <span className="text-xs">
                              {formatTime(matchWithProfile.lastMessage.created_at)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-400">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span>No messages yet</span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-gray-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </SimpleTooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 