import type { Notification } from '@/types'

// Notification types
export type NotificationType = 'match' | 'message' | 'rating' | 'profile_view' | 'system'

export interface NotificationPreferences {
  push_notifications: {
    new_matches: boolean
    new_messages: boolean
    new_ratings: boolean
    profile_views: boolean
    system_updates: boolean
  }
  email_notifications: {
    new_matches: boolean
    new_messages: boolean
    weekly_digest: boolean
    system_updates: boolean
  }
  in_app_notifications: {
    new_matches: boolean
    new_messages: boolean
    new_ratings: boolean
    profile_views: boolean
    system_updates: boolean
  }
}

export class NotificationService {
  private static isDevelopmentMode = process.env.NODE_ENV === 'development'

  // Push Notification Methods
  static async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // Send push notification
  static async sendPushNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'golf-buddy-matcher',
      requireInteraction: false,
      ...options
    }

    new Notification(title, defaultOptions)
  }

  static async sendMatchNotification(matchedUserName: string): Promise<void> {
    const title = '🎉 New Match!'
    const options: NotificationOptions = {
      body: `You matched with ${matchedUserName}! Start chatting to plan your golf round.`,
      icon: '/api/placeholder/192/192',
      badge: '/api/placeholder/72/72',
      tag: 'new-match',
      requireInteraction: true
    }

    await this.sendPushNotification(title, options)
  }

  static async sendMessageNotification(senderName: string, messagePreview: string): Promise<void> {
    const title = `💬 New message from ${senderName}`
    const options: NotificationOptions = {
      body: messagePreview,
      icon: '/api/placeholder/192/192',
      badge: '/api/placeholder/72/72',
      tag: 'new-message',
      requireInteraction: false
    }

    await this.sendPushNotification(title, options)
  }

  static async sendRatingNotification(raterName: string, rating: number): Promise<void> {
    const stars = '⭐'.repeat(rating)
    const title = `⭐ New rating from ${raterName}`
    const options: NotificationOptions = {
      body: `${stars} ${raterName} rated your golf experience ${rating} stars!`,
      icon: '/api/placeholder/192/192',
      badge: '/api/placeholder/72/72',
      tag: 'new-rating',
      requireInteraction: false
    }

    await this.sendPushNotification(title, options)
  }

  // Email Notification Methods
  static async sendEmailNotification(
    to: string,
    subject: string,
    template: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    if (this.isDevelopmentMode) {
      console.log('📧 Email notification (dev mode):', { to, subject, template, data })
      return true
    }

    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          template,
          data
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error sending email notification:', error)
      return false
    }
  }

  static async sendWeeklyDigest(userId: string, userEmail: string): Promise<boolean> {
    try {
      // TODO: Get user's weekly activity
      const weeklyStats = await this.getWeeklyStats(userId)
      
      const subject = 'Your Golf Buddy Matcher Weekly Digest'
      const template = 'weekly-digest'
      const data = {
        userName: 'Golfer', // TODO: Get actual user name
        weeklyStats,
        matchesThisWeek: weeklyStats.newMatches,
        messagesThisWeek: weeklyStats.newMessages,
        ratingsThisWeek: weeklyStats.newRatings
      }

      return await this.sendEmailNotification(userEmail, subject, template, data)
    } catch (error) {
      console.error('Error sending weekly digest:', error)
      return false
    }
  }

  // In-App Notification Methods
  static async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
    if (this.isDevelopmentMode) {
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
      
      console.log('📱 In-app notification created:', newNotification)
      return newNotification
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      })

      if (!response.ok) {
        throw new Error('Failed to create notification')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  static async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    if (this.isDevelopmentMode) {
      // Return mock notifications
      return [
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
        }
      ]
    }

    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    if (this.isDevelopmentMode) {
      console.log('📱 Marking notification as read:', notificationId)
      return true
    }

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      return response.ok
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    if (this.isDevelopmentMode) {
      console.log('📱 Marking all notifications as read for user:', userId)
      return true
    }

    try {
      const response = await fetch(`/api/notifications/${userId}/read-all`, {
        method: 'PUT'
      })

      return response.ok
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    if (this.isDevelopmentMode) {
      return 2 // Mock unread count
    }

    try {
      const response = await fetch(`/api/notifications/${userId}/unread-count`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count')
      }

      const data = await response.json()
      return data.count
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }

  // Notification Preferences
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    if (this.isDevelopmentMode) {
      return {
        push_notifications: {
          new_matches: true,
          new_messages: true,
          new_ratings: true,
          profile_views: false,
          system_updates: true
        },
        email_notifications: {
          new_matches: true,
          new_messages: false,
          weekly_digest: true,
          system_updates: true
        },
        in_app_notifications: {
          new_matches: true,
          new_messages: true,
          new_ratings: true,
          profile_views: true,
          system_updates: true
        }
      }
    }

    try {
      const response = await fetch(`/api/notifications/${userId}/preferences`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      // Return default preferences
      return {
        push_notifications: {
          new_matches: true,
          new_messages: true,
          new_ratings: true,
          profile_views: false,
          system_updates: true
        },
        email_notifications: {
          new_matches: true,
          new_messages: false,
          weekly_digest: true,
          system_updates: true
        },
        in_app_notifications: {
          new_matches: true,
          new_messages: true,
          new_ratings: true,
          profile_views: true,
          system_updates: true
        }
      }
    }
  }

  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    if (this.isDevelopmentMode) {
      console.log('📱 Updating notification preferences:', { userId, preferences })
      return true
    }

    try {
      const response = await fetch(`/api/notifications/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      })

      return response.ok
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }
  }

  // Helper Methods
  private static async getWeeklyStats(userId: string): Promise<{
    newMatches: number
    newMessages: number
    newRatings: number
    profileViews: number
  }> {
    // TODO: Implement actual weekly stats calculation
    return {
      newMatches: 3,
      newMessages: 12,
      newRatings: 2,
      profileViews: 8
    }
  }

  // Service Worker Registration
  static async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }
} 