'use client'

import { useState } from 'react'
import { Target, Users, MessageCircle, Star, Shield, ArrowRight, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WelcomeTutorialProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

const tutorialSteps = [
  {
    id: 1,
    title: 'Welcome to Golf Buddy Matcher!',
    subtitle: 'Find your perfect golf partner',
    description: 'Connect with compatible golfers in your area. No more awkward random pairings at the course!',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    image: '/api/placeholder/400/300'
  },
  {
    id: 2,
    title: 'Smart Matching',
    subtitle: 'Based on your preferences',
    description: 'We match you with golfers within 25 miles who have similar handicaps and playing styles.',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    image: '/api/placeholder/400/300'
  },
  {
    id: 3,
    title: 'Safe & Verified',
    subtitle: 'Trust the community',
    description: 'All users are verified and rated by the community. Report any issues and we\'ll handle them quickly.',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    image: '/api/placeholder/400/300'
  },
  {
    id: 4,
    title: 'Rate & Review',
    subtitle: 'Build trust together',
    description: 'After playing together, rate your experience to help build a trusted community of golfers.',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    image: '/api/placeholder/400/300'
  },
  {
    id: 5,
    title: 'Ready to Start?',
    subtitle: 'Let\'s find your golf buddy',
    description: 'Complete your profile and start swiping to find your perfect golf partner!',
    icon: MessageCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    image: '/api/placeholder/400/300'
  }
]

export default function WelcomeTutorial({ isOpen, onComplete, onSkip }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const currentTutorial = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-gray-900">Welcome!</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tutorial Content */}
          <div className="text-center mb-8">
            {/* Icon */}
            <div className={`w-20 h-20 ${currentTutorial.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <currentTutorial.icon className={`h-10 w-10 ${currentTutorial.color}`} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentTutorial.title}
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-4">
              {currentTutorial.subtitle}
            </p>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {currentTutorial.description}
            </p>
          </div>

          {/* Feature Highlights */}
          {currentStep === 1 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">How Matching Works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Distance: Within 25 miles</li>
                <li>• Handicap: ±5 strokes difference</li>
                <li>• Playing style: Competitive, casual, or beginner-friendly</li>
                <li>• Preferred times: Morning, afternoon, weekends</li>
              </ul>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-purple-900 mb-2">Safety Features:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Email verification required</li>
                <li>• Report inappropriate behavior</li>
                <li>• Block users instantly</li>
                <li>• Community ratings and reviews</li>
              </ul>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-900 mb-2">Rating Categories:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Showed up on time</li>
                <li>• Fun to play with</li>
                <li>• Good golf etiquette</li>
                <li>• Would play again</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          {!isLastStep && (
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip tutorial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 