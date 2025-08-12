'use client'

import { useState, useEffect } from 'react'
import { Zap, Crown, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SubscriptionService } from '@/lib/subscriptions'
import toast from 'react-hot-toast'

interface ProfileBoostProps {
  userId: string
  className?: string
}

interface BoostStatus {
  isActive: boolean
  remainingTime?: number // in seconds
  boostsRemaining: number
}

export default function ProfileBoost({ userId, className = '' }: ProfileBoostProps) {
  const [boostStatus, setBoostStatus] = useState<BoostStatus>({
    isActive: false,
    boostsRemaining: 3
  })
  const [loading, setLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    checkPremiumStatus()
    loadBoostStatus()
  }, [userId])

  const checkPremiumStatus = async () => {
    try {
      const subscription = await SubscriptionService.getUserSubscription(userId)
      setIsPremium(subscription?.tier === 'premium')
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  const loadBoostStatus = async () => {
    try {
      // Mock data for development
      const mockBoostStatus: BoostStatus = {
        isActive: false,
        boostsRemaining: 3
      }
      setBoostStatus(mockBoostStatus)
    } catch (error) {
      console.error('Error loading boost status:', error)
    }
  }

  const handleBoost = async () => {
    if (!isPremium) {
      toast.error('Profile boosts are a Premium feature')
      return
    }

    if (boostStatus.boostsRemaining <= 0) {
      toast.error('No boosts remaining')
      return
    }

    try {
      setLoading(true)
      
      // Mock boost activation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setBoostStatus(prev => ({
        ...prev,
        isActive: true,
        remainingTime: 30 * 60, // 30 minutes in seconds
        boostsRemaining: prev.boostsRemaining - 1
      }))
      
      toast.success('Profile boost activated! Your profile will be more visible for 30 minutes.')
    } catch (error) {
      console.error('Error activating boost:', error)
      toast.error('Failed to activate boost')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!isPremium) {
    return null
  }

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-gray-900">Profile Boost</span>
          <Crown className="h-4 w-4 text-green-600" />
        </div>
        <span className="text-xs text-gray-500">
          {boostStatus.boostsRemaining} remaining
        </span>
      </div>

      {boostStatus.isActive && boostStatus.remainingTime ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-2 bg-green-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Boost Active</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Time remaining: {formatTime(boostStatus.remainingTime)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Your profile is being shown to more users
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Boost your profile visibility for 30 minutes to get more matches
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>Appears higher in discovery feeds</span>
          </div>
          <Button
            onClick={handleBoost}
            disabled={loading || boostStatus.boostsRemaining <= 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="loading-spinner h-4 w-4"></div>
                <span>Activating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Boost Profile</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  )
} 