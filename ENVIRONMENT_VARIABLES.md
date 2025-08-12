# 🔐 **Environment Variables Configuration**

This file contains all the environment variables needed for the Golf Buddy Matcher application.

## 📋 **Setup Instructions**

1. Copy this template to `.env.local` in the root directory
2. Replace all placeholder values with your actual API keys and secrets
3. **NEVER** commit `.env.local` to version control

```bash
# Create your environment file
cp ENVIRONMENT_VARIABLES.md .env.local
# Edit with your actual values
nano .env.local
```

## 🔑 **Environment Variables Template**

Copy the following into your `.env.local` file:

```bash
# ============================================
# SUPABASE CONFIGURATION (REQUIRED)
# ============================================
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Server-side Supabase key (DO NOT expose to client)
SUPABASE_SERVICE_KEY=your-supabase-service-key

# ============================================
# EXTERNAL API KEYS (OPTIONAL)
# ============================================
# Mapbox for geocoding (keep server-side for security)
MAPBOX_API_KEY=your-mapbox-api-key

# Stripe for payments (if implementing premium features)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Your application URL (for redirects, emails, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# JWT secret for additional token signing (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-256-bits-minimum

# Encryption key for sensitive data (generate a secure random string)
ENCRYPTION_KEY=your-encryption-key-32-characters

# ============================================
# EMAIL SERVICE (OPTIONAL)
# ============================================
# SendGrid for email notifications
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Alternatively, use AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-aws-access-key
AWS_SES_SECRET_ACCESS_KEY=your-aws-secret-key

# ============================================
# RATE LIMITING (OPTIONAL)
# ============================================
# Upstash Redis for rate limiting
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# ============================================
# MONITORING & ANALYTICS (OPTIONAL)
# ============================================
# Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# FILE STORAGE (OPTIONAL)
# ============================================
# AWS S3 for additional file storage (if not using Supabase storage)
AWS_S3_BUCKET_NAME=your-s3-bucket
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=your-s3-access-key
AWS_S3_SECRET_ACCESS_KEY=your-s3-secret-key

# ============================================
# DEVELOPMENT CONFIGURATION
# ============================================
# Set to 'development' for local development
NODE_ENV=development

# Enable/disable specific features in development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

## ⚠️ **Security Best Practices**

### **1. Environment Variable Naming**
- Use `NEXT_PUBLIC_` prefix **ONLY** for values that can be safely exposed to the client
- Keep API keys, secrets, and private keys server-side only (no `NEXT_PUBLIC_` prefix)
- Use descriptive names that indicate the service and purpose

### **2. Secret Generation**
Generate secure secrets using these commands:

```bash
# Generate JWT Secret (32 bytes)
openssl rand -base64 32

# Generate Encryption Key (32 bytes)
openssl rand -base64 32

# Generate Random Password (24 characters)
openssl rand -base64 24
```

### **3. Required vs Optional Variables**

**🚨 REQUIRED for Basic Functionality:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

**🔧 OPTIONAL for Enhanced Features:**
- `MAPBOX_API_KEY` - For real geocoding (currently uses mock data)
- `STRIPE_*` - For payment processing
- `SENDGRID_*` or `AWS_SES_*` - For email notifications
- `UPSTASH_*` - For rate limiting
- `SENTRY_DSN` - For error tracking

### **4. Environment-Specific Configuration**

**Development (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Production (Vercel Environment Variables):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🚀 **Vercel Deployment Configuration**

When deploying to Vercel:

1. **Go to Project Settings → Environment Variables**
2. **Add each variable with appropriate environment scope:**
   - **Development**: For preview deployments
   - **Preview**: For pull request previews  
   - **Production**: For main branch deployments

3. **Mark sensitive variables as "Sensitive"** in Vercel dashboard
4. **Use different values for different environments**

### **Vercel Environment Variable Examples:**

| Variable Name | Environment | Value | Sensitive |
|---------------|-------------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://prod.supabase.co` | No |
| `SUPABASE_SERVICE_KEY` | All | `eyJ...` | **Yes** |
| `JWT_SECRET` | All | `random-string` | **Yes** |
| `STRIPE_SECRET_KEY` | Production | `sk_live_...` | **Yes** |
| `STRIPE_SECRET_KEY` | Development | `sk_test_...` | **Yes** |

## 🔍 **Environment Variable Validation**

The app validates required environment variables at build time. See `next.config.js`:

```javascript
// Environment variable validation
async generateBuildId() {
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
  
  return `golf-buddy-${Date.now()}`
}
```

## 🔐 **Security Checklist**

Before deploying to production:

- [ ] All secrets are in environment variables (not hardcoded)
- [ ] No `NEXT_PUBLIC_` prefix on sensitive data
- [ ] Different API keys for development vs production
- [ ] Strong, randomly generated JWT and encryption secrets
- [ ] Sensitive variables marked as "Sensitive" in Vercel
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] API keys have proper scoping and permissions
- [ ] Regular key rotation schedule established

## 🆘 **Troubleshooting**

### **Build Errors**
```bash
# Error: Missing required environment variables
# Solution: Add the missing variables to .env.local or Vercel dashboard
```

### **Supabase Connection Issues**
```bash
# Check your Supabase URL and keys
# Verify the project is not paused
# Ensure RLS policies are configured correctly
```

### **API Key Issues**
```bash
# Verify API keys are valid and not expired
# Check API key permissions and scoping
# Ensure correct environment (dev vs prod keys)
```

## 📞 **Getting API Keys**

### **Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to Settings → API
4. Copy URL and anon key

### **Mapbox**
1. Sign up at [mapbox.com](https://mapbox.com)
2. Go to Account → Access Tokens
3. Create a new token with geocoding permissions

### **Stripe**
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Use test keys for development, live keys for production

Remember: **Security is not optional for a social/dating app!** 🔒