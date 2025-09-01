'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Star, 
  Target, 
  Users, 
  Clock, 
  Calendar,
  Camera,
  Settings,
  Shield,
  Award,
  Heart,
  MessageCircle,
  Eye,
  Trash2,
  Power
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UserProfile } from '@/types'
import { formatDistance, formatHandicap, getPlayingTimeDisplay } from '@/lib/utils'
import toast from 'react-hot-toast'
import { SimpleTooltip } from '@/components/ui/Tooltip'
import ProfileCompletionPrompt from '@/components/profile/ProfileCompletionPrompt'
import UpdateHistoryModal from '@/components/profile/UpdateHistoryModal'
import ProfileService, { ProfileUpdateData, ProfileCompletionData } from '@/lib/profiles'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { validateProfileData } from '@/lib/validation'

interface ProfileFormData {
  full_name: string
  age: number
  bio: string
  handicap: number
  home_course: string
  location: string
  latitude: number
  longitude: number
  search_radius: number
  preferred_times: string[]
  playing_style: 'competitive' | 'casual' | 'beginner_friendly'
  pace_of_play: 'fast' | 'moderate' | 'relaxed'
  preferred_group_size: 'twosome' | 'foursome' | 'flexible'
  favorite_courses: string[]
  show_distance: boolean
  show_online_status: boolean
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [completionData, setCompletionData] = useState<ProfileCompletionData | null>(null)
  const [showUpdateHistory, setShowUpdateHistory] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    age: 0,
    bio: '',
    handicap: 0,
    home_course: '',
    location: '',
    latitude: 0,
    longitude: 0,
    search_radius: 25,
    preferred_times: [],
    playing_style: 'casual',
    pace_of_play: 'moderate',
    preferred_group_size: 'twosome',
    favorite_courses: [],
    show_distance: true,
    show_online_status: true
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Load user profile using ProfileService
      const profile = await ProfileService.getProfile(user.id)
      if (!profile) {
        toast.error('Failed to load profile')
        return
      }
      
      setUserProfile(profile)
      
      // Load completion data
      const completion = await ProfileService.getCompletionData(user.id)
      setCompletionData(completion)
      setFormData({
        full_name: profile.full_name,
        age: 28, // Mock age - in real app this would come from profile
        bio: profile.bio || '',
        handicap: profile.handicap,
        home_course: profile.home_course || '',
        location: profile.location,
        latitude: profile.latitude,
        longitude: profile.longitude,
        search_radius: 25, // Default search radius
        preferred_times: profile.preferred_times,
        playing_style: profile.playing_style,
        pace_of_play: profile.pace_of_play,
        preferred_group_size: profile.preferred_group_size,
        favorite_courses: profile.favorite_courses || [],
        show_distance: profile.show_distance,
        show_online_status: profile.show_online_status
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Comprehensive validation using validation utility
      const validationResult = validateProfileData(formData as unknown as Record<string, unknown>)
      
      if (!validationResult.isValid) {
        // Show first validation error
        const firstError = Object.values(validationResult.errors)[0]
        toast.error(firstError)
        return
      }
      
      // Prepare update data using sanitized values
      const updateData: ProfileUpdateData = {
        full_name: (validationResult.sanitizedData.full_name as string) || formData.full_name,
        bio: (validationResult.sanitizedData.bio as string) || formData.bio,
        handicap: formData.handicap,
        home_course: formData.home_course,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        preferred_times: formData.preferred_times,
        playing_style: formData.playing_style,
        pace_of_play: formData.pace_of_play,
        preferred_group_size: formData.preferred_group_size,
        favorite_courses: formData.favorite_courses,
        show_distance: formData.show_distance,
        show_online_status: formData.show_online_status
      }

          // Update profile using ProfileService
    if (!user?.id) {
      toast.error('Authentication required')
      return
    }

    const result = await ProfileService.updateProfile(
      user.id,
      updateData,
      imageFile || undefined
    )

      if (result.success && result.profile) {
        setUserProfile(result.profile)
        
        // Reload completion data
        const completion = await ProfileService.getCompletionData(user.id)
        setCompletionData(completion)
        
        // Reset image state
        setImageFile(null)
        setImagePreview('')
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name,
        age: 28, // Reset to default age
        bio: userProfile.bio || '',
        handicap: userProfile.handicap,
        home_course: userProfile.home_course || '',
        location: userProfile.location,
        latitude: userProfile.latitude,
        longitude: userProfile.longitude,
        search_radius: 25, // Reset to default radius
        preferred_times: userProfile.preferred_times,
        playing_style: userProfile.playing_style,
        pace_of_play: userProfile.pace_of_play,
        preferred_group_size: userProfile.preferred_group_size,
        favorite_courses: userProfile.favorite_courses || [],
        show_distance: userProfile.show_distance,
        show_online_status: userProfile.show_online_status
      })
    }
    // Reset image state
    setImageFile(null)
    setImagePreview('')
    setIsEditing(false)
  }

  const handleTimeToggle = (time: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_times: prev.preferred_times.includes(time)
        ? prev.preferred_times.filter(t => t !== time)
        : [...prev.preferred_times, time]
    }))
  }

  const handleAddCourse = (course: string) => {
    if (course.trim() && !formData.favorite_courses.includes(course.trim())) {
      setFormData(prev => ({
        ...prev,
        favorite_courses: [...prev.favorite_courses, course.trim()]
      }))
    }
  }

  const handleRemoveCourse = (course: string) => {
    setFormData(prev => ({
      ...prev,
      favorite_courses: prev.favorite_courses.filter(c => c !== course)
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      
      setImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
  }

  const handleDeleteAccount = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Account deleted successfully')
      // Redirect to logout or home
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  const handleDeactivateProfile = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (userProfile) {
        setUserProfile({ ...userProfile, is_active: false })
      }
      toast.success('Profile deactivated')
      setShowDeactivateConfirm(false)
    } catch (error) {
      console.error('Error deactivating profile:', error)
      toast.error('Failed to deactivate profile')
    }
  }

  const getPlayingStyleDisplay = (style: string) => {
    switch (style) {
      case 'competitive': return 'Competitive'
      case 'casual': return 'Casual'
      case 'beginner_friendly': return 'Beginner-Friendly'
      default: return style
    }
  }

  const getPaceDisplay = (pace: string) => {
    switch (pace) {
      case 'fast': return 'Fast'
      case 'moderate': return 'Moderate'
      case 'relaxed': return 'Relaxed'
      default: return pace
    }
  }

  const getGroupSizeDisplay = (size: string) => {
    switch (size) {
      case 'twosome': return 'Twosome'
      case 'foursome': return 'Foursome'
      case 'flexible': return 'Flexible'
      default: return size
    }
  }

  const formatMemberSince = (createdAt: string) => {
    const date = new Date(createdAt)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <Link href="/dashboard">
            <Button className="mt-4">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">My Profile</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <div className="loading-spinner h-4 w-4 mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Completion Prompt */}
        <div className="mb-6">
          <ProfileCompletionPrompt 
            profile={userProfile} 
            onComplete={() => setIsEditing(true)}
            onSkip={() => console.log('Profile completion skipped')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-6">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt={userProfile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : userProfile.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Target className="h-12 w-12 text-white opacity-50" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1 flex space-x-1">
                      <label className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {imagePreview && (
                        <button
                          onClick={handleRemoveImage}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {isEditing ? (
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="text-2xl font-bold"
                        placeholder="Your name"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{userProfile.full_name}</h1>
                    )}
                    {userProfile.is_verified && (
                      <SimpleTooltip content="Verified golfer">
                        <Shield className="h-5 w-5 text-green-600" />
                      </SimpleTooltip>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {isEditing ? (
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="text-sm"
                        placeholder="Location"
                      />
                    ) : (
                      <span className="text-sm">{userProfile.location}</span>
                    )}
                    <span className="mx-2">•</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        className="text-sm w-16"
                        placeholder="Age"
                      />
                    ) : (
                      <span className="text-sm">28 years old</span>
                    )}
                    <span className="mx-2">•</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.handicap}
                        onChange={(e) => setFormData(prev => ({ ...prev, handicap: parseInt(e.target.value) || 0 }))}
                        className="text-sm w-20"
                        placeholder="Handicap"
                      />
                    ) : (
                      <span className="text-sm">{formatHandicap(userProfile.handicap)} handicap</span>
                    )}
                  </div>

                  {/* Rating */}
                  {userProfile.avg_rating > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(userProfile.avg_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {userProfile.avg_rating.toFixed(1)} ({userProfile.total_ratings} reviews)
                      </span>
                    </div>
                  )}

                  {/* Member Since & Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Member since {formatMemberSince(userProfile.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      <span>{userProfile.total_rounds} rounds played</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About Me</h3>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                    placeholder="Tell others about yourself and your golf preferences..."
                  />
                ) : (
                  <p className="text-gray-700">{userProfile.bio || 'No bio added yet.'}</p>
                )}
              </div>
            </div>

            {/* Golf Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Golf Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Playing Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Playing Style</label>
                  {isEditing ? (
                    <select
                      value={formData.playing_style}
                      onChange={(e) => setFormData(prev => ({ ...prev, playing_style: e.target.value as 'casual' | 'competitive' | 'beginner_friendly' }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="casual">Casual</option>
                      <option value="competitive">Competitive</option>
                      <option value="beginner_friendly">Beginner-Friendly</option>
                    </select>
                  ) : (
                    <p className="text-gray-700">{getPlayingStyleDisplay(userProfile.playing_style)}</p>
                  )}
                </div>

                {/* Pace of Play */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pace of Play</label>
                  {isEditing ? (
                    <select
                      value={formData.pace_of_play}
                      onChange={(e) => setFormData(prev => ({ ...prev, pace_of_play: e.target.value as 'relaxed' | 'moderate' | 'fast' }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="relaxed">Relaxed</option>
                      <option value="moderate">Moderate</option>
                      <option value="fast">Fast</option>
                    </select>
                  ) : (
                    <p className="text-gray-700">{getPaceDisplay(userProfile.pace_of_play)}</p>
                  )}
                </div>

                {/* Group Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Group Size</label>
                  {isEditing ? (
                    <select
                      value={formData.preferred_group_size}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferred_group_size: e.target.value as 'twosome' | 'foursome' | 'flexible' }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="twosome">Twosome</option>
                      <option value="foursome">Foursome</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  ) : (
                    <p className="text-gray-700">{getGroupSizeDisplay(userProfile.preferred_group_size)}</p>
                  )}
                </div>

                {/* Preferred Times */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Playing Times</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {['early_morning', 'morning', 'afternoon', 'evening', 'weekends_only'].map((time) => (
                        <label key={time} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.preferred_times.includes(time)}
                            onChange={() => handleTimeToggle(time)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{getPlayingTimeDisplay(time)}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile.preferred_times.map((time) => (
                        <span key={time} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {getPlayingTimeDisplay(time)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Search Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Search Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter your city, state"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-700">{userProfile.location}</p>
                  )}
                </div>

                {/* Search Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius ({formData.search_radius} miles)
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={formData.search_radius}
                        onChange={(e) => setFormData(prev => ({ ...prev, search_radius: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>5 miles</span>
                        <span>50 miles</span>
                        <span>100 miles</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700">{formData.search_radius} miles</p>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Courses</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a course name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCourse((e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a course name"]') as HTMLInputElement
                        if (input) {
                          handleAddCourse(input.value)
                          input.value = ''
                        }
                      }}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.favorite_courses.map((course) => (
                      <span key={course} className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {course}
                        <button
                          onClick={() => handleRemoveCourse(course)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userProfile.favorite_courses?.map((course) => (
                    <span key={course} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {course}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion Status */}
            {completionData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-green-600">{completionData.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${completionData.completion_percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {completionData.completed_fields.length} of {completionData.completed_fields.length + completionData.missing_fields.length} fields completed
                  </div>
                  {completionData.missing_fields.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Missing fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {completionData.missing_fields.slice(0, 3).map((field) => (
                          <span key={field} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                            {field.replace('_', ' ')}
                          </span>
                        ))}
                        {completionData.missing_fields.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{completionData.missing_fields.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
                <Link href="/matching">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Start Matching
                  </Button>
                </Link>
                <Link href="/matches">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    View Matches
                  </Button>
                </Link>
                <Button
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowUpdateHistory(!showUpdateHistory)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {showUpdateHistory ? 'Hide' : 'Show'} Update History
                </Button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isEditing ? formData.show_distance : userProfile.show_distance}
                    onChange={(e) => isEditing && setFormData(prev => ({ ...prev, show_distance: e.target.checked }))}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show distance to others</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isEditing ? formData.show_online_status : userProfile.show_online_status}
                    onChange={(e) => isEditing && setFormData(prev => ({ ...prev, show_online_status: e.target.checked }))}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show when you&apos;re active</span>
                </label>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600 hover:text-orange-700"
                  onClick={() => setShowDeactivateConfirm(true)}
                >
                  <Power className="h-4 w-4 mr-2" />
                  Deactivate Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update History Modal */}
      {showUpdateHistory && (
        <UpdateHistoryModal 
          userId={user?.id || ''}
          isOpen={showUpdateHistory}
          onClose={() => setShowUpdateHistory(false)}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data, matches, and messages will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Profile Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Profile</h3>
            <p className="text-gray-600 mb-4">
              Your profile will be hidden from other users. You can reactivate it anytime from your settings.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeactivateConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeactivateProfile}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  )
} 