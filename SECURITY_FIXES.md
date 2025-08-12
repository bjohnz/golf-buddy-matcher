# 🛠️ **Security Fixes Implementation Guide**

This document provides step-by-step instructions to fix the critical security vulnerabilities found in the Golf Buddy Matcher application.

---

## 🚨 **PHASE 1: CRITICAL FIXES (IMMEDIATE - WEEK 1)**

### **Fix 1: Remove Password Logging**

**Problem:** Passwords are logged to console in plaintext  
**Risk:** High - Password exposure  
**Priority:** Critical

**Files to fix:**
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`

**Implementation:**
```typescript
// ❌ REMOVE - Current vulnerable code
console.log('Login attempt:', { email, password })
console.log('Registration attempt:', formData) // Contains password

// ✅ REPLACE - Secure logging
console.log('Login attempt for user:', email) // No password
// For registration, exclude password from logs
const { password, confirmPassword, ...logData } = formData
console.log('Registration attempt:', logData)
```

### **Fix 2: Implement Real Authentication**

**Problem:** No actual authentication implemented  
**Risk:** Critical - Anyone can access any user data  
**Priority:** Critical

**Create Authentication Context:**
```typescript
// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

**Update Login Page:**
```typescript
// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ✅ SECURE - Real authentication
      const { error } = await signIn(email, password)
      
      if (error) {
        // ✅ SECURE - Generic error message
        toast.error('Invalid email or password')
        return
      }

      // ✅ SECURE - No sensitive data logged
      console.log('User signed in successfully')
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      // ✅ SECURE - Generic error message
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Rest of component...
}
```

### **Fix 3: Remove Hardcoded API Keys**

**Problem:** API keys hardcoded in source code  
**Risk:** Critical - API key exposure  
**Priority:** Critical

**Move to Environment Variables:**
```bash
# .env.local
MAPBOX_API_KEY=your_actual_mapbox_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Update Location Service:**
```typescript
// src/lib/location.ts
export class LocationService {
  private static readonly MAPBOX_API_KEY = process.env.MAPBOX_API_KEY

  static async reverseGeocode(lat: number, lng: number) {
    if (!this.MAPBOX_API_KEY) {
      throw new Error('Mapbox API key not configured')
    }

    // ✅ SECURE - API key from environment
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.MAPBOX_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding failed')
    }
    
    return response.json()
  }
}
```

### **Fix 4: Add Authorization Guards**

**Problem:** No user verification or access controls  
**Risk:** Critical - Data access without authorization  
**Priority:** Critical

**Create Auth Guard:**
```typescript
// src/components/auth/AuthGuard.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/auth/login' }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return <>{children}</>
}
```

**Protect Dashboard:**
```typescript
// src/app/dashboard/page.tsx
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function DashboardPage() {
  return (
    <AuthGuard>
      {/* Dashboard content */}
    </AuthGuard>
  )
}
```

---

## 🟠 **PHASE 2: HIGH PRIORITY FIXES (WEEK 2)**

### **Fix 5: Input Validation & Sanitization**

**Create Validation Schema:**
```typescript
// src/lib/validation.ts
import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  handicap: z.number()
    .min(-10, 'Handicap must be between -10 and 54')
    .max(54, 'Handicap must be between -10 and 54'),
  
  location: z.string()
    .min(2, 'Location is required')
    .max(100, 'Location too long'),
})

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number, and special character')

// XSS Prevention
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
```

### **Fix 6: Rate Limiting**

**Install Rate Limiter:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Implement Rate Limiting:**
```typescript
// src/lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
  analytics: true,
})
```

### **Fix 7: Clean Up Console Logging**

**Create Secure Logger:**
```typescript
// src/lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data)
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data)
  },
  
  // Never log sensitive data
  audit: (action: string, userId: string, metadata?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      metadata: metadata || {}
    }
    
    // In production, send to audit service
    if (!isDevelopment) {
      // Send to audit logging service
    } else {
      console.log('[AUDIT]', logEntry)
    }
  }
}
```

---

## 🟡 **PHASE 3: SECURITY HARDENING (WEEK 3)**

### **Fix 8: Security Headers**

**Update Next.js Config:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' data: https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "font-src 'self' data:",
            ].join('; ')
          }
        ]
      }
    ]
  },
  
  // Additional security
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
}

module.exports = nextConfig
```

### **Fix 9: File Upload Security**

**Secure File Upload:**
```typescript
// src/lib/fileUpload.ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }
  
  // Check file name
  const fileName = file.name.toLowerCase()
  if (!/^[a-z0-9._-]+\.(jpg|jpeg|png|webp)$/.test(fileName)) {
    return { valid: false, error: 'Invalid file name' }
  }
  
  return { valid: true }
}

export async function uploadSecureImage(file: File, userId: string) {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  // Generate secure filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36)}.${fileExt}`
  
  // Upload to Supabase Storage with RLS
  const { data, error } = await supabase.storage
    .from('profile-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  return data
}
```

### **Fix 10: Database RLS Implementation**

**Implement Row Level Security:**
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Profiles - Users can only see active, non-banned profiles
-- Users can only edit their own profile
CREATE POLICY "Users can view active profiles" ON profiles
  FOR SELECT USING (is_active = true AND is_banned = false);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Messages - Users can only see their own conversations
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM matches 
      WHERE id = match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE id = match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
      AND is_active = true
    )
  );

-- Matches - Users can only see their own matches
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
  );

-- Swipes - Users can only create their own swipes and see received swipes
CREATE POLICY "Users can view relevant swipes" ON swipes
  FOR SELECT USING (
    user_id = auth.uid() OR target_user_id = auth.uid()
  );

CREATE POLICY "Users can create own swipes" ON swipes
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

---

## 🔐 **PHASE 4: MONITORING & COMPLIANCE (WEEK 4)**

### **Fix 11: Audit Logging**

**Implement Audit System:**
```typescript
// src/lib/audit.ts
export interface AuditEvent {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  metadata?: any
  created_at: string
}

export class AuditService {
  static async logEvent(event: Omit<AuditEvent, 'id' | 'created_at'>) {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    
    // Store in database
    await supabase
      .from('audit_logs')
      .insert([auditEvent])
    
    // Log critical events immediately
    if (['login_failed', 'profile_reported', 'user_blocked'].includes(event.action)) {
      logger.audit(event.action, event.user_id, event.metadata)
    }
  }
}
```

### **Fix 12: Environment Configuration**

**Secure Environment Setup:**
```bash
# .env.local (NEVER commit to git)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
MAPBOX_API_KEY=your-mapbox-key
JWT_SECRET=your-jwt-secret-256-bits
ENCRYPTION_KEY=your-encryption-key
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Public variables (can be exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## ✅ **TESTING SECURITY FIXES**

### **Security Test Checklist**

**Authentication Testing:**
- [ ] Cannot access protected routes without login
- [ ] Session expires appropriately
- [ ] Password reset works securely
- [ ] Rate limiting prevents brute force

**Authorization Testing:**
- [ ] Users can only access their own data
- [ ] Admin functions properly protected
- [ ] RLS policies work correctly
- [ ] No privilege escalation possible

**Input Validation Testing:**
- [ ] XSS attempts are blocked
- [ ] SQL injection attempts fail
- [ ] File upload restrictions work
- [ ] Input sanitization effective

**Security Headers Testing:**
```bash
# Test security headers
curl -I https://yourdomain.com

# Should show:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## 🚀 **DEPLOYMENT SECURITY**

### **Vercel Environment Variables**
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add all environment variables from `.env.local`
3. Set appropriate environment (Development/Preview/Production)
4. **Never** use `NEXT_PUBLIC_` prefix for sensitive data

### **Database Security**
1. Enable RLS on all tables
2. Test policies with different user roles
3. Set up database backups
4. Configure connection limits

### **Monitoring Setup**
1. Set up error tracking (Sentry)
2. Configure uptime monitoring
3. Set up security alerts
4. Monitor for suspicious activities

---

## 🎯 **FINAL SECURITY CHECKLIST**

Before deploying to production, ensure:

- [ ] All critical fixes implemented
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] Security headers enabled
- [ ] RLS policies tested
- [ ] Input validation working
- [ ] Rate limiting active
- [ ] Audit logging enabled
- [ ] Error handling secure
- [ ] File upload restrictions working
- [ ] Authentication flow tested
- [ ] Authorization checks verified
- [ ] Security monitoring configured

**Only deploy after ALL items are checked!**

---

This comprehensive security fix guide addresses all critical vulnerabilities found in the security audit. Follow the phases in order and test thoroughly before proceeding to production deployment.