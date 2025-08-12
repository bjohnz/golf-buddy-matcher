'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Heart, MessageCircle, Star, Users, MapPin, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Notification {
  id: string
  type: 'match' | 'message' | 'rating' | 'profile_view' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  metadata?: {
    userId?: string
    userName?: string
    matchId?: string
    rating?: number
  }
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onNotificationClick: (notification: Notification) => void
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'match':
      return Heart
    case 'message':
      return MessageCircle
    case 'rating':
      return Star
    case 'profile_view':
      return Users
    case 'system':
      return Bell
    default:
      return Bell
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'match':
      return 'text-pink-600 bg-pink-100'
    case 'message':
      return 'text-blue-600 bg-blue-100'
    case 'rating':
      return 'text-yellow-600 bg-yellow-100'
    case 'profile_view':
      return 'text-green-600 bg-green-100'
    case 'system':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const formatNotificationTime = (timestamp: string) => {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return notificationTime.toLocaleDateString()
}

export default function NotificationCenter({ isOpen, onClose, onNotificationClick }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'match',
          title: 'New Match!',
          message: 'You matched with Sarah Johnson',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/matches',
          metadata: {
            userId: 'user-1',
            userName: 'Sarah Johnson'
          }
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          message: 'Mike Chen sent you a message',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/chat/match-2',
          metadata: {
            userId: 'user-2',
            userName: 'Mike Chen',
            matchId: 'match-2'
          }
        },
        {
          id: '3',
          type: 'rating',
          title: 'New Rating',
          message: 'David Wilson rated your golf experience 5 stars',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          metadata: {
            userId: 'user-3',
            userName: 'David Wilson',
            rating: 5
          }
        },
        {
          id: '4',
          type: 'profile_view',
          title: 'Profile Viewed',
          message: 'Someone viewed your profile',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isRead: true
        },
        {
          id: '5',
          type: 'system',
          title: 'Welcome to Golf Buddy Matcher!',
          message: 'Complete your profile to get better matches',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          actionUrl: '/profile'
        }
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API call
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    onNotificationClick(notification)
  }

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.isRead
  )

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {unreadCount} unread • {notifications.length} total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-6 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const colorClasses = getNotificationColor(notification.type)
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${colorClasses}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium text-sm ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        {notification.metadata?.rating && (
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= notification.metadata!.rating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 