/**
 * Secure error handling utilities for Golf Buddy Matcher
 * Prevents sensitive information leakage while providing useful feedback
 */

import React from 'react'
import { logger } from './logger'

// Error types that are safe to show to users
export const SAFE_ERROR_TYPES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  RATE_LIMIT: 'rate_limit',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  USER_INPUT: 'user_input'
} as const

// Generic user-friendly error messages
export const GENERIC_ERROR_MESSAGES = {
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  DATABASE_ERROR: 'Unable to process your request. Please try again.',
  NETWORK_ERROR: 'Network connection issue. Please check your internet connection.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait before trying again.',
  NOT_FOUND_ERROR: 'The requested resource was not found.',
  CONFLICT_ERROR: 'This action conflicts with existing data.',
  MAINTENANCE_ERROR: 'The service is temporarily unavailable for maintenance.'
} as const

export interface SafeError {
  message: string
  code?: string
  type: string
  details?: Record<string, any>
  timestamp: string
  requestId?: string
}

export interface ErrorContext {
  userId?: string
  action?: string
  resource?: string
  metadata?: Record<string, any>
}

/**
 * Sanitize error message to remove sensitive information
 */
export function sanitizeErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return sanitizeString(error)
  }
  
  if (error && typeof error === 'object') {
    if (error.message) {
      return sanitizeString(error.message)
    }
    
    // Handle different error object structures
    if (error.error && error.error.message) {
      return sanitizeString(error.error.message)
    }
    
    if (error.details) {
      return sanitizeString(error.details)
    }
  }
  
  return GENERIC_ERROR_MESSAGES.SERVER_ERROR
}

/**
 * Remove sensitive information from error strings
 */
function sanitizeString(message: string): string {
  return message
    // Remove file paths
    .replace(/\/[a-zA-Z0-9_\-\/\.]+\.(js|ts|tsx|jsx)/g, '[file]')
    // Remove stack traces
    .replace(/at\s+[^\n]+/g, '')
    // Remove database connection strings
    .replace(/postgresql:\/\/[^\s]+/g, '[database]')
    // Remove API keys and tokens
    .replace(/[a-zA-Z0-9_-]{20,}/g, '[token]')
    // Remove email addresses in error messages
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
    // Remove IP addresses
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]')
    // Remove UUIDs
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[id]')
    // Remove common sensitive field names and their values
    .replace(/(password|token|key|secret)[:\s=]+[^\s,}]+/gi, '$1: [redacted]')
    .trim()
}

/**
 * Create a safe error object for client consumption
 */
export function createSafeError(
  error: any,
  context: ErrorContext = {},
  userMessage?: string
): SafeError {
  const timestamp = new Date().toISOString()
  const requestId = generateRequestId()
  
  // Log the full error securely on the server
  logger.error('Error occurred', error, {
    context,
    requestId,
    timestamp
  })
  
  // Determine error type and safe message
  let errorType = 'server_error'
  let safeMessage = userMessage || GENERIC_ERROR_MESSAGES.SERVER_ERROR
  
  if (error && typeof error === 'object') {
    // Handle known error types
    if (error.type && SAFE_ERROR_TYPES[error.type as keyof typeof SAFE_ERROR_TYPES]) {
      errorType = error.type
      safeMessage = userMessage || error.message || safeMessage
    }
    
    // Handle specific error patterns
    if (error.message) {
      const message = error.message.toLowerCase()
      
      if (message.includes('validation') || message.includes('invalid')) {
        errorType = SAFE_ERROR_TYPES.VALIDATION
        safeMessage = userMessage || GENERIC_ERROR_MESSAGES.VALIDATION_ERROR
      } else if (message.includes('unauthorized') || message.includes('forbidden')) {
        errorType = SAFE_ERROR_TYPES.AUTHORIZATION
        safeMessage = userMessage || GENERIC_ERROR_MESSAGES.AUTHORIZATION_ERROR
      } else if (message.includes('not found')) {
        errorType = SAFE_ERROR_TYPES.NOT_FOUND
        safeMessage = userMessage || GENERIC_ERROR_MESSAGES.NOT_FOUND_ERROR
      } else if (message.includes('rate limit') || message.includes('too many')) {
        errorType = SAFE_ERROR_TYPES.RATE_LIMIT
        safeMessage = userMessage || GENERIC_ERROR_MESSAGES.RATE_LIMIT_ERROR
      } else if (message.includes('network') || message.includes('connection')) {
        errorType = 'network_error'
        safeMessage = userMessage || GENERIC_ERROR_MESSAGES.NETWORK_ERROR
      }
    }
  }
  
  return {
    message: sanitizeErrorMessage(safeMessage),
    type: errorType,
    timestamp,
    requestId
  }
}

/**
 * Generate a unique request ID for error tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Handle async operations with error boundaries
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {},
  userMessage?: string
): Promise<{ success: true; data: T } | { success: false; error: SafeError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const safeError = createSafeError(error, context, userMessage)
    return { success: false, error: safeError }
  }
}

/**
 * Custom error class for safe error handling
 */
export class ErrorBoundary extends Error {
  constructor(message: string, public safeError: SafeError) {
    super(message)
    this.name = 'ErrorBoundary'
  }
}

/**
 * Handle API response errors safely
 */
export function handleApiError(response: any, defaultMessage?: string): never {
  const context: ErrorContext = {
    action: 'api_request',
    metadata: {
      status: response?.status,
      statusText: response?.statusText
    }
  }
  
  let errorMessage = defaultMessage || GENERIC_ERROR_MESSAGES.SERVER_ERROR
  
  if (response?.status) {
    switch (response.status) {
      case 400:
        errorMessage = GENERIC_ERROR_MESSAGES.VALIDATION_ERROR
        break
      case 401:
        errorMessage = GENERIC_ERROR_MESSAGES.AUTHENTICATION_ERROR
        break
      case 403:
        errorMessage = GENERIC_ERROR_MESSAGES.AUTHORIZATION_ERROR
        break
      case 404:
        errorMessage = GENERIC_ERROR_MESSAGES.NOT_FOUND_ERROR
        break
      case 409:
        errorMessage = GENERIC_ERROR_MESSAGES.CONFLICT_ERROR
        break
      case 429:
        errorMessage = GENERIC_ERROR_MESSAGES.RATE_LIMIT_ERROR
        break
      case 503:
        errorMessage = GENERIC_ERROR_MESSAGES.MAINTENANCE_ERROR
        break
      default:
        errorMessage = GENERIC_ERROR_MESSAGES.SERVER_ERROR
    }
  }
  
  const safeError = createSafeError(response, context, errorMessage)
  throw new ErrorBoundary(errorMessage, safeError)
}

/**
 * React hook for error handling
 */
export function useErrorHandler() {
  const handleError = (error: any, context: ErrorContext = {}, userMessage?: string) => {
    const safeError = createSafeError(error, context, userMessage)
    
    // In development, also log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error)
      console.error('Safe error:', safeError)
    }
    
    return safeError
  }
  
  const handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    userMessage?: string
  ) => {
    return withErrorHandling(operation, context, userMessage)
  }
  
  return {
    handleError,
    handleAsyncError
  }
}

export default {
  createSafeError,
  sanitizeErrorMessage,
  withErrorHandling,
  handleApiError,
  useErrorHandler,
  GENERIC_ERROR_MESSAGES,
  SAFE_ERROR_TYPES
}