'use client'

import { useState } from 'react'
import { MapPin, Users, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ExpandRadiusPromptProps {
  currentRadius: number
  suggestedRadius: number
  currentMatchCount: number
  onExpandRadius: (newRadius: number) => void
  onDismiss: () => void
}

export default function ExpandRadiusPrompt({
  currentRadius,
  suggestedRadius,
  currentMatchCount,
  onExpandRadius,
  onDismiss
}: ExpandRadiusPromptProps) {
  const [isExpanding, setIsExpanding] = useState(false)

  const handleExpandRadius = async () => {
    setIsExpanding(true)
    try {
      await onExpandRadius(suggestedRadius)
    } finally {
      setIsExpanding(false)
    }
  }

  const getRadiusDescription = (radius: number) => {
    switch (radius) {
      case 10:
        return 'Very local area'
      case 25:
        return 'Recommended range'
      case 50:
        return 'Extended area'
      case 100:
        return 'Wide search area'
      default:
        return `${radius} mile radius`
    }
  }

  const getMatchCountDescription = (count: number) => {
    if (count === 0) return 'No matches found'
    if (count === 1) return 'Only 1 match found'
    if (count < 5) return `Only ${count} matches found`
    return `${count} matches found`
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-blue-900">Expand Your Search?</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {getMatchCountDescription(currentMatchCount)}
              </span>
            </div>
            
            <p className="text-sm text-blue-800 mb-3">
              You currently have {currentMatchCount} potential matches within {currentRadius} miles. 
              Expanding to {suggestedRadius} miles could help you find more golf partners.
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-blue-700">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Current: {currentRadius} mi</span>
              </div>
              <ArrowRight className="h-3 w-3" />
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Suggested: {suggestedRadius} mi</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex space-x-3 mt-4">
        <Button
          onClick={handleExpandRadius}
          disabled={isExpanding}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isExpanding ? 'Expanding...' : `Expand to ${suggestedRadius} mi`}
        </Button>
        
        <Button
          onClick={onDismiss}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          Maybe Later
        </Button>
      </div>
      
      <div className="mt-3 p-2 bg-white rounded border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> You can always adjust your search radius in settings. 
          {suggestedRadius > 50 && ' Consider updating your location to a nearby city for better results.'}
        </p>
      </div>
    </div>
  )
} 