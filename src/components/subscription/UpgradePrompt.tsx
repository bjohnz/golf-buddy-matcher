'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, Star, Zap, Eye, MapPin, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  trigger?: 'daily_limit' | 'feature_lock' | 'general'
  className?: string
}

export default function UpgradePrompt({ 
  isOpen, 
  onClose, 
  trigger = 'general',
  className = '' 
}: UpgradePromptProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const getTriggerContent = () => {
    switch (trigger) {
      case 'daily_limit':
        return {
          title: 'Daily Limit Reached',
          subtitle: 'You\'ve used all 15 likes for today',
          description: 'Upgrade to Premium for unlimited likes and find more golf partners!',
          cta: 'Get Unlimited Likes'
        }
      case 'feature_lock':
        return {
          title: 'Premium Feature',
          subtitle: 'This feature is only available to Premium members',
          description: 'Unlock advanced filters, extended search radius, and more with Premium.',
          cta: 'Upgrade to Premium'
        }
      default:
        return {
          title: 'Upgrade to Premium',
          subtitle: 'Get the most out of Golf Buddy Matcher',
          description: 'Unlock unlimited likes, advanced features, and find more golf partners.',
          cta: 'Start Premium Trial'
        }
    }
  }

  const content = getTriggerContent()

  const features = [
    {
      icon: Zap,
      title: 'Unlimited Likes',
      description: 'Like as many profiles as you want'
    },
    {
      icon: MapPin,
      title: 'Extended Search',
      description: 'Search up to 100 miles radius'
    },
    {
      icon: Filter,
      title: 'Advanced Filters',
      description: 'Filter by playing style, pace, and more'
    },
    {
      icon: Eye,
      title: 'See Who Liked You',
      description: 'Know who\'s interested in playing with you'
    }
  ]

  const handleUpgrade = () => {
    setLoading(true)
    // TODO: Implement upgrade flow
    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {content.title}
            </h2>
            <p className="text-lg text-gray-600 mb-1">
              {content.subtitle}
            </p>
            <p className="text-sm text-gray-500">
              {content.description}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Start with a 7-day free trial
              </p>
              <div className="flex items-center justify-center space-x-1 text-sm text-green-600">
                <Star className="h-4 w-4 fill-current" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  {content.cta}
                </>
              )}
            </Button>
            
            <Link href="/pricing" className="block">
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                View All Plans
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By upgrading, you agree to our{' '}
              <a href="/terms" className="text-green-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 