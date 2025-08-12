# 🚀 Golf Buddy Matcher - Production Deployment Guide

This guide will walk you through deploying the Golf Buddy Matcher application to production on Vercel with Supabase.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) installed
- [Vercel CLI](https://vercel.com/cli) (optional, for local testing)
- Supabase account and project
- Domain name (optional, for custom domain)

## 🔧 Step 1: Supabase Production Setup

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `golf-buddy-matcher-prod`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Configure Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the database migrations in order:

```sql
-- Run 001_initial_schema.sql first
-- Then run 002_rls_policies.sql
```

4. Verify all tables are created in **Table Editor**

### 1.3 Configure Authentication

1. Go to **Authentication > Settings**
2. Configure site URL: `https://yourdomain.com` (or Vercel URL)
3. Add redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/complete-profile`
   - `https://yourdomain.com/auth/update-password`

### 1.4 Set Up Row Level Security

The RLS policies are already included in the migration. Verify they're active:

1. Go to **Table Editor**
2. Check that RLS is enabled on all tables
3. Verify policies are created

### 1.5 Configure Storage (Optional)

1. Go to **Storage**
2. Create a new bucket called `avatars`
3. Set up policies for user avatar uploads

## 🌐 Step 2: Vercel Deployment

### 2.1 Prepare Your Repository

1. Ensure all changes are committed to Git
2. Push to your GitHub repository
3. Verify the following files exist:
   - `vercel.json`
   - `next.config.js`
   - `public/manifest.json`
   - `public/sw.js`
   - `public/offline.html`

### 2.2 Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (if not in root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2.3 Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

#### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

#### Optional Variables:
```
MAPBOX_API_KEY=your-mapbox-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
SENDGRID_API_KEY=your-sendgrid-key
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
```

**Important**: Mark sensitive variables as "Sensitive" in Vercel.

### 2.4 Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 32
```

## 🔒 Step 3: Security Configuration

### 3.1 Domain and SSL

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

### 3.2 Security Headers

The security headers are already configured in `next.config.js` and `vercel.json`. Verify they're working:

```bash
curl -I https://yourdomain.com
```

You should see security headers like:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### 3.3 Environment Validation

The app includes environment validation. Check the health endpoint:

```bash
curl https://yourdomain.com/api/health
```

## 📱 Step 4: PWA Configuration

### 4.1 Generate App Icons

You need to create app icons in multiple sizes. Use a tool like [PWA Builder](https://www.pwabuilder.com/imageGenerator) or create them manually:

Required sizes: 16x16, 32x32, 48x48, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Place them in `/public/icons/` directory.

### 4.2 Test PWA Installation

1. Open your deployed app in Chrome
2. Look for the install prompt
3. Test offline functionality
4. Verify service worker is registered

### 4.3 PWA Testing Checklist

- [ ] App installs on mobile devices
- [ ] Offline page displays when no internet
- [ ] Service worker caches properly
- [ ] App shortcuts work
- [ ] Splash screen displays correctly

## 🧪 Step 5: Testing

### 5.1 Pre-Deployment Testing

```bash
# Run all tests
npm run test:production

# Check build
npm run build:production

# Validate environment
npm run validate:env
```

### 5.2 Post-Deployment Testing

1. **Health Check**: Visit `/api/health`
2. **Authentication Flow**: Test signup/login
3. **Core Features**: Test matching, messaging
4. **Mobile Testing**: Test on various devices
5. **Performance**: Run Lighthouse audit

### 5.3 Testing Checklist

- [ ] Home page loads correctly
- [ ] Authentication works (signup/login)
- [ ] Profile creation works
- [ ] Matching system functions
- [ ] Messaging works
- [ ] PWA installation works
- [ ] Offline functionality works
- [ ] Error pages display correctly
- [ ] Mobile responsiveness
- [ ] Performance is acceptable

## 📊 Step 6: Monitoring Setup

### 6.1 Error Monitoring (Sentry)

1. Create a Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Configure error tracking

### 6.2 Analytics (Google Analytics)

1. Create GA4 property
2. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to environment variables
3. Verify tracking works

### 6.3 Performance Monitoring

1. Set up Vercel Analytics (optional)
2. Configure Core Web Vitals monitoring
3. Set up uptime monitoring

## 🔄 Step 7: CI/CD Setup (Optional)

### 7.1 GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:production
      - run: npm run build:production
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.2 Environment Secrets

Add these secrets to your GitHub repository:
- `VERCEL_TOKEN`
- `ORG_ID`
- `PROJECT_ID`

## 🚨 Step 8: Production Checklist

### 8.1 Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies active
- [ ] Security headers working
- [ ] SSL certificate active
- [ ] PWA icons generated
- [ ] Error pages created
- [ ] Health check endpoint working
- [ ] Performance optimized
- [ ] Mobile testing completed

### 8.2 Launch Checklist

- [ ] Domain configured
- [ ] Analytics tracking
- [ ] Error monitoring active
- [ ] Backup strategy in place
- [ ] Support contact information
- [ ] Terms of service page
- [ ] Privacy policy page
- [ ] Contact page

### 8.3 Post-Launch Checklist

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user registrations
- [ ] Test all core features
- [ ] Monitor database performance
- [ ] Check security logs

## 🔧 Step 9: Maintenance

### 9.1 Regular Tasks

- **Weekly**: Check error rates and performance
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Full backup and restore test

### 9.2 Monitoring

- Set up alerts for:
  - High error rates
  - Performance degradation
  - Database issues
  - SSL certificate expiration

### 9.3 Backups

- Supabase provides automatic backups
- Consider additional backup strategies
- Test restore procedures regularly

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**: Check environment variables
2. **Authentication Issues**: Verify Supabase configuration
3. **PWA Not Working**: Check manifest and service worker
4. **Performance Issues**: Optimize images and bundle size

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review error logs in Vercel dashboard
3. Check Supabase logs
4. Contact the development team

---

**🎉 Congratulations! Your Golf Buddy Matcher app is now live in production!**

Remember to:
- Monitor the application regularly
- Keep dependencies updated
- Backup data regularly
- Test new features thoroughly before deployment 