import React, { useState } from 'react'
import { X, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RatingService } from '@/lib/ratings'
import { RatingFormData } from '@/types'
import toast from 'react-hot-toast'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  raterId: string
  ratedUserId: string
  ratedUserName: string
  matchId: string
  onRatingSubmitted?: () => void
}

export default function RatingModal({
  isOpen,
  onClose,
  raterId,
  ratedUserId,
  ratedUserName,
  matchId,
  onRatingSubmitted
}: RatingModalProps) {
  const [ratingData, setRatingData] = useState<RatingFormData>({
    overall_rating: 0,
    showed_up: 0,
    fun_factor: 0,
    etiquette: 0,
    would_play_again: 0,
    feedback_text: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ratingCategories = RatingService.getRatingCategories()

  const handleStarClick = (category: keyof RatingFormData, value: number) => {
    setRatingData(prev => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that all ratings are provided
    const requiredFields: (keyof RatingFormData)[] = ['overall_rating', 'showed_up', 'fun_factor', 'etiquette', 'would_play_again']
    const missingFields = requiredFields.filter(field => ratingData[field] === 0)
    
    if (missingFields.length > 0) {
      toast.error('Please provide ratings for all categories')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await RatingService.submitRating(
        raterId,
        ratedUserId,
        matchId,
        ratingData
      )

      if (result.success) {
        toast.success('Rating submitted successfully!')
        onRatingSubmitted?.()
        onClose()
        // Reset form
        setRatingData({
          overall_rating: 0,
          showed_up: 0,
          fun_factor: 0,
          etiquette: 0,
          would_play_again: 0,
          feedback_text: ''
        })
      } else {
        toast.error('Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarRating = (category: keyof RatingFormData, value: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(category, star)}
            className={`p-1 transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{value}/5</span>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Rate Your Experience</h2>
              <p className="text-sm text-gray-600">How was your round with {ratedUserName}?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Experience *
            </label>
            {renderStarRating('overall_rating', ratingData.overall_rating)}
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            {ratingCategories.map((category) => (
              <div key={category.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {category.label} *
                </label>
                <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                {renderStarRating(category.key, ratingData[category.key as keyof RatingFormData] as number || 0)}
              </div>
            ))}
          </div>

          {/* Feedback Text */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Additional feedback (optional)
            </label>
            <textarea
              id="feedback"
              value={ratingData.feedback_text}
              onChange={(e) => setRatingData(prev => ({ ...prev, feedback_text: e.target.value }))}
              placeholder="Share any additional thoughts about your golf experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {ratingData.feedback_text?.length || 0}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Your feedback helps the community</p>
                <p className="text-xs text-blue-700 mt-1">
                  Honest ratings help other golfers make informed decisions about who to play with.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || ratingData.overall_rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 