'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, X, ArrowLeft, Target, MapPin, Star, Calendar, MoreVertical, Flag, Ban, Shield, Award, Users, HelpCircle, Filter, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UserProfile, SwipeDirection, MatchingPreferences } from '@/types'
import { MatchingService } from '@/lib/matching'
import { formatDistance, getPlayingTimeDisplay } from '@/lib/utils'
import toast from 'react-hot-toast'
import ReportModal from '@/components/safety/ReportModal'
import BlockModal from '@/components/safety/BlockModal'
import { SimpleTooltip } from '@/components/ui/Tooltip'
import { NoProfilesEmptyState } from '@/components/ui/EmptyState'
import DiscoveryFilters from '@/components/discovery/DiscoveryFilters'
import SortOptions, { SortOption } from '@/components/discovery/SortOptions'
import ExpandRadiusPrompt from '@/components/discovery/ExpandRadiusPrompt'
import LocationSettings from '@/components/location/LocationSettings'
import UsageTracker from '@/components/subscription/UsageTracker'
import UpgradePrompt from '@/components/subscription/UpgradePrompt'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { SubscriptionService } from '@/lib/subscriptions'
import PremiumBadge, { PremiumLock } from '@/components/subscription/PremiumBadge'
import UpgradeButton from '@/components/subscription/UpgradeButton'
import LikeLimitWarning from '@/components/subscription/LikeLimitWarning'

export default function MatchingPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  
  // New state for discovery features
  const [showFilters, setShowFilters] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [showLocationSettings, setShowLocationSettings] = useState(false)
  const [showExpandRadiusPrompt, setShowExpandRadiusPrompt] = useState(false)
  const [currentSort, setCurrentSort] = useState<SortOption>('compatibility')
  const [matchingPreferences, setMatchingPreferences] = useState<MatchingPreferences>({
    maxDistance: 25,
    handicapRange: { min: 0, max: 30 },
    preferredTimes: ['morning', 'afternoon'],
    playingStyle: undefined,
    paceOfPlay: undefined,
    groupSize: undefined,
    onlyVerified: false,
    minRating: 0
  })
  const [userLocation, setUserLocation] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    address: 'San Francisco, CA'
  })
  const [searchRadius, setSearchRadius] = useState(25)

  // Subscription state
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState<'daily_limit' | 'feature_lock' | 'general'>('general')
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    loadProfiles()
    checkForExpandRadiusPrompt()
    checkPremiumStatus()
  }, [matchingPreferences, searchRadius])

  const checkPremiumStatus = async () => {
    if (!user?.id) return
    
    try {
      const subscription = await SubscriptionService.getUserSubscription(user.id)
      setIsPremium(subscription?.tier === 'premium')
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  const loadProfiles = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Use authenticated user
      const currentUserId = user.id
      
      // For now, use sample user profile (in production, fetch from database)
      const sampleUserProfile: UserProfile = {
        id: user.id,
        email: user.email || 'user@example.com',
        full_name: user.user_metadata?.full_name || 'Current User',
        avatar_url: '',
        bio: 'Looking for golf partners!',
        handicap: 12,
        location: 'San Francisco, CA',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
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
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_expires_at: undefined,
        subscription_plan_id: 'free',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
      
      setUserProfile(sampleUserProfile)

      // Get potential matches with updated preferences
      const potentialMatches = await MatchingService.findPotentialMatches(
        currentUserId, 
        sampleUserProfile,
        matchingPreferences,
        searchRadius
      )
      
      // Sort profiles based on current sort option
      const sortedProfiles = sortProfiles(potentialMatches, currentSort, userLocation)
      setProfiles(sortedProfiles)
      
      // Check if we should show expand radius prompt
      if (potentialMatches.length < 5 && searchRadius < 50) {
        setShowExpandRadiusPrompt(true)
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
      toast.error('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const checkForExpandRadiusPrompt = () => {
    if (profiles.length < 5 && searchRadius < 50 && !showExpandRadiusPrompt) {
      setShowExpandRadiusPrompt(true)
    }
  }

  const sortProfiles = (profiles: UserProfile[], sortBy: SortOption, userLocation: { latitude: number; longitude: number }): UserProfile[] => {
    const sorted = [...profiles]
    
    switch (sortBy) {
      case 'distance':
        return sorted.sort((a, b) => {
          const distanceA = calculateDistance(a, userLocation)
          const distanceB = calculateDistance(b, userLocation)
          return distanceA - distanceB
        })
      
      case 'rating':
        return sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
      
      case 'recently_active':
        return sorted.sort((a, b) => {
          const lastActiveA = new Date(a.last_active).getTime()
          const lastActiveB = new Date(b.last_active).getTime()
          return lastActiveB - lastActiveA
        })
      
      case 'compatibility':
        return sorted.sort((a, b) => {
          const compatibilityA = calculateCompatibilityScore(a, userProfile!)
          const compatibilityB = calculateCompatibilityScore(b, userProfile!)
          return compatibilityB - compatibilityA
        })
      
      default:
        return sorted
    }
  }

  const calculateCompatibilityScore = (profile: UserProfile, userProfile: UserProfile): number => {
    let score = 0
    
    // Distance factor (closer is better)
    const distance = calculateDistance(profile, userLocation)
    score += Math.max(0, 50 - distance * 2)
    
    // Handicap compatibility
    const handicapDiff = Math.abs(profile.handicap - userProfile.handicap)
    score += Math.max(0, 30 - handicapDiff * 2)
    
    // Rating bonus
    score += (profile.avg_rating || 0) * 10
    
    // Verification bonus
    if (profile.is_verified) score += 20
    
    // Activity bonus
    const lastActive = new Date(profile.last_active)
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceActive < 7) score += 15
    
    return score
  }

  const handleSwipe = async (direction: SwipeDirection) => {
    if (currentIndex >= profiles.length) return

    const currentProfile = profiles[currentIndex]
    const isLike = direction === 'right'

    // Check if user can like (for free users)
    if (isLike && user?.id) {
      const canLikeResult = await SubscriptionService.canUserLike(user.id)
      
      if (!canLikeResult.canLike) {
        setUpgradeTrigger('daily_limit')
        setShowUpgradePrompt(true)
        toast.error(canLikeResult.reason || 'Daily limit reached')
        return
      }
    }

    try {
      if (!user?.id) {
        toast.error('Authentication required')
        return
      }

      const result = await MatchingService.processSwipe(
        user.id,
        currentProfile.id,
        isLike
      )

      if (result.success && result.isMatch) {
        toast.success(`It's a match with ${currentProfile.full_name}! 🎉`)
      }

      // Record the like if it was a like action
      if (isLike && user?.id) {
        await SubscriptionService.recordLike(user.id)
      }

      // Move to next profile
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Error processing swipe:', error)
      toast.error('Failed to process swipe')
    }
  }

  const handleReport = (profile: UserProfile) => {
    setSelectedProfile(profile)
    setShowReportModal(true)
  }

  const handleBlock = (profile: UserProfile) => {
    setSelectedProfile(profile)
    setShowBlockModal(true)
  }

  const handleBlockSuccess = () => {
    // Remove the blocked user from the profiles list
    if (selectedProfile) {
      setProfiles(prev => prev.filter(p => p.id !== selectedProfile.id))
      // If we blocked the current profile, move to next
      if (profiles[currentIndex]?.id === selectedProfile.id) {
        setCurrentIndex(prev => prev + 1)
      }
    }
  }

  const handlePreferencesChange = (newPreferences: MatchingPreferences) => {
    // Check if user is trying to use premium features
    const hasAdvancedFilters = newPreferences.playingStyle || newPreferences.paceOfPlay || newPreferences.groupSize || newPreferences.onlyVerified || (newPreferences.minRating && newPreferences.minRating > 0)
    const hasExtendedRadius = newPreferences.maxDistance > 25

    if ((hasAdvancedFilters || hasExtendedRadius) && !isPremium) {
      setUpgradeTrigger('feature_lock')
      setShowUpgradePrompt(true)
      return
    }

    setMatchingPreferences(newPreferences)
    setCurrentIndex(0) // Reset to first profile
  }

  const handleSortChange = (newSort: SortOption) => {
    setCurrentSort(newSort)
    const sortedProfiles = sortProfiles(profiles, newSort, userLocation)
    setProfiles(sortedProfiles)
    setCurrentIndex(0) // Reset to first profile
  }

  const handleExpandRadius = (newRadius: number) => {
    // Check if user can use extended radius
    if (newRadius > 25) {
      setUpgradeTrigger('feature_lock')
      setShowUpgradePrompt(true)
      return
    }

    setSearchRadius(newRadius)
    setShowExpandRadiusPrompt(false)
    toast.success(`Search radius expanded to ${newRadius} miles`)
  }

  const handleLocationUpdate = (location: { latitude: number; longitude: number; address: string }) => {
    setUserLocation(location)
    // Update user profile with new location
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        latitude: location.latitude,
        longitude: location.longitude,
        location: location.address
      })
    }
  }

  const handleRadiusUpdate = (radius: number) => {
    // Check if user can use extended radius
    if (radius > 25) {
      setUpgradeTrigger('feature_lock')
      setShowUpgradePrompt(true)
      return
    }

    setSearchRadius(radius)
    setMatchingPreferences(prev => ({ ...prev, maxDistance: radius }))
  }

  const calculateDistance = (matchProfile: UserProfile, userLocation: { latitude: number; longitude: number }) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (matchProfile.latitude - userLocation.latitude) * (Math.PI / 180)
    const dLon = (matchProfile.longitude - userLocation.longitude) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.latitude * (Math.PI / 180)) *
        Math.cos(matchProfile.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Finding golf partners...</p>
        </div>
      </div>
    )
  }

  if (currentIndex >= profiles.length) {
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
                  <span className="text-xl font-bold text-gray-900">Golf Matching</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <NoProfilesEmptyState onRefresh={loadProfiles} />
        </div>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]

  return (
    <AuthGuard requireProfile={true}>
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
                <span className="text-xl font-bold text-gray-900">Golf Matching</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Usage Tracker */}
              <UsageTracker userId={user?.id || ''} />

              {/* Location Settings Button */}
              <SimpleTooltip content="Update location and search radius">
                <Button
                  onClick={() => setShowLocationSettings(true)}
                  variant="outline"
                  size="sm"
                  className="text-gray-600"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {searchRadius} mi
                  {searchRadius > 25 && !isPremium && (
                    <PremiumLock feature="extended search radius" className="ml-2" />
                  )}
                </Button>
              </SimpleTooltip>

              {/* Sort Options */}
              <SortOptions
                currentSort={currentSort}
                onSortChange={handleSortChange}
                isOpen={showSortOptions}
                onToggle={() => setShowSortOptions(!showSortOptions)}
              />

              {/* Filters Button */}
              <SimpleTooltip content="Customize matching preferences">
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  size="sm"
                  className="text-gray-600"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {!isPremium && (
                    <PremiumLock feature="advanced filters" className="ml-2" />
                  )}
                </Button>
              </SimpleTooltip>

              <SimpleTooltip content="Progress through available profiles">
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {profiles.length}
                </span>
              </SimpleTooltip>
              <SimpleTooltip content="Get help with matching and swiping">
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </SimpleTooltip>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Like Limit Warning */}
                  <LikeLimitWarning userId={user?.id || ''} className="mb-4" />

        {/* Expand Radius Prompt */}
        {showExpandRadiusPrompt && (
          <ExpandRadiusPrompt
            currentRadius={searchRadius}
            suggestedRadius={Math.min(searchRadius * 2, 100)}
            currentMatchCount={profiles.length}
            onExpandRadius={handleExpandRadius}
            onDismiss={() => setShowExpandRadiusPrompt(false)}
          />
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
          {/* Profile Image */}
          <div className="relative h-96 bg-gradient-to-br from-green-400 to-blue-500">
            {currentProfile.avatar_url ? (
              <img
                src={currentProfile.avatar_url}
                alt={currentProfile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-2xl font-semibold">{currentProfile.full_name}</p>
                </div>
              </div>
            )}
            
            {/* Distance Badge */}
            <SimpleTooltip content="Distance from your location">
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center cursor-pointer">
                <MapPin className="h-4 w-4 mr-1" />
                {calculateDistance(currentProfile, userLocation)} mi
              </div>
            </SimpleTooltip>

            {/* Handicap Badge */}
            <SimpleTooltip content="Golfer's handicap index">
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium cursor-pointer">
                {currentProfile.handicap} handicap
              </div>
            </SimpleTooltip>

            {/* Trust Indicators */}
            <div className="absolute top-16 left-4 space-y-1">
              {currentProfile.is_verified && (
                <SimpleTooltip content="Verified golfer with good ratings">
                  <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center cursor-pointer">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </div>
                </SimpleTooltip>
              )}
              {currentProfile.total_ratings === 0 && (
                <SimpleTooltip content="New to the app">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center cursor-pointer">
                    <Award className="h-3 w-3 mr-1" />
                    New to App
                  </div>
                </SimpleTooltip>
              )}
              {isActiveThisWeek(currentProfile.last_active) && (
                <SimpleTooltip content="Active this week">
                  <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center cursor-pointer">
                    <Users className="h-3 w-3 mr-1" />
                    Active
                  </div>
                </SimpleTooltip>
              )}
            </div>

            {/* Safety Menu */}
            <div className="absolute top-4 right-16">
              <div className="relative group">
                <SimpleTooltip content="More options">
                  <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-white transition-colors cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </SimpleTooltip>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleReport(currentProfile)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Flag className="h-4 w-4 mr-2 text-yellow-600" />
                    Report User
                  </button>
                  <button
                    onClick={() => handleBlock(currentProfile)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Ban className="h-4 w-4 mr-2 text-red-600" />
                    Block User
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentProfile.full_name}
            </h2>
            
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{currentProfile.location}</span>
            </div>

            {/* Rating Display */}
            {currentProfile.avg_rating > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(currentProfile.avg_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {currentProfile.avg_rating.toFixed(1)} ({currentProfile.total_ratings} reviews)
                </span>
              </div>
            )}

            {currentProfile.bio && (
              <p className="text-gray-700 mb-4 line-clamp-3">
                {currentProfile.bio}
              </p>
            )}

            {/* Enhanced Profile Details */}
            <div className="space-y-3 mb-6">
              {/* Home Course */}
              {currentProfile.home_course && (
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="h-4 w-4 mr-2 text-green-600" />
                  <span>Home: {currentProfile.home_course}</span>
                </div>
              )}

              {/* Playing Style */}
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                <span>{getPlayingStyleDisplay(currentProfile.playing_style)} • {getPaceDisplay(currentProfile.pace_of_play)} • {getGroupSizeDisplay(currentProfile.preferred_group_size)}</span>
              </div>

              {/* Rounds Played */}
              {currentProfile.total_rounds > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  <span>{currentProfile.total_rounds} rounds played through the app</span>
                </div>
              )}
            </div>

            {/* Preferred Times */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Preferred Times
              </h3>
              <div className="flex flex-wrap gap-1">
                {currentProfile.preferred_times.slice(0, 3).map((time, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {getPlayingTimeDisplay(time)}
                  </span>
                ))}
                {currentProfile.preferred_times.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{currentProfile.preferred_times.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <SimpleTooltip content="Pass on this profile">
                <Button
                  onClick={() => handleSwipe('left')}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
                >
                  <X className="h-6 w-6" />
                </Button>
              </SimpleTooltip>
              <SimpleTooltip content="Like this profile">
                <Button
                  onClick={() => handleSwipe('right')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </SimpleTooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedProfile && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={selectedProfile.id}
          reportedUserName={selectedProfile.full_name}
          currentUserId={user?.id || ''}
        />
      )}

      {/* Block Modal */}
      {selectedProfile && (
        <BlockModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          blockedUserId={selectedProfile.id}
          blockedUserName={selectedProfile.full_name}
          currentUserId={user?.id || ''}
          onBlockSuccess={handleBlockSuccess}
        />
      )}

      {/* Discovery Filters Modal */}
      <DiscoveryFilters
        preferences={matchingPreferences}
        onPreferencesChange={handlePreferencesChange}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
      />

      {/* Location Settings Modal */}
      {showLocationSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Location Settings</h2>
                <button
                  onClick={() => setShowLocationSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <LocationSettings
                currentLocation={userLocation}
                searchRadius={searchRadius}
                onLocationUpdate={handleLocationUpdate}
                onRadiusUpdate={handleRadiusUpdate}
                onClose={() => setShowLocationSettings(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        trigger={upgradeTrigger}
      />

      {/* Floating Upgrade Button for Free Users */}
      {!isPremium && (
        <div className="fixed bottom-6 right-6 z-50">
          <UpgradeButton
            size="lg"
            className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Upgrade to Premium
          </UpgradeButton>
        </div>
      )}
      </div>
    </AuthGuard>
  )
} 