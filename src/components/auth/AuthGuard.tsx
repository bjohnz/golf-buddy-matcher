'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Target } from 'lucide-react'
import { logger } from '@/lib/logger'

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
  requireProfile?: boolean
}

export function AuthGuard({ children, redirectTo = '/auth/login', requireProfile = false }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        logger.security('unauthorized_access_attempt', undefined, { 
          redirectTo,
          currentPath: window.location.pathname 
        })
        router.push(redirectTo)
      } else if (requireProfile && user && !user.user_metadata?.profile_completed) {
        logger.security('incomplete_profile_access', user.id, { 
          currentPath: window.location.pathname 
        })
        router.push('/auth/complete-profile')
      }
    }
  }, [user, loading, isAuthenticated, router, redirectTo, requireProfile])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Target className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (handled by useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Check if profile completion is required
  if (requireProfile && user && !user.user_metadata?.profile_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Please complete your profile...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard