import React from 'react'
import { MapPin, Star, Calendar, Target } from 'lucide-react'
import { UserProfile } from '@/types'
import { formatHandicap, formatDistance, getPlayingTimeDisplay } from '@/lib/utils'

interface ProfileCardProps {
  profile: UserProfile
  distance?: number
  onSwipe?: (direction: 'left' | 'right') => void
  className?: string
}

export default function ProfileCard({ profile, distance, onSwipe, className = '' }: ProfileCardProps) {
  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe?.(direction)
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Profile Image */}
      <div className="relative h-80 bg-gradient-to-br from-green-400 to-blue-500">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Target className="h-16 w-16 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-semibold">{profile.full_name}</p>
            </div>
          </div>
        )}
        
        {/* Distance Badge */}
        {distance && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {formatDistance(distance)}
          </div>
        )}
        
        {/* Handicap Badge */}
        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {formatHandicap(profile.handicap)}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        {/* Name and Age */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900">{profile.full_name}</h3>
          <div className="flex items-center space-x-1 text-green-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">Compatible</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">{profile.location}</span>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {profile.bio}
          </p>
        )}

        {/* Preferred Times */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Preferred Times
          </h4>
          <div className="flex flex-wrap gap-1">
            {profile.preferred_times.slice(0, 3).map((time, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
              >
                {getPlayingTimeDisplay(time)}
              </span>
            ))}
            {profile.preferred_times.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{profile.preferred_times.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => handleSwipe('left')}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            <span className="text-xl mr-2">✕</span>
            Pass
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <span className="text-xl mr-2">♥</span>
            Like
          </button>
        </div>
      </div>
    </div>
  )
} 