/**
 * Secure logging utility for Golf Buddy Matcher
 * Prevents sensitive data from being logged in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Log informational messages (development only)
   */
  dev: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`[DEV] ${message}`, data || '')
    }
  },

  /**
   * Log general information
   */
  info: (message: string, metadata?: Record<string, string | number | boolean>) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, metadata || '')
    }
    // In production, send to logging service
  },

  /**
   * Log warnings
   */
  warn: (message: string, metadata?: Record<string, string | number | boolean>) => {
    console.warn(`[WARN] ${message}`, metadata || '')
  },

  /**
   * Log errors (always logged)
   */
  error: (message: string, error?: unknown, metadata?: Record<string, string | number | boolean>) => {
    const errorInfo = {
      message,
      error: error?.message || error,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    }
    console.error('[ERROR]', errorInfo)
  },

  /**
   * Log security-related events (always logged)
   */
  security: (event: string, userId?: string, metadata?: Record<string, string | number | boolean>) => {
    const securityEvent = {
      event,
      userId: userId || 'anonymous',
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    }
    console.log('[SECURITY]', securityEvent)
    // In production, send to security monitoring service
  },

  /**
   * Log audit events (always logged)
   */
  audit: (action: string, userId: string, resource?: string, metadata?: Record<string, string | number | boolean>) => {
    const auditEvent = {
      action,
      userId,
      resource,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    }
    console.log('[AUDIT]', auditEvent)
    // In production, send to audit logging service
  },

  /**
   * Log database operations (development only)
   */
  database: (operation: string, table?: string, metadata?: Record<string, string | number | boolean>) => {
    if (isDevelopment) {
      console.log(`[DB] ${operation}`, { table, ...metadata })
    }
  }
}

/**
 * Sanitize data for logging - removes sensitive fields
 */
export function sanitizeForLogging(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data

  const sensitiveFields = [
    'password', 'confirmPassword', 'token', 'secret', 'key', 
    'apiKey', 'privateKey', 'accessToken', 'refreshToken',
    'ssn', 'creditCard', 'cvv', 'pin'
  ]

  const sanitized = { ...data }
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}

export default logger