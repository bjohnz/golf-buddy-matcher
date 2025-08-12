'use client'

import { useState } from 'react'
import { User, Camera, MapPin, Target, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProfileCompletionPromptProps {
  profile: {
    full_name: string
    avatar_url?: string
    bio?: string
    handicap: number
    location: string
    photos: string[]
    home_course?: string
    playing_style?: string
    pace_of_play?: string
    preferred_group_size?: string
  }
  onComplete: () => void
  onSkip: () => void
}

const completionSteps = [
  {
    id: 'photo',
    title: 'Add a Profile Photo',
    description: 'A clear photo increases your match rate by 40%',
    icon: Camera,
    isComplete: (profile: ProfileCompletionPromptProps['profile']) => !!profile.avatar_url || profile.photos.length > 0,
    action: 'Add Photo'
  },
  {
    id: 'bio',
    title: 'Write a Bio',
    description: 'Tell others about your golf style and what you\'re looking for',
    icon: User,
    isComplete: (profile: ProfileCompletionPromptProps['profile']) => !!profile.bio && profile.bio.length > 20,
    action: 'Write Bio'
  },
  {
    id: 'location',
    title: 'Set Your Location',
    description: 'Help us find golfers near you',
    icon: MapPin,
    isComplete: (profile: ProfileCompletionPromptProps['profile']) => !!profile.location && profile.location !== 'Unknown',
    action: 'Set Location'
  },
  {
    id: 'preferences',
    title: 'Add Playing Preferences',
    description: 'Specify your style, pace, and group size preferences',
    icon: Target,
    isComplete: (profile: ProfileCompletionPromptProps['profile']) => !!(profile.playing_style && profile.pace_of_play && profile.preferred_group_size),
    action: 'Add Preferences'
  },
  {
    id: 'course',
    title: 'Add Home Course',
    description: 'Let others know where you typically play',
    icon: Star,
    isComplete: (profile: ProfileCompletionPromptProps['profile']) => !!profile.home_course,
    action: 'Add Course'
  }
]

export default function ProfileCompletionPrompt({ profile, onComplete, onSkip }: ProfileCompletionPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const completedSteps = completionSteps.filter(step => step.isComplete(profile))
  const incompleteSteps = completionSteps.filter(step => !step.isComplete(profile))
  const completionPercentage = Math.round((completedSteps.length / completionSteps.length) * 100)

  const handleComplete = () => {
    onComplete()
  }

  const handleSkip = () => {
    onSkip()
  }

  if (completionPercentage === 100) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Profile Complete!</h3>
            <p className="text-sm text-green-700">Your profile is fully optimized for better matches.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Complete Your Profile</h3>
            <p className="text-sm text-blue-700">
              {completionPercentage}% complete • {incompleteSteps.length} steps remaining
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowRight className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3">
          {completionSteps.map((step) => {
            const isComplete = step.isComplete(profile)
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  isComplete ? 'bg-green-100 border border-green-200' : 'bg-white border border-blue-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isComplete ? 'bg-green-200' : 'bg-blue-100'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <step.icon className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isComplete ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${
                    isComplete ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {!isComplete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    {step.action}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-4">
        <Button
          onClick={handleComplete}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Complete Profile
        </Button>
        <Button
          onClick={handleSkip}
          variant="outline"
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          Maybe Later
        </Button>
      </div>

      {/* Benefits */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Why complete your profile?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Get 3x more matches with a complete profile</li>
          <li>• Find golfers who match your playing style</li>
          <li>• Build trust with potential golf partners</li>
          <li>• Receive better recommendations</li>
        </ul>
      </div>
    </div>
  )
} 