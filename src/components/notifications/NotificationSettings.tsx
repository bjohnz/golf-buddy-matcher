'use client'

import { useState, useEffect } from 'react'
import { Bell, Smartphone, Mail, Settings, Save, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NotificationService, NotificationPreferences } from '@/lib/notifications'
import toast from 'react-hot-toast'

interface NotificationSettingsProps {
  userId: string
  onClose?: () => void
}

export default function NotificationSettings({ userId, onClose }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    loadPreferences()
    checkPushPermission()
  }, [userId])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const prefs = await NotificationService.getNotificationPreferences(userId)
      setPreferences(prefs)
    } catch (error) {
      console.error('Error loading notification preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }

  const handleRequestPushPermission = async () => {
    try {
      const granted = await NotificationService.requestPushPermission()
      if (granted) {
        setPushPermission('granted')
        toast.success('Push notifications enabled!')
      } else {
        toast.error('Push notifications permission denied')
      }
    } catch (error) {
      console.error('Error requesting push permission:', error)
      toast.error('Failed to enable push notifications')
    }
  }

  const handlePreferenceChange = (
    category: keyof NotificationPreferences,
    setting: string,
    value: boolean
  ) => {
    if (!preferences) return

    setPreferences(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value
        }
      }
    })
  }

  const handleSavePreferences = async () => {
    if (!preferences) return

    try {
      setSaving(true)
      const success = await NotificationService.updateNotificationPreferences(userId, preferences)
      
      if (success) {
        toast.success('Notification preferences saved!')
        onClose?.()
      } else {
        toast.error('Failed to save notification preferences')
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast.error('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefaults = () => {
    const defaultPreferences: NotificationPreferences = {
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
    setPreferences(defaultPreferences)
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading notification preferences...</p>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Failed to load notification preferences</p>
        <Button onClick={loadPreferences} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6 text-green-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          <p className="text-sm text-gray-600">Control how you receive notifications</p>
        </div>
      </div>

      {/* Push Notification Permission */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Push Notifications</h3>
              <p className="text-sm text-blue-700">
                {pushPermission === 'granted' 
                  ? '✅ Enabled - You\'ll receive notifications on your device'
                  : pushPermission === 'denied'
                  ? '❌ Disabled - You\'ve blocked notifications for this site'
                  : '⚠️ Not enabled - Click to enable push notifications'
                }
              </p>
            </div>
          </div>
          {pushPermission !== 'granted' && (
            <Button
              onClick={handleRequestPushPermission}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Enable
            </Button>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 flex items-center">
          <Smartphone className="h-4 w-4 mr-2" />
          Push Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(preferences.push_notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <p className="text-sm text-gray-600">
                  {key === 'new_matches' && 'Get notified when you have a new match'}
                  {key === 'new_messages' && 'Get notified when you receive new messages'}
                  {key === 'new_ratings' && 'Get notified when someone rates your golf experience'}
                  {key === 'profile_views' && 'Get notified when someone views your profile'}
                  {key === 'system_updates' && 'Get notified about app updates and important announcements'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handlePreferenceChange('push_notifications', key, e.target.checked)}
                  className="sr-only peer"
                  disabled={pushPermission !== 'granted'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Email Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(preferences.email_notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">
                  {key === 'weekly_digest' ? 'Weekly Digest' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <p className="text-sm text-gray-600">
                  {key === 'new_matches' && 'Receive email notifications for new matches'}
                  {key === 'new_messages' && 'Receive email notifications for new messages'}
                  {key === 'weekly_digest' && 'Get a weekly summary of your activity'}
                  {key === 'system_updates' && 'Receive important app updates via email'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handlePreferenceChange('email_notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          In-App Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(preferences.in_app_notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <p className="text-sm text-gray-600">
                  {key === 'new_matches' && 'Show notifications in the app for new matches'}
                  {key === 'new_messages' && 'Show notifications in the app for new messages'}
                  {key === 'new_ratings' && 'Show notifications in the app for new ratings'}
                  {key === 'profile_views' && 'Show notifications in the app for profile views'}
                  {key === 'system_updates' && 'Show system notifications in the app'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handlePreferenceChange('in_app_notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleResetToDefaults}
          variant="outline"
          className="flex-1"
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSavePreferences}
          disabled={saving}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <>
              <div className="loading-spinner mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Enable push notifications to stay updated even when the app is closed</li>
          <li>• Weekly digest emails help you stay engaged with your golf community</li>
          <li>• You can change these settings anytime in your profile</li>
        </ul>
      </div>
    </div>
  )
} 