import React, { useState } from 'react'
import { X, AlertTriangle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SafetyService } from '@/lib/safety'
import { ReportReason } from '@/types'
import toast from 'react-hot-toast'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  currentUserId: string
}

export default function ReportModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  currentUserId
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportReasons = SafetyService.getReportReasons()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      toast.error('Please select a reason for reporting')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await SafetyService.reportUser(
        currentUserId,
        reportedUserId,
        reason as ReportReason,
        description.trim() || undefined
      )

      if (result.success) {
        toast.success('Report submitted successfully')
        onClose()
        // Reset form
        setReason('')
        setDescription('')
      } else {
        toast.error('Failed to submit report')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Report User</h2>
              <p className="text-sm text-gray-600">Help us keep the community safe</p>
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
          {/* User being reported */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Reporting:</p>
            <p className="font-medium text-gray-900">{reportedUserName}</p>
          </div>

          {/* Report reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for reporting *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reportReason) => (
                <label
                  key={reportReason.value}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reportReason.value}
                    checked={reason === reportReason.value}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reportReason.label}
                    </p>
                    <p className="text-xs text-gray-600">
                      {reportReason.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context that will help us understand the issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Safety notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Your safety matters</p>
                <p className="text-xs text-blue-700 mt-1">
                  We take all reports seriously and will review them promptly. 
                  Your identity will remain confidential.
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
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 