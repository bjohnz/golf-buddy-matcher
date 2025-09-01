/**
 * Rate limiting utility for Golf Buddy Matcher
 * Prevents brute force attacks and API abuse
 */

import { logger } from './logger'

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

// In-memory store for development (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit configurations
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 attempts per window
    blockDuration: 30 * 60 * 1000 // 30 minutes block
  },
  REGISTRATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3, // 3 attempts per hour
    blockDuration: 60 * 60 * 1000 // 1 hour block
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3, // 3 attempts per hour
    blockDuration: 60 * 60 * 1000 // 1 hour block
  },
  
  // API endpoints
  PROFILE_UPDATE: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 10, // 10 updates per minute
    blockDuration: 5 * 60 * 1000 // 5 minutes block
  },
  MESSAGE_SEND: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 30, // 30 messages per minute
    blockDuration: 10 * 60 * 1000 // 10 minutes block
  },
  SWIPE: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100, // 100 swipes per minute
    blockDuration: 5 * 60 * 1000 // 5 minutes block
  },
  
  // General API
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 60, // 60 requests per minute
    blockDuration: 5 * 60 * 1000 // 5 minutes block
  }
} as const

/**
 * Generate rate limit key based on identifier and action
 */
function generateKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string, 
  action: keyof typeof RATE_LIMITS
): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  blocked: boolean;
  retryAfter?: number;
} {
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupExpiredEntries()
  }

  const config = RATE_LIMITS[action]
  const key = generateKey(identifier, action)
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)
  
  // If no entry exists, create a new one
  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false
    }
    rateLimitStore.set(key, entry)
  }
  
  // Check if the entry is expired
  if (now > entry.resetTime) {
    entry.count = 0
    entry.resetTime = now + config.windowMs
    entry.blocked = false
  }
  
  // Check if currently blocked
  if (entry.blocked) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    logger.security('rate_limit_blocked', identifier, { 
      action, 
      retryAfter,
      attempts: entry.count 
    })
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      blocked: true,
      retryAfter
    }
  }
  
  // Increment the counter
  entry.count++
  
  // Check if limit exceeded
  if (entry.count > config.maxAttempts) {
    entry.blocked = true
    entry.resetTime = now + config.blockDuration
    
    logger.security('rate_limit_exceeded', identifier, { 
      action, 
      attempts: entry.count,
      blockDuration: config.blockDuration 
    })
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      blocked: true,
      retryAfter: Math.ceil(config.blockDuration / 1000)
    }
  }
  
  const remaining = config.maxAttempts - entry.count
  
  // Log if approaching limit
  if (remaining <= 2) {
    logger.security('rate_limit_warning', identifier, { 
      action, 
      remaining,
      attempts: entry.count 
    })
  }
  
  return {
    allowed: true,
    remaining,
    resetTime: entry.resetTime,
    blocked: false
  }
}

/**
 * Record a successful action (can reset some counters early)
 */
export function recordSuccess(identifier: string, action: keyof typeof RATE_LIMITS) {
  const key = generateKey(identifier, action)
  const entry = rateLimitStore.get(key)
  
  if (entry && action === 'LOGIN') {
    // Reset login attempts on successful login
    entry.count = 0
    entry.blocked = false
    logger.security('rate_limit_reset_success', identifier, { action })
  }
}

/**
 * Manually block an identifier (for suspicious activity)
 */
export function blockIdentifier(
  identifier: string, 
  action: keyof typeof RATE_LIMITS, 
  duration?: number
) {
  const config = RATE_LIMITS[action]
  const key = generateKey(identifier, action)
  const blockDuration = duration || config.blockDuration
  
  const entry: RateLimitEntry = {
    count: config.maxAttempts + 1,
    resetTime: Date.now() + blockDuration,
    blocked: true
  }
  
  rateLimitStore.set(key, entry)
  
  logger.security('rate_limit_manual_block', identifier, { 
    action, 
    blockDuration 
  })
}

/**
 * Get rate limit info for an identifier without incrementing
 */
export function getRateLimitInfo(
  identifier: string, 
  action: keyof typeof RATE_LIMITS
): {
  remaining: number;
  resetTime: number;
  blocked: boolean;
} {
  const config = RATE_LIMITS[action]
  const key = generateKey(identifier, action)
  const now = Date.now()
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    return {
      remaining: config.maxAttempts,
      resetTime: now + config.windowMs,
      blocked: false
    }
  }
  
  return {
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetTime: entry.resetTime,
    blocked: entry.blocked
  }
}

/**
 * Create rate limiting middleware for API routes
 */
export function createRateLimitMiddleware(action: keyof typeof RATE_LIMITS) {
  return (req: { ip?: string; connection?: { remoteAddress?: string }; headers: Record<string, string | string[] | undefined> }, res: { setHeader: (name: string, value: string | number) => void; status: (code: number) => { json: (data: unknown) => void } }, next: () => void) => {
    // Get identifier (IP address, user ID, etc.)
    const identifier = req.ip || 
                      req.connection?.remoteAddress || 
                      req.headers['x-forwarded-for']?.split(',')[0] || 
                      'unknown'
    
    const result = checkRateLimit(identifier, action)
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMITS[action].maxAttempts)
    res.setHeader('X-RateLimit-Remaining', result.remaining)
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000))
    
    if (!result.allowed) {
      if (result.retryAfter) {
        res.setHeader('Retry-After', result.retryAfter)
      }
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: result.blocked 
          ? 'You are temporarily blocked due to too many requests'
          : 'Rate limit exceeded',
        retryAfter: result.retryAfter
      })
    }
    
    next()
  }
}

/**
 * Rate limiting hook for client-side components
 */
export function useRateLimit(action: keyof typeof RATE_LIMITS) {
  const checkLimit = (identifier: string) => {
    return checkRateLimit(identifier, action)
  }
  
  const recordSuccessAction = (identifier: string) => {
    recordSuccess(identifier, action)
  }
  
  const getInfo = (identifier: string) => {
    return getRateLimitInfo(identifier, action)
  }
  
  return {
    checkLimit,
    recordSuccess: recordSuccessAction,
    getInfo
  }
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(): string {
  // In the browser, we can use a combination of factors
  if (typeof window !== 'undefined') {
    // Use session storage for consistent identifier during session
    let identifier = sessionStorage.getItem('client_identifier')
    
    if (!identifier) {
      // Generate a session-based identifier
      identifier = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('client_identifier', identifier)
    }
    
    return identifier
  }
  
  return 'server_unknown'
}

const rateLimit = {
  checkRateLimit,
  recordSuccess,
  blockIdentifier,
  getRateLimitInfo,
  createRateLimitMiddleware,
  useRateLimit,
  getClientIdentifier,
  RATE_LIMITS
}

export default rateLimit