/**
 * Environment variable validation for Golf Buddy Matcher
 * Ensures all required environment variables are present and valid
 */

import { logger } from './logger'

// Required environment variables for production
const REQUIRED_ENV_VARS = {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  SUPABASE_SERVICE_KEY: 'Supabase service key',
  
  // Application configuration
  NEXT_PUBLIC_APP_URL: 'Application URL',
  JWT_SECRET: 'JWT signing secret',
  ENCRYPTION_KEY: 'Data encryption key',
  
  // Node environment
  NODE_ENV: 'Node environment'
} as const

// Optional environment variables with validation
const OPTIONAL_ENV_VARS = {
  // External services
  MAPBOX_API_KEY: 'Mapbox API key',
  STRIPE_SECRET_KEY: 'Stripe secret key',
  STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret',
  
  // Email service
  SENDGRID_API_KEY: 'SendGrid API key',
  SENDGRID_FROM_EMAIL: 'SendGrid from email',
  
  // Monitoring
  SENTRY_DSN: 'Sentry DSN',
  NEXT_PUBLIC_GA_MEASUREMENT_ID: 'Google Analytics ID',
  
  // Rate limiting
  UPSTASH_REDIS_REST_URL: 'Upstash Redis URL',
  UPSTASH_REDIS_REST_TOKEN: 'Upstash Redis token',
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: 'Analytics feature flag',
  NEXT_PUBLIC_ENABLE_PAYMENTS: 'Payments feature flag'
} as const

/**
 * Validate environment variables
 */
export function validateEnvironment(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missing: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const missing: string[] = []
  
  // Check required environment variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key]
    
    if (!value) {
      errors.push(`Missing required environment variable: ${key} (${description})`)
      missing.push(key)
    } else if (value.trim() === '') {
      errors.push(`Empty required environment variable: ${key} (${description})`)
    } else if (value.includes('your-') || value.includes('placeholder')) {
      errors.push(`Environment variable ${key} contains placeholder value: ${description}`)
    }
  }
  
  // Check optional environment variables
  for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[key]
    
    if (value && (value.includes('your-') || value.includes('placeholder'))) {
      warnings.push(`Environment variable ${key} contains placeholder value: ${description}`)
    }
  }
  
  // Validate specific environment variables
  validateSpecificEnvVars(errors, warnings)
  
  // Log validation results
  if (errors.length > 0) {
    logger.error('Environment validation failed', { errors, missing })
  } else if (warnings.length > 0) {
    logger.warn('Environment validation warnings', { warnings })
  } else {
    logger.info('Environment validation passed')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missing
  }
}

/**
 * Validate specific environment variables
 */
function validateSpecificEnvVars(errors: string[], warnings: string[]) {
  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL')
  }
  
  // Validate JWT secret strength
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }
  
  // Validate encryption key
  const encryptionKey = process.env.ENCRYPTION_KEY
  if (encryptionKey && encryptionKey.length < 32) {
    errors.push('ENCRYPTION_KEY must be at least 32 characters long')
  }
  
  // Validate app URL format
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl && !appUrl.startsWith('https://')) {
    warnings.push('NEXT_PUBLIC_APP_URL should use HTTPS in production')
  }
  
  // Validate Stripe keys format
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (stripeSecretKey && !stripeSecretKey.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY must start with "sk_"')
  }
  
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY
  if (stripePublishableKey && !stripePublishableKey.startsWith('pk_')) {
    errors.push('STRIPE_PUBLISHABLE_KEY must start with "pk_"')
  }
  
  // Validate email format
  const sendgridEmail = process.env.SENDGRID_FROM_EMAIL
  if (sendgridEmail && !isValidEmail(sendgridEmail)) {
    errors.push('SENDGRID_FROM_EMAIL must be a valid email address')
  }
}

/**
 * Check if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get environment summary for debugging
 */
export function getEnvironmentSummary(): Record<string, any> {
  const summary: Record<string, any> = {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasStripe: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
    hasSendGrid: !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL),
    hasSentry: !!process.env.SENTRY_DSN,
    hasAnalytics: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    hasRedis: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    features: {
      analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      payments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true'
    }
  }
  
  return summary
}

/**
 * Validate environment on app startup
 */
export function validateEnvironmentOnStartup(): void {
  if (typeof window !== 'undefined') {
    // Client-side validation
    const clientValidation = validateClientEnvironment()
    if (!clientValidation.isValid) {
      console.error('Client environment validation failed:', clientValidation.errors)
    }
  } else {
    // Server-side validation
    const validation = validateEnvironment()
    if (!validation.isValid) {
      throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`)
    }
  }
}

/**
 * Validate client-side environment variables
 */
function validateClientEnvironment(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check required client-side environment variables
  const requiredClientVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]
  
  for (const key of requiredClientVars) {
    const value = process.env[key]
    if (!value) {
      errors.push(`Missing client environment variable: ${key}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate environment variable documentation
 */
export function generateEnvDocs(): string {
  let docs = '# Environment Variables Documentation\n\n'
  
  docs += '## Required Variables\n\n'
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    docs += `- **${key}**: ${description}\n`
  }
  
  docs += '\n## Optional Variables\n\n'
  for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    docs += `- **${key}**: ${description}\n`
  }
  
  return docs
}

export default {
  validateEnvironment,
  validateEnvironmentOnStartup,
  getEnvironmentSummary,
  generateEnvDocs,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
} 