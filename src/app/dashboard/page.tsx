'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target, Users, MessageCircle, Settings, LogOut, Heart, MapPin, HelpCircle, Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MessagingService } from '@/lib/messaging'
import { SimpleTooltip } from '@/components/ui/Tooltip'
import WelcomeTutorial from '@/components/onboarding/WelcomeTutorial'
import ProfileCompletionPrompt from '@/components/profile/ProfileCompletionPrompt'
import { NoActivityEmptyState } from '@/components/ui/EmptyState'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import NotificationBadge from '@/components/notifications/NotificationBadge'
import type { Notification } from '@/types'
import UsageTracker from '@/components/subscription/UsageTracker'
import UpgradeButton from '@/components/subscription/UpgradeButton'
import ProfileBoost from '@/components/subscription/ProfileBoost'
import { SubscriptionService } from '@/lib/subscriptions'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user: authUser, signOut } = useAuth()
  const [user] = useState({
    name: authUser?.user_metadata?.full_name || 'Golf Player',
    handicap: 12,
    location: 'San Francisco, CA',
    avatar: null
  })

  const [unreadCount, setUnreadCount] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    loadUnreadCount()
    checkTutorialStatus()
    checkPremiumStatus()
  }, [])

  const loadUnreadCount = async () => {
    try {
      const count = await MessagingService.getUnreadCount('current-user-id')
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const checkTutorialStatus = () => {
    // Check if user has seen tutorial (in real app, this would be stored in user preferences)
    const seen = localStorage.getItem('hasSeenTutorial')
    if (!seen) {
      setShowTutorial(true)
    }
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setHasSeenTutorial(true)
    localStorage.setItem('hasSeenTutorial', 'true')
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    setHasSeenTutorial(true)
    localStorage.setItem('hasSeenTutorial', 'true')
  }

  const handleProfileComplete = () => {
    // TODO: Navigate to profile completion page
    console.log('Navigate to profile completion')
  }

  const handleProfileSkip = () => {
    // TODO: Dismiss profile completion prompt
    console.log('Dismiss profile completion')
  }

  const handleNotificationClick = (notification: Notification) => {
    setShowNotificationCenter(false)
    
    // Navigate based on notification type and actionUrl
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    } else {
      // Default navigation based on notification type
      switch (notification.type) {
        case 'match':
          window.location.href = '/matches'
          break
        case 'message':
          if (notification.metadata?.matchId) {
            window.location.href = `/chat/${notification.metadata.matchId}`
          } else {
            window.location.href = '/matches'
          }
          break
        case 'rating':
          window.location.href = '/matches'
          break
        case 'profile_view':
          window.location.href = '/matching'
          break
        case 'system':
          window.location.href = '/settings'
          break
        default:
          window.location.href = '/matches'
      }
    }
  }

  const checkPremiumStatus = async () => {
    try {
      const subscription = await SubscriptionService.getUserSubscription('current-user-id')
      setIsPremium(subscription?.tier === 'premium')
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  interface StatItem {
    label: string
    value: string
    icon: React.ComponentType<{ className?: string }>
    tooltip: string
    badge?: number
    href?: string
  }

  interface QuickAction {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    color: string
    tooltip: string
    badge?: number
  }

  const stats: StatItem[] = [
    { 
      label: 'Profile Views', 
      value: '24', 
      icon: Users,
      tooltip: 'Number of times your profile has been viewed by other golfers'
    },
    { 
      label: 'Matches', 
      value: '8', 
      icon: Heart,
      tooltip: 'Total number of successful matches you\'ve made'
    },
    { 
      label: 'Messages', 
      value: unreadCount > 0 ? `${unreadCount} new` : '12', 
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : undefined,
      tooltip: 'Messages from your matches. Click to view conversations.'
    },
    ...(isPremium ? [{
      label: 'Incoming Likes',
      value: '3',
      icon: Heart,
      tooltip: 'People who liked your profile (Premium feature)',
      href: '/who-liked-you'
    }] : [])
  ]

  const quickActions: QuickAction[] = [
    {
      title: 'Start Matching',
      description: 'Find new golf partners',
      icon: Heart,
      href: '/matching',
      color: 'bg-green-500',
      tooltip: 'Swipe through potential golf partners in your area'
    },
    {
      title: 'View Matches',
      description: 'See your connections',
      icon: Users,
      href: '/matches',
      color: 'bg-blue-500',
      badge: unreadCount > 0 ? unreadCount : undefined,
      tooltip: 'View all your matches and start conversations'
    },
    ...(isPremium ? [{
      title: 'Who Liked You',
      description: 'See incoming likes',
      icon: Heart,
      href: '/who-liked-you',
      color: 'bg-purple-500',
      tooltip: 'See who liked your profile (Premium feature)'
    }] : []),
    {
      title: 'Messages',
      description: 'Chat with matches',
      icon: MessageCircle,
      href: '/matches',
      color: 'bg-purple-500',
      badge: unreadCount > 0 ? unreadCount : undefined,
      tooltip: 'Chat with your matches to coordinate golf rounds'
    },
    {
      title: 'Edit Profile',
      description: 'Update your information',
      icon: Settings,
      href: '/profile',
      color: 'bg-orange-500',
      tooltip: 'Update your profile to get better matches'
    }
  ]

  // Sample profile for completion prompt
  const sampleProfile = {
    full_name: user.name,
    avatar_url: user.avatar || '',
    bio: 'Looking for golf partners!',
    handicap: user.handicap,
    location: user.location,
    photos: [],
    home_course: 'Presidio Golf Course',
    playing_style: 'casual',
    pace_of_play: 'moderate',
    preferred_group_size: 'twosome'
  }

  return (
    <AuthGuard requireProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Golf Buddy Matcher</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              
              {/* Notification Badge */}
              <NotificationBadge
                userId="current-user-id"
                onClick={() => setShowNotificationCenter(true)}
              />
              
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mb-8">
                You&apos;ve got {unreadCount} unread messages
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                {user.location}
              </div>
              <div className="text-sm text-gray-500">
                Handicap: {user.handicap}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Prompt */}
        <ProfileCompletionPrompt
          profile={sampleProfile}
          onComplete={handleProfileComplete}
          onSkip={handleProfileSkip}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <SimpleTooltip key={stat.label} content={stat.tooltip}>
              {stat.href ? (
                <Link href={stat.href}>
                  <div className="bg-white rounded-lg shadow-sm p-6 relative cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <stat.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                    {stat.badge && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {stat.badge > 9 ? '9+' : stat.badge}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 relative cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <stat.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  {stat.badge && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {stat.badge > 9 ? '9+' : stat.badge}
                    </div>
                  )}
                </div>
              )}
            </SimpleTooltip>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className={`flex flex-col items-center p-4 ${action.color.replace('bg-', 'bg-').replace('-500', '-50')} rounded-lg hover:${action.color.replace('bg-', 'bg-').replace('-500', '-100')} transition-colors cursor-pointer`}>
                  <action.icon className={`h-8 w-8 ${action.color.replace('bg-', 'text-').replace('-500', '-600')} mb-2`} />
                  <span className="text-sm font-medium text-gray-900">{action.title}</span>
                  {action.badge && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {action.badge > 9 ? '9+' : action.badge}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <UsageTracker userId="current-user-id" />
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
              {isPremium ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Premium Active</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Free Plan</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className="text-sm font-medium text-gray-900">
                  {isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Likes</span>
                <span className="text-sm font-medium text-gray-900">
                  {isPremium ? 'Unlimited' : '15 / day'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Search Radius</span>
                <span className="text-sm font-medium text-gray-900">
                  {isPremium ? '100 miles' : '25 miles'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Advanced Filters</span>
                <span className="text-sm font-medium text-gray-900">
                  {isPremium ? 'Available' : 'Premium Only'}
                </span>
              </div>
            </div>
            {!isPremium && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-2">Upgrade to Premium</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Unlimited likes per day</li>
                    <li>• 100-mile search radius</li>
                    <li>• Advanced matching filters</li>
                    <li>• See who liked you</li>
                  </ul>
                </div>
                <UpgradeButton className="w-full" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Boost for Premium Users */}
        {isPremium && (
          <div className="mb-6">
            <ProfileBoost userId="current-user-id" />
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New match with Sarah Johnson
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <Link href="/matches">
                <Button size="sm" variant="outline">
                  Message
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Profile viewed by Mike Chen
                </p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
              <Link href="/matching">
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New message from David Wilson
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
              <Link href="/matches">
                <Button size="sm" variant="outline">
                  Reply
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Getting Started Tips</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Complete your profile with accurate handicap and preferences
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Add a clear profile photo to increase your match rate
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Be active and respond to messages within 24 hours
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Suggest specific courses and times when chatting with matches
            </li>
          </ul>
        </div>
      </div>

      {/* Welcome Tutorial */}
      <WelcomeTutorial
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        onNotificationClick={handleNotificationClick}
      />
      </div>
    </AuthGuard>
  )
} 