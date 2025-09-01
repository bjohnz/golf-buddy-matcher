import { supabase } from './supabase'
import { UserProfile } from '@/types'

export interface ProfileUpdateData {
  full_name?: string
  age?: number
  bio?: string
  handicap?: number
  home_course?: string
  location?: string
  latitude?: number
  longitude?: number
  search_radius?: number
  preferred_times?: string[]
  playing_style?: 'competitive' | 'casual' | 'beginner_friendly'
  pace_of_play?: 'fast' | 'moderate' | 'relaxed'
  preferred_group_size?: 'twosome' | 'foursome' | 'flexible'
  favorite_courses?: string[]
  show_distance?: boolean
  show_online_status?: boolean
  avatar_url?: string
  photos?: string[]
}

export interface ProfileCompletionData {
  profile_id: string
  completion_percentage: number
  completed_fields: string[]
  missing_fields: string[]
  last_updated: string
}

export interface ProfileUpdateLog {
  id?: string
  profile_id: string
  updated_fields: string[]
  old_values: Record<string, string | number | boolean | string[] | null | undefined>
  new_values: Record<string, string | number | boolean | string[] | null | undefined>
  updated_at: string
  updated_by: string
}

export class ProfileService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // In development, return mock data
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return this.getMockProfile(userId)
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  }

  /**
   * Update user profile with comprehensive tracking
   */
  static async updateProfile(
    userId: string, 
    updates: ProfileUpdateData,
    imageFile?: File
  ): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      // Get current profile for comparison
      const currentProfile = await this.getProfile(userId)
      if (!currentProfile) {
        return { success: false, error: 'Profile not found' }
      }

      // Handle image upload if provided
      let avatarUrl = updates.avatar_url
      if (imageFile) {
        const uploadResult = await this.uploadProfileImage(userId, imageFile)
        if (uploadResult.success) {
          avatarUrl = uploadResult.url
        } else {
          return { success: false, error: uploadResult.error }
        }
      }

      // Prepare update data
      const updateData = {
        ...updates,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      }

      // In development, use mock update
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const updatedProfile = await this.mockUpdateProfile(userId, updateData, currentProfile)
        
        // Log the update
        await this.logProfileUpdate(userId, updates, currentProfile, updatedProfile)
        
        // Update completion tracking
        await this.updateCompletionTracking(userId, updatedProfile)
        
        return { success: true, profile: updatedProfile }
      }

      // Update profile in database
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
      }

      const updatedProfile = data as UserProfile

      // Log the update
      await this.logProfileUpdate(userId, updates, currentProfile, updatedProfile)
      
      // Update completion tracking
      await this.updateCompletionTracking(userId, updatedProfile)

      return { success: true, profile: updatedProfile }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return { success: false, error: 'Failed to update profile' }
    }
  }

  /**
   * Upload profile image to storage
   */
  static async uploadProfileImage(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // In development, return mock URL
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { 
          success: true, 
          url: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face` 
        }
      }

      // Check if supabase has storage (real client)
      if ('storage' in supabase) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/avatar.${fileExt}`

        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(fileName, file, { upsert: true })

        if (error) {
          console.error('Error uploading image:', error)
          return { success: false, error: error.message }
        }

        const { data: publicUrl } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName)

        return { success: true, url: publicUrl.publicUrl }
      }

      // Fallback for mock client
      return { 
        success: true, 
        url: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face` 
      }
    } catch (error) {
      console.error('Error in uploadProfileImage:', error)
      return { success: false, error: 'Failed to upload image' }
    }
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateCompletionPercentage(profile: UserProfile): number {
    const requiredFields = [
      'full_name',
      'bio',
      'handicap',
      'location',
      'preferred_times',
      'playing_style',
      'pace_of_play',
      'preferred_group_size'
    ]

    const optionalFields = [
      'avatar_url',
      'home_course',
      'favorite_courses',
      'photos'
    ]

    let completedRequired = 0
    let completedOptional = 0

    // Check required fields
    requiredFields.forEach(field => {
      const value = profile[field as keyof UserProfile]
      if (value !== null && value !== undefined && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
        completedRequired++
      }
    })

    // Check optional fields
    optionalFields.forEach(field => {
      const value = profile[field as keyof UserProfile]
      if (value !== null && value !== undefined && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
        completedOptional++
      }
    })

    // Required fields count for 80%, optional for 20%
    const requiredScore = (completedRequired / requiredFields.length) * 80
    const optionalScore = (completedOptional / optionalFields.length) * 20

    return Math.round(requiredScore + optionalScore)
  }

  /**
   * Get completed and missing fields
   */
  static getFieldsStatus(profile: UserProfile): { completed: string[]; missing: string[] } {
    const allFields = [
      'full_name', 'bio', 'handicap', 'location', 'preferred_times',
      'playing_style', 'pace_of_play', 'preferred_group_size',
      'avatar_url', 'home_course', 'favorite_courses', 'photos'
    ]

    const completed: string[] = []
    const missing: string[] = []

    allFields.forEach(field => {
      const value = profile[field as keyof UserProfile]
      if (value !== null && value !== undefined && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
        completed.push(field)
      } else {
        missing.push(field)
      }
    })

    return { completed, missing }
  }

  /**
   * Update completion tracking
   */
  static async updateCompletionTracking(userId: string, profile: UserProfile): Promise<void> {
    try {
      const completionPercentage = this.calculateCompletionPercentage(profile)
      const fieldsStatus = this.getFieldsStatus(profile)

      const completionData: ProfileCompletionData = {
        profile_id: userId,
        completion_percentage: completionPercentage,
        completed_fields: fieldsStatus.completed,
        missing_fields: fieldsStatus.missing,
        last_updated: new Date().toISOString()
      }

      // In development, just log the completion data
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log('Profile completion updated:', completionData)
        return
      }

      // Update completion tracking in database (real client only)
      try {
        const result = await (supabase as unknown as { from(table: string): { upsert(data: unknown, options: { onConflict: string }): Promise<{ error: unknown }> } })
          .from('profile_completion')
          .upsert(completionData, { onConflict: 'profile_id' })
        
        if (result?.error) {
          console.error('Error updating completion tracking:', result.error)
        }
      } catch (dbError) {
        // Ignore errors for mock client
        console.log('Using mock client, skipping database operation')
      }
    } catch (error) {
      console.error('Error in updateCompletionTracking:', error)
    }
  }

  /**
   * Log profile update for audit trail
   */
  static async logProfileUpdate(
    userId: string,
    updates: ProfileUpdateData,
    oldProfile: UserProfile,
    newProfile: UserProfile
  ): Promise<void> {
    try {
      const updatedFields = Object.keys(updates)
      const oldValues: Record<string, string | number | boolean | string[] | null | undefined> = {}
      const newValues: Record<string, string | number | boolean | string[] | null | undefined> = {}

      // Extract old and new values for changed fields
      updatedFields.forEach(field => {
        const oldValue = oldProfile[field as keyof UserProfile]
        const newValue = newProfile[field as keyof UserProfile]
        
        // Only store primitive values and arrays, skip complex objects
        if (typeof oldValue === 'string' || typeof oldValue === 'number' || typeof oldValue === 'boolean' || Array.isArray(oldValue) || oldValue === null || oldValue === undefined) {
          oldValues[field] = oldValue
        }
        
        if (typeof newValue === 'string' || typeof newValue === 'number' || typeof newValue === 'boolean' || Array.isArray(newValue) || newValue === null || newValue === undefined) {
          newValues[field] = newValue
        }
      })

      const logEntry: ProfileUpdateLog = {
        profile_id: userId,
        updated_fields: updatedFields,
        old_values: oldValues,
        new_values: newValues,
        updated_at: new Date().toISOString(),
        updated_by: userId // In a real app, this might be different for admin updates
      }

      // In development, just log the update
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log('Profile update logged:', logEntry)
        return
      }

      // Insert update log into database (real client only)
      try {
        const result = await (supabase as unknown as { from(table: string): { insert(data: unknown[]): Promise<{ error: unknown }> } })
          .from('profile_update_logs')
          .insert([logEntry])
        
        if (result?.error) {
          console.error('Error logging profile update:', result.error)
        }
      } catch (dbError) {
        // Ignore errors for mock client
        console.log('Using mock client, skipping database operation')
      }
    } catch (error) {
      console.error('Error in logProfileUpdate:', error)
    }
  }

  /**
   * Get profile completion data
   */
  static async getCompletionData(userId: string): Promise<ProfileCompletionData | null> {
    try {
      // In development, calculate from current profile
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const profile = await this.getProfile(userId)
        if (!profile) return null

        const completionPercentage = this.calculateCompletionPercentage(profile)
        const fieldsStatus = this.getFieldsStatus(profile)

        return {
          profile_id: userId,
          completion_percentage: completionPercentage,
          completed_fields: fieldsStatus.completed,
          missing_fields: fieldsStatus.missing,
          last_updated: new Date().toISOString()
        }
      }

      const { data, error } = await supabase
        .from('profile_completion')
        .select('*')
        .eq('profile_id', userId)
        .single()

      if (error) {
        console.error('Error fetching completion data:', error)
        return null
      }

      return data as ProfileCompletionData
    } catch (error) {
      console.error('Error in getCompletionData:', error)
      return null
    }
  }

  /**
   * Get profile update history
   */
  static async getUpdateHistory(userId: string, limit = 10): Promise<ProfileUpdateLog[]> {
    try {
      // In development, return mock history
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return [
          {
            id: '1',
            profile_id: userId,
            updated_fields: ['bio', 'handicap'],
            old_values: { bio: 'Old bio', handicap: 10 },
            new_values: { bio: 'New bio', handicap: 12 },
            updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updated_by: userId
          },
          {
            id: '2',
            profile_id: userId,
            updated_fields: ['location', 'search_radius'],
            old_values: { location: 'Old City', search_radius: 20 },
            new_values: { location: 'San Francisco, CA', search_radius: 25 },
            updated_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updated_by: userId
          }
        ]
      }

      // Query update history from database (real client only)
      try {
        const result = await (supabase as unknown as { 
          from(table: string): { 
            select(columns: string): { 
              eq(column: string, value: string): { 
                order(column: string, options: { ascending: boolean }): { 
                  limit(count: number): Promise<{ error: unknown; data: unknown }> 
                } 
              } 
            } 
          } 
        })
          .from('profile_update_logs')
          .select('*')
          .eq('profile_id', userId)
          .order('updated_at', { ascending: false })
          .limit(limit)

        if (result?.error) {
          console.error('Error fetching update history:', result.error)
          return []
        }

        if (result?.data) {
          return result.data as ProfileUpdateLog[]
        }
      } catch (dbError) {
        // Ignore errors for mock client, return mock data instead
        console.log('Using mock client, returning mock data')
      }

      return []
    } catch (error) {
      console.error('Error in getUpdateHistory:', error)
      return []
    }
  }

  /**
   * Mock profile for development
   */
  private static getMockProfile(userId: string): UserProfile {
    return {
      id: userId,
      email: 'john@example.com',
      full_name: 'John Smith',
      avatar_url: '',
      bio: 'Passionate golfer looking for friendly matches. Love playing on weekends and meeting new people on the course.',
      handicap: 12,
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      preferred_times: ['weekends_only', 'afternoon'],
      photos: [],
      is_active: true,
      is_banned: false,
      show_distance: true,
      show_online_status: true,
      notification_preferences: {
        new_matches: true,
        new_messages: true,
        profile_views: true
      },
      home_course: 'Presidio Golf Course',
      favorite_courses: ['Presidio Golf Course', 'TPC Harding Park', 'Lincoln Park Golf Course'],
      playing_style: 'casual',
      pace_of_play: 'moderate',
      preferred_group_size: 'twosome',
      avg_rating: 4.3,
      total_rounds: 12,
      total_ratings: 8,
      is_verified: true,
      last_active: new Date().toISOString(),
      subscription_tier: 'premium',
      subscription_status: 'active',
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_plan_id: 'premium-monthly',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Mock profile update for development
   */
  private static async mockUpdateProfile(
    userId: string, 
    updates: ProfileUpdateData & { updated_at: string }, 
    currentProfile: UserProfile
  ): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      ...currentProfile,
      ...updates,
      id: userId // Ensure ID doesn't get overwritten
    }
  }
}

export default ProfileService