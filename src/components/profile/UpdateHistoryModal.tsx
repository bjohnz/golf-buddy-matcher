'use client'

import { useState, useEffect } from 'react'
import { X, Clock, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ProfileService, { ProfileUpdateLog } from '@/lib/profiles'

interface UpdateHistoryModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function UpdateHistoryModal({ userId, isOpen, onClose }: UpdateHistoryModalProps) {
  const [updateHistory, setUpdateHistory] = useState<ProfileUpdateLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadUpdateHistory()
    }
  }, [isOpen, userId])

  const loadUpdateHistory = async () => {
    try {
      setLoading(true)
      const history = await ProfileService.getUpdateHistory(userId)
      setUpdateHistory(history)
    } catch (error) {
      console.error('Error loading update history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFieldName = (field: string): string => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatFieldValue = (value: string | number | boolean | string[] | null | undefined): string => {
    if (value === null || value === undefined) return 'Not set'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None'
    if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...'
    return String(value)
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Profile Update History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner mr-3"></div>
              <span className="text-gray-600">Loading update history...</span>
            </div>
          ) : updateHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h3>
              <p className="text-gray-600">Your profile update history will appear here when you make changes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updateHistory.map((update) => (
                <div key={update.id || update.updated_at} className="bg-gray-50 rounded-lg p-4">
                  {/* Update Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-900">Profile Updated</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(update.updated_at)}
                    </span>
                  </div>

                  {/* Updated Fields */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {update.updated_fields.map((field) => (
                        <span
                          key={field}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {formatFieldName(field)}
                        </span>
                      ))}
                    </div>

                    {/* Field Changes */}
                    <div className="space-y-2">
                      {update.updated_fields.map((field) => {
                        const oldValue = update.old_values[field]
                        const newValue = update.new_values[field]
                        
                        return (
                          <div key={field} className="bg-white rounded p-3 border border-gray-200">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {formatFieldName(field)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500 block mb-1">From:</span>
                                <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                  {formatFieldValue(oldValue)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 block mb-1">To:</span>
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                  {formatFieldValue(newValue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}