import React from 'react'
import { Heart, MessageCircle, X } from 'lucide-react'
import { UserProfile } from '@/types'
import { Button } from '@/components/ui/Button'

interface MatchNotificationProps {
  matchedProfile: UserProfile
  onMessage: () => void
  onContinue: () => void
  onClose: () => void
}

export default function MatchNotification({ 
  matchedProfile, 
  onMessage, 
  onContinue, 
  onClose 
}: MatchNotificationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Celebration animation */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="h-10 w-10 text-white fill-current" />
          </div>
        </div>

        {/* Match text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          It&apos;s a Match! 🎉
        </h2>
        <p className="text-sm text-gray-600">
          You&apos;ve got a new match with {matchedProfile.full_name}!
        </p>

        {/* Matched profile info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              {matchedProfile.avatar_url ? (
                <img
                  src={matchedProfile.avatar_url}
                  alt={matchedProfile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {matchedProfile.full_name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{matchedProfile.full_name}</h3>
              <p className="text-sm text-gray-600">
                Handicap: {matchedProfile.handicap} • {matchedProfile.location}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={onMessage}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button
            onClick={onContinue}
            variant="outline"
            className="w-full"
          >
            Keep Swiping
          </Button>
        </div>

        {/* Fun fact */}
        <p className="text-xs text-gray-500 mt-4">
          💡 Tip: Send a message within 24 hours for the best chance of connecting!
        </p>
      </div>
    </div>
  )
} 