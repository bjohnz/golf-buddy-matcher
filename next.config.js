/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent the page from being embedded in frames
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Control how much referrer information is included with requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Enable XSS protection in older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' data: https: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://vercel-insights.com",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "block-all-mixed-content"
            ].join('; ')
          },
          // Permissions Policy (Feature Policy)
          {
            key: 'Permissions-Policy',
            value: [
              'geolocation=(self)',
              'camera=(self)',
              'microphone=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'accelerometer=()',
              'gyroscope=()',
              'fullscreen=(self)',
              'picture-in-picture=(self)'
            ].join(', ')
          },
          // Cross-Origin Embedder Policy
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
          // Cross-Origin Opener Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          // Cross-Origin Resource Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          // Remove server information
          {
            key: 'Server',
            value: 'Golf Buddy Matcher'
          }
        ]
      }
    ]
  },
  
  // Remove the X-Powered-By header
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: [
      'images.unsplash.com',
      'your-supabase-project.supabase.co'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns']
  },
  
  // Webpack configuration for better security
  webpack: (config, { dev, isServer }) => {
    // Add security-related webpack plugins only in production
    if (!dev) {
      // Minimize bundle size and remove debug info
      config.optimization.minimize = true
      
      // Remove source maps in production for security
      config.devtool = false
    }
    
    return config
  },
  
  // Redirect configuration for security
  async redirects() {
    return [
      // Redirect old auth routes to new ones
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true
      },
      // Force HTTPS redirect (handled by Vercel in production)
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/(.*)',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http'
            }
          ],
          destination: 'https://yourdomain.com/:path*',
          permanent: true
        }
      ] : [])
    ]
  },
  
  // Environment variable validation
  async generateBuildId() {
    // Validate critical environment variables at build time
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    )
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      )
    }
    
    // Return a unique build ID
    return `golf-buddy-${Date.now()}`
  }
}

module.exports = nextConfig