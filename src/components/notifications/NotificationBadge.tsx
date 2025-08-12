'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { NotificationService } from '@/lib/notifications'

interface NotificationBadgeProps {
  userId: string
  onClick: () => void
  className?: string
}

export default function NotificationBadge({ userId, onClick, className = '' }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUnreadCount()
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [userId])

  const loadUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-green-600 transition-colors ${className}`}
      disabled={loading}
    >
      <Bell className="h-5 w-5" />
      
      {/* Badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && unreadCount === 0 && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      )}
    </button>
  )
} 