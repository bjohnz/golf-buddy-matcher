import React, { useState } from 'react'
import { X, Ban, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SafetyService } from '@/lib/safety'
import toast from 'react-hot-toast'

interface BlockModalProps {
  isOpen: boolean
  onClose: () => void
  blockedUserId: string
  blockedUserName: string
  currentUserId: string
  onBlockSuccess?: () => void
}

export default function BlockModal({
  isOpen,
  onClose,
  blockedUserId,
  blockedUserName,
  currentUserId,
  onBlockSuccess
}: BlockModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBlock = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await SafetyService.blockUser(currentUserId, blockedUserId)

      if (result.success) {
        toast.success(`${blockedUserName} has been blocked`)
        onBlockSuccess?.()
        onClose()
      } else {
        toast.error('Failed to block user')
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error('Failed to block user')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Block User</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to block {blockedUserName}? You won&apos;t be able to see their profile or receive messages from them.
              </p>
              <p className="text-sm text-gray-500">
                You can unblock them later in your settings if you change your mind.
              </p>
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
        <div className="p-6 space-y-4">
          {/* User being blocked */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Blocking:</p>
            <p className="font-medium text-gray-900">{blockedUserName}</p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">What happens when you block someone:</p>
                <ul className="text-xs text-red-700 mt-2 space-y-1">
                  <li>• They won&apos;t appear in your matches or discovery</li>
                  <li>• You won&apos;t receive messages from them</li>
                  <li>• Any existing match will be removed</li>
                  <li>• This action cannot be undone immediately</li>
                </ul>
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
              type="button"
              onClick={handleBlock}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Blocking...' : 'Block User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 