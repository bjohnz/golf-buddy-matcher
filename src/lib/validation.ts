/**
 * Comprehensive input validation and sanitization for Golf Buddy Matcher
 * Prevents XSS, injection attacks, and ensures data integrity
 */

import { logger } from './logger'

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Password strength requirements
const PASSWORD_MIN_LENGTH = 6
const PASSWORD_MAX_LENGTH = 128

// Common validation constants
const NAME_MAX_LENGTH = 100
const BIO_MAX_LENGTH = 500
const LOCATION_MAX_LENGTH = 200
const COURSE_NAME_MAX_LENGTH = 100

/**
 * Sanitize text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent basic XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: URLs
    .trim()
}

/**
 * Sanitize HTML by stripping all tags and keeping only text
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&[#\w]+;/g, '') // Remove HTML entities
    .trim()
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeText(email).toLowerCase()
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Email is required' }
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: 'Email is too long' }
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Invalid email format' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` }
  }
  
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { isValid: false, error: `Password must be less than ${PASSWORD_MAX_LENGTH} characters long` }
  }
  
  // Check for at least one letter and one number for better security
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain at least one letter and one number' }
  }
  
  return { isValid: true }
}

/**
 * Validate and sanitize full name
 */
export function validateName(name: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeText(name)
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Name is required' }
  }
  
  if (sanitized.length > NAME_MAX_LENGTH) {
    return { isValid: false, sanitized, error: `Name must be less than ${NAME_MAX_LENGTH} characters` }
  }
  
  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Validate and sanitize bio text
 */
export function validateBio(bio: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeHTML(bio)
  
  if (sanitized.length > BIO_MAX_LENGTH) {
    return { isValid: false, sanitized, error: `Bio must be less than ${BIO_MAX_LENGTH} characters` }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Validate golf handicap
 */
export function validateHandicap(handicap: number | string): { isValid: boolean; value: number; error?: string } {
  const numericValue = typeof handicap === 'string' ? parseFloat(handicap) : handicap
  
  if (isNaN(numericValue)) {
    return { isValid: false, value: 0, error: 'Handicap must be a valid number' }
  }
  
  if (numericValue < 0 || numericValue > 54) {
    return { isValid: false, value: numericValue, error: 'Handicap must be between 0 and 54' }
  }
  
  return { isValid: true, value: numericValue }
}

/**
 * Validate age
 */
export function validateAge(age: number | string): { isValid: boolean; value: number; error?: string } {
  const numericValue = typeof age === 'string' ? parseInt(age, 10) : age
  
  if (isNaN(numericValue)) {
    return { isValid: false, value: 0, error: 'Age must be a valid number' }
  }
  
  if (numericValue < 18 || numericValue > 100) {
    return { isValid: false, value: numericValue, error: 'Age must be between 18 and 100' }
  }
  
  return { isValid: true, value: numericValue }
}

/**
 * Validate and sanitize location
 */
export function validateLocation(location: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeText(location)
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Location is required' }
  }
  
  if (sanitized.length > LOCATION_MAX_LENGTH) {
    return { isValid: false, sanitized, error: `Location must be less than ${LOCATION_MAX_LENGTH} characters` }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: number, lng: number): { isValid: boolean; error?: string } {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { isValid: false, error: 'Coordinates must be valid numbers' }
  }
  
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' }
  }
  
  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' }
  }
  
  return { isValid: true }
}

/**
 * Validate search radius
 */
export function validateSearchRadius(radius: number | string): { isValid: boolean; value: number; error?: string } {
  const numericValue = typeof radius === 'string' ? parseInt(radius, 10) : radius
  
  if (isNaN(numericValue)) {
    return { isValid: false, value: 0, error: 'Search radius must be a valid number' }
  }
  
  if (numericValue < 5 || numericValue > 100) {
    return { isValid: false, value: numericValue, error: 'Search radius must be between 5 and 100 miles' }
  }
  
  return { isValid: true, value: numericValue }
}

/**
 * Validate and sanitize course name
 */
export function validateCourseName(courseName: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeText(courseName)
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Course name is required' }
  }
  
  if (sanitized.length > COURSE_NAME_MAX_LENGTH) {
    return { isValid: false, sanitized, error: `Course name must be less than ${COURSE_NAME_MAX_LENGTH} characters` }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Validate playing times array
 */
export function validatePlayingTimes(times: string[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(times)) {
    return { isValid: false, error: 'Playing times must be an array' }
  }
  
  if (times.length === 0) {
    return { isValid: false, error: 'At least one playing time must be selected' }
  }
  
  const validTimes = ['early_morning', 'morning', 'afternoon', 'evening', 'weekend_only']
  const invalidTimes = times.filter(time => !validTimes.includes(time))
  
  if (invalidTimes.length > 0) {
    return { isValid: false, error: 'Invalid playing time selected' }
  }
  
  return { isValid: true }
}

/**
 * Validate playing style
 */
export function validatePlayingStyle(style: string): { isValid: boolean; error?: string } {
  const validStyles = ['competitive', 'casual', 'beginner_friendly']
  
  if (!validStyles.includes(style)) {
    return { isValid: false, error: 'Invalid playing style' }
  }
  
  return { isValid: true }
}

/**
 * Validate pace of play
 */
export function validatePaceOfPlay(pace: string): { isValid: boolean; error?: string } {
  const validPaces = ['fast', 'moderate', 'relaxed']
  
  if (!validPaces.includes(pace)) {
    return { isValid: false, error: 'Invalid pace of play' }
  }
  
  return { isValid: true }
}

/**
 * Validate preferred group size
 */
export function validateGroupSize(size: string): { isValid: boolean; error?: string } {
  const validSizes = ['twosome', 'foursome', 'flexible']
  
  if (!validSizes.includes(size)) {
    return { isValid: false, error: 'Invalid preferred group size' }
  }
  
  return { isValid: true }
}

/**
 * Validate message content
 */
export function validateMessage(message: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeHTML(message)
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Message cannot be empty' }
  }
  
  if (sanitized.length > 1000) {
    return { isValid: false, sanitized, error: 'Message must be less than 1000 characters' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Comprehensive profile validation
 */
export interface ProfileValidationResult {
  isValid: boolean
  errors: Record<string, string>
  sanitizedData: Record<string, string | number | boolean | string[] | null | undefined>
}

export function validateProfileData(data: Record<string, unknown>): ProfileValidationResult {
  const errors: Record<string, string> = {}
  const sanitizedData: Record<string, string | number | boolean | string[] | null | undefined> = {}
  
  // Validate name
  if (data.full_name !== undefined && data.full_name !== null && typeof data.full_name === 'string') {
    const nameResult = validateName(data.full_name)
    if (!nameResult.isValid) {
      errors.full_name = nameResult.error!
    } else {
      sanitizedData.full_name = nameResult.sanitized
    }
  }
  
  // Validate age
  if (data.age !== undefined && data.age !== null && (typeof data.age === 'string' || typeof data.age === 'number')) {
    const ageResult = validateAge(data.age)
    if (!ageResult.isValid) {
      errors.age = ageResult.error!
    } else {
      sanitizedData.age = ageResult.value
    }
  }
  
  // Validate bio
  if (data.bio !== undefined && data.bio !== null && typeof data.bio === 'string') {
    const bioResult = validateBio(data.bio)
    if (!bioResult.isValid) {
      errors.bio = bioResult.error!
    } else {
      sanitizedData.bio = bioResult.sanitized
    }
  }
  
  // Validate handicap
  if (data.handicap !== undefined && data.handicap !== null && (typeof data.handicap === 'string' || typeof data.handicap === 'number')) {
    const handicapResult = validateHandicap(data.handicap)
    if (!handicapResult.isValid) {
      errors.handicap = handicapResult.error!
    } else {
      sanitizedData.handicap = handicapResult.value
    }
  }
  
  // Validate location
  if (data.location !== undefined && data.location !== null && typeof data.location === 'string') {
    const locationResult = validateLocation(data.location)
    if (!locationResult.isValid) {
      errors.location = locationResult.error!
    } else {
      sanitizedData.location = locationResult.sanitized
    }
  }
  
  // Validate coordinates
  if (data.latitude !== undefined && data.latitude !== null && data.longitude !== undefined && data.longitude !== null && 
      (typeof data.latitude === 'string' || typeof data.latitude === 'number') && 
      (typeof data.longitude === 'string' || typeof data.longitude === 'number')) {
    const coordsResult = validateCoordinates(Number(data.latitude), Number(data.longitude))
    if (!coordsResult.isValid) {
      errors.coordinates = coordsResult.error!
    } else {
      sanitizedData.latitude = data.latitude
      sanitizedData.longitude = data.longitude
    }
  }
  
  // Validate search radius
  if (data.search_radius !== undefined && data.search_radius !== null && (typeof data.search_radius === 'string' || typeof data.search_radius === 'number')) {
    const radiusResult = validateSearchRadius(data.search_radius)
    if (!radiusResult.isValid) {
      errors.search_radius = radiusResult.error!
    } else {
      sanitizedData.search_radius = radiusResult.value
    }
  }
  
  // Validate playing times
  if (data.preferred_times !== undefined && data.preferred_times !== null && Array.isArray(data.preferred_times)) {
    const timesResult = validatePlayingTimes(data.preferred_times)
    if (!timesResult.isValid) {
      errors.preferred_times = timesResult.error!
    } else {
      sanitizedData.preferred_times = data.preferred_times
    }
  }
  
  // Validate playing style
  if (data.playing_style !== undefined && data.playing_style !== null && typeof data.playing_style === 'string') {
    const styleResult = validatePlayingStyle(data.playing_style)
    if (!styleResult.isValid) {
      errors.playing_style = styleResult.error!
    } else {
      sanitizedData.playing_style = data.playing_style
    }
  }
  
  // Validate pace of play
  if (data.pace_of_play !== undefined && data.pace_of_play !== null && typeof data.pace_of_play === 'string') {
    const paceResult = validatePaceOfPlay(data.pace_of_play)
    if (!paceResult.isValid) {
      errors.pace_of_play = paceResult.error!
    } else {
      sanitizedData.pace_of_play = data.pace_of_play
    }
  }
  
  // Validate group size
  if (data.preferred_group_size !== undefined && data.preferred_group_size !== null && typeof data.preferred_group_size === 'string') {
    const sizeResult = validateGroupSize(data.preferred_group_size)
    if (!sizeResult.isValid) {
      errors.preferred_group_size = sizeResult.error!
    } else {
      sanitizedData.preferred_group_size = data.preferred_group_size
    }
  }
  
  // Validate favorite courses
  if (data.favorite_courses !== undefined) {
    if (Array.isArray(data.favorite_courses)) {
      const validCourses: string[] = []
      for (const course of data.favorite_courses) {
        const courseResult = validateCourseName(course)
        if (courseResult.isValid) {
          validCourses.push(courseResult.sanitized)
        }
      }
      sanitizedData.favorite_courses = validCourses
    } else {
      errors.favorite_courses = 'Favorite courses must be an array'
    }
  }
  
  // Log validation attempt
  logger.security('profile_validation', undefined, {
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
    fields: Object.keys(data).length
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  }
}

const validation = {
  sanitizeText,
  sanitizeHTML,
  validateEmail,
  validatePassword,
  validateName,
  validateBio,
  validateHandicap,
  validateAge,
  validateLocation,
  validateCoordinates,
  validateSearchRadius,
  validateCourseName,
  validatePlayingTimes,
  validatePlayingStyle,
  validatePaceOfPlay,
  validateGroupSize,
  validateMessage,
  validateProfileData
}

export default validation