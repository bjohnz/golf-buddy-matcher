# ⛳ Golf Buddy Matcher

A Tinder-style app for golfers to find compatible playing partners. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Profile Management**: Complete golf profiles with preferences
- **Smart Matching**: Algorithm-based matching considering handicap, location, and preferences
- **Real-time Chat**: Instant messaging between matched users
- **Safety Features**: User reporting, blocking, and rating system
- **Premium Features**: Freemium model with subscription tiers
- **PWA Support**: Installable mobile app with offline functionality
- **Mobile Optimized**: Responsive design with touch gestures

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel
- **PWA**: Service Worker, Web App Manifest

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd golf-buddy-matcher
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file:

```bash
cp .env.production.example .env.local
```

Fill in your environment variables:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Optional
MAPBOX_API_KEY=your-mapbox-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
SENDGRID_API_KEY=your-sendgrid-key
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
```

### 4. Database Setup

1. Create a Supabase project
2. Run the database migrations:
   - `database/migrations/001_initial_schema.sql`
   - `database/migrations/002_rls_policies.sql`

### 5. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build:production

# Run all tests
node scripts/test-production.js
```

## 🚀 Production Deployment

### 1. Prepare for Deployment

```bash
# Test production build
npm run test:production

# Check deployment checklist
# See PRODUCTION_CHECKLIST.md
```

### 2. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Configure Environment Variables

Set these in your Vercel project dashboard:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

**Optional:**
- `MAPBOX_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `SENDGRID_API_KEY`
- `SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### 4. Database Production Setup

1. Create production Supabase project
2. Apply database migrations
3. Configure RLS policies
4. Set up monitoring and backups

## 📱 PWA Features

The app includes Progressive Web App features:

- **Installable**: Users can install the app on their devices
- **Offline Support**: Basic functionality works without internet
- **Push Notifications**: Real-time notifications for matches and messages
- **App Shortcuts**: Quick access to key features

## 🔒 Security Features

- **Authentication**: Supabase Auth with secure session management
- **Authorization**: Row Level Security (RLS) policies
- **Input Validation**: Comprehensive client and server-side validation
- **Rate Limiting**: Protection against abuse
- **Security Headers**: CSP, HSTS, and other security headers
- **Data Encryption**: Sensitive data encrypted at rest

## 📊 Monitoring & Analytics

### Error Tracking
- Sentry integration for error monitoring
- Error boundaries for graceful error handling
- Comprehensive logging

### Performance Monitoring
- Core Web Vitals tracking
- Bundle analysis
- Performance optimization

### User Analytics
- Google Analytics 4 integration
- User behavior tracking
- Conversion analytics

## 🏗️ Project Structure

```
golf-buddy-matcher/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── contexts/           # React contexts (Auth)
│   ├── lib/                # Utility functions and services
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
│   ├── icons/              # PWA icons
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── offline.html       # Offline page
├── database/               # Database migrations
├── scripts/                # Build and deployment scripts
└── docs/                   # Documentation
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing & Quality
npm run type-check       # TypeScript compilation check
npm run lint             # ESLint
npm run test:production  # Production testing suite

# Production
npm run build:production # Production build
npm run validate:env     # Environment validation
npm run health:check     # Health check endpoint

# Utilities
npm run clean            # Clean build artifacts
npm run analyze          # Bundle analysis
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- [Production Checklist](PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [Security Implementation](SECURITY_IMPLEMENTATION_COMPLETE.md) - Security features overview
- [Environment Variables](ENVIRONMENT_VARIABLES.md) - Environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [documentation](docs/)
2. Review [troubleshooting guide](DEPLOYMENT.md#troubleshooting)
3. Open an issue on GitHub
4. Contact the development team

## 🎯 Roadmap

- [ ] Advanced matching algorithms
- [ ] Tournament organization
- [ ] Course integration
- [ ] Social features
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations

---

**⛳ Ready to find your perfect golf partner? Deploy and start matching!**
