import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironment, getEnvironmentSummary } from '@/lib/envValidation'
import { logger } from '@/lib/logger'

export async function GET(_request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Validate environment variables
    const envValidation = validateEnvironment()
    
    // Get environment summary
    const envSummary = getEnvironmentSummary()
    
    // Check database connectivity (if Supabase is configured)
    let databaseStatus = 'unknown'
    let databaseLatency = 0
    
    if (envSummary.hasSupabase) {
      try {
        const dbStartTime = Date.now()
        // In a real implementation, you would test the database connection here
        // For now, we'll simulate a database check
        await new Promise(resolve => setTimeout(resolve, 10)) // Simulate DB check
        databaseLatency = Date.now() - dbStartTime
        databaseStatus = 'healthy'
      } catch (error) {
        databaseStatus = 'unhealthy'
        logger.error('Database health check failed', error)
      }
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime
    
    // Determine overall health status
    const isHealthy = envValidation.isValid && databaseStatus === 'healthy'
    
    // Prepare health check response
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime,
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        environment: {
          status: envValidation.isValid ? 'healthy' : 'unhealthy',
          errors: envValidation.errors,
          warnings: envValidation.warnings
        },
        database: {
          status: databaseStatus,
          latency: databaseLatency
        }
      },
      services: {
        supabase: envSummary.hasSupabase,
        stripe: envSummary.hasStripe,
        sendgrid: envSummary.hasSendGrid,
        sentry: envSummary.hasSentry,
        analytics: envSummary.hasAnalytics,
        redis: envSummary.hasRedis
      },
      features: envSummary.features
    }
    
    // Log health check
    logger.info('Health check performed', {
      status: healthData.status,
      responseTime,
      databaseStatus,
      environment: healthData.environment
    })
    
    // Return appropriate HTTP status code
    const statusCode = isHealthy ? 200 : 503
    
    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    logger.error('Health check failed', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: 'Internal server error during health check'
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

// Handle HEAD requests for simple health checks
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
} 