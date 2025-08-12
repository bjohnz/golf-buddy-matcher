'use client'

import { useState } from 'react'
import { Filter, MapPin, Clock, Users, Star, Sliders, X, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MatchingPreferences, HandicapRange, PlayingTime } from '@/types'
import PremiumBadge, { PremiumLock } from '@/components/subscription/PremiumBadge'
import { SubscriptionService } from '@/lib/subscriptions'

interface DiscoveryFiltersProps {
  preferences: MatchingPreferences
  onPreferencesChange: (preferences: MatchingPreferences) => void
  onClose?: () => void
  isOpen: boolean
}

export default function DiscoveryFilters({
  preferences,
  onPreferencesChange,
  onClose,
  isOpen
}: DiscoveryFiltersProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  // Check premium status on mount
  useState(() => {
    checkPremiumStatus()
  })

  const checkPremiumStatus = async () => {
    try {
      const subscription = await SubscriptionService.getUserSubscription('current-user-id')
      setIsPremium(subscription?.tier === 'premium')
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  const playingStyles = [
    { value: 'competitive', label: 'Competitive', description: 'Serious golfers focused on score' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, fun-focused players' },
    { value: 'beginner_friendly', label: 'Beginner-Friendly', description: 'Patient with newer players' }
  ]

  const paceOptions = [
    { value: 'fast', label: 'Fast', description: 'Quick pace, minimal delays' },
    { value: 'moderate', label: 'Moderate', description: 'Standard pace of play' },
    { value: 'relaxed', label: 'Relaxed', description: 'Leisurely, no rush' }
  ]

  const groupSizeOptions = [
    { value: 'twosome', label: 'Twosome', description: 'Prefer playing in pairs' },
    { value: 'foursome', label: 'Foursome', description: 'Like playing in groups of 4' },
    { value: 'flexible', label: 'Flexible', description: 'Open to any group size' }
  ]

  const timeOptions = [
    { value: 'early_morning', label: 'Early Morning', description: 'Before 9 AM' },
    { value: 'morning', label: 'Morning', description: '9 AM - 12 PM' },
    { value: 'afternoon', label: 'Afternoon', description: '12 PM - 5 PM' },
    { value: 'evening', label: 'Evening', description: 'After 5 PM' },
    { value: 'weekends_only', label: 'Weekends Only', description: 'Saturday & Sunday' }
  ]

  const handlePreferenceChange = (key: keyof MatchingPreferences, value: string | number | boolean | string[] | HandicapRange) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleApplyFilters = () => {
    onPreferencesChange(localPreferences)
    onClose?.()
  }

  const handleResetFilters = () => {
    const defaultPreferences: MatchingPreferences = {
      maxDistance: 25,
      handicapRange: { min: 0, max: 30 },
      preferredTimes: ['morning', 'afternoon'],
      playingStyle: undefined,
      paceOfPlay: undefined,
      groupSize: undefined,
      onlyVerified: false,
      minRating: 0
    }
    setLocalPreferences(defaultPreferences)
  }

  const handleClose = () => {
    setLocalPreferences(preferences) // Reset to original
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Filter className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Discovery Filters</h2>
              <p className="text-sm text-gray-600">Customize your matching preferences</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Distance Range */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Distance Range
              {localPreferences.maxDistance > 25 && !isPremium && (
                <PremiumLock feature="extended search radius" className="ml-2" />
              )}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Max Distance</span>
                <span>{localPreferences.maxDistance} miles</span>
              </div>
              <input
                type="range"
                min="10"
                max={isPremium ? "100" : "25"}
                step="5"
                value={localPreferences.maxDistance}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (value > 25 && !isPremium) {
                    // Show upgrade prompt for extended radius
                    return
                  }
                  handlePreferenceChange('maxDistance', value)
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10 mi</span>
                <span>{isPremium ? "100 mi" : "25 mi"}</span>
              </div>
              {!isPremium && localPreferences.maxDistance >= 25 && (
                <div className="text-xs text-gray-500 text-center">
                  Upgrade to Premium for up to 100-mile search radius
                </div>
              )}
            </div>
          </div>

          {/* Handicap Range */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Handicap Range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={localPreferences.handicapRange.min}
                  onChange={(e) => handlePreferenceChange('handicapRange', {
                    ...localPreferences.handicapRange,
                    min: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={localPreferences.handicapRange.max}
                  onChange={(e) => handlePreferenceChange('handicapRange', {
                    ...localPreferences.handicapRange,
                    max: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Preferred Times */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Preferred Times
            </h3>
            <div className="space-y-2">
              {timeOptions.map((time) => (
                <label
                  key={time.value}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={localPreferences.preferredTimes.includes(time.value as PlayingTime)}
                    onChange={(e) => {
                      const newTimes = e.target.checked
                        ? [...localPreferences.preferredTimes, time.value]
                        : localPreferences.preferredTimes.filter(t => t !== time.value)
                      handlePreferenceChange('preferredTimes', newTimes)
                    }}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{time.label}</div>
                    <div className="text-sm text-gray-600">{time.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <Sliders className="h-4 w-4 mr-2" />
                <span className="font-medium text-gray-900">Advanced Filters</span>
                {!isPremium && (
                  <PremiumLock feature="advanced filters" className="ml-2" />
                )}
              </div>
              <span className="text-sm text-gray-500">
                {showAdvanced ? 'Hide' : 'Show'}
              </span>
            </button>
            {!isPremium && (
              <div className="text-xs text-gray-500 mt-1">
                Upgrade to Premium to unlock advanced filtering options
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4">
              {/* Playing Style */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Playing Style</h4>
                <div className="space-y-2">
                  {playingStyles.map((style) => (
                    <label
                      key={style.value}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="playingStyle"
                        value={style.value}
                        checked={localPreferences.playingStyle === style.value}
                        onChange={(e) => handlePreferenceChange('playingStyle', e.target.value)}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{style.label}</div>
                        <div className="text-sm text-gray-600">{style.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pace of Play */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Pace of Play</h4>
                <div className="space-y-2">
                  {paceOptions.map((pace) => (
                    <label
                      key={pace.value}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="paceOfPlay"
                        value={pace.value}
                        checked={localPreferences.paceOfPlay === pace.value}
                        onChange={(e) => handlePreferenceChange('paceOfPlay', e.target.value)}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{pace.label}</div>
                        <div className="text-sm text-gray-600">{pace.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group Size */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Preferred Group Size
                </h4>
                <div className="space-y-2">
                  {groupSizeOptions.map((size) => (
                    <label
                      key={size.value}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="groupSize"
                        value={size.value}
                        checked={localPreferences.groupSize === size.value}
                        onChange={(e) => handlePreferenceChange('groupSize', e.target.value)}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{size.label}</div>
                        <div className="text-sm text-gray-600">{size.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Additional Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localPreferences.onlyVerified}
                      onChange={(e) => handlePreferenceChange('onlyVerified', e.target.checked)}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Only Verified Golfers</div>
                      <div className="text-sm text-gray-600">Show only users with good ratings</div>
                    </div>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Rating
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={localPreferences.minRating}
                      onChange={(e) => handlePreferenceChange('minRating', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Premium Features */}
              {isPremium && (
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Crown className="h-4 w-4 mr-2 text-green-600" />
                    Premium Features
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Priority Placement</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Your profile appears higher in other users&apos; discovery feeds
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Profile Boosts</span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">3 remaining</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Boost your profile visibility for 30 minutes
                      </p>
                      <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Use Boost
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 