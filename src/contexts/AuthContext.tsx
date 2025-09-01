'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data?: { user: User; session: Session | null } | null; error?: AuthError }>
  signUp: (email: string, password: string, userData?: { fullName?: string; email?: string; password?: string; metadata?: Record<string, unknown> }) => Promise<{ data?: { user: User; session: Session | null } | null; error?: AuthError }>
  signOut: () => Promise<{ error?: AuthError }>
  resetPassword: (email: string) => Promise<{ error?: AuthError }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check if we have a real Supabase client
        if ('getSession' in supabase.auth) {
          const { data: { session }, error } = await (supabase.auth as { getSession(): Promise<{ data: { session: Session | null }; error: AuthError | null }> }).getSession()
          
          if (error) {
            logger.error('Error getting initial session', error)
          } else {
            setSession(session)
            setUser(session?.user ?? null)
            
            if (session?.user) {
              logger.security('session_restored', session.user.id)
            }
          }
        } else {
          // Mock client - no session available
          logger.dev('Using mock auth client - no session management')
        }
      } catch (error) {
        logger.error('Failed to get initial session', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes (only with real client)
    let subscription: { unsubscribe: () => void } | null = null
    if ('onAuthStateChange' in supabase.auth) {
      const { data } = (supabase.auth as { onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { subscription: { unsubscribe: () => void } } } }).onAuthStateChange(
        async (event: string, session: Session | null) => {
          logger.security('auth_state_change', session?.user?.id, { event })
          
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          // Handle specific auth events
          switch (event) {
            case 'SIGNED_IN':
              logger.security('user_signed_in', session?.user?.id)
              break
            case 'SIGNED_OUT':
              logger.security('user_signed_out')
              break
            case 'TOKEN_REFRESHED':
              logger.dev('Token refreshed for user', session?.user?.id)
              break
            case 'USER_UPDATED':
              logger.security('user_updated', session?.user?.id)
              break
          }
        }
      )
      subscription = data.subscription
    }

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      logger.security('sign_in_attempt', email)
      
      // Check if we have a real Supabase client
      if ('signInWithPassword' in supabase.auth) {
        const { data, error } = await (supabase.auth as { signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: { user: User; session: Session } | null; error: AuthError | null }> }).signInWithPassword({
          email: email.toLowerCase().trim(),
          password
        })

        if (error) {
          logger.security('sign_in_failed', email, { error: error.message })
          return { error }
        }

        logger.security('sign_in_success', data?.user?.id)
        return { data }
      } else {
        // Mock client - simulate success for development
        logger.dev('Mock sign in for development:', email)
        const mockUser = {
          id: 'mock-user-id',
          email: email,
          user_metadata: { full_name: 'Development User' }
        }
        setUser(mockUser as unknown as User)
        return { data: { user: mockUser as unknown as User, session: null } }
      }
    } catch (error) {
      logger.error('Sign in error', error)
      return { error: error as AuthError }
    }
  }

  const signUp = async (email: string, password: string, userData?: { fullName?: string; email?: string; password?: string; metadata?: Record<string, unknown> }) => {
    try {
      logger.security('sign_up_attempt', email)
      
      // Check if we have a real Supabase client
      if ('signUp' in supabase.auth) {
        const { data, error } = await (supabase.auth as { signUp(credentials: { email: string; password: string; options?: { data?: Record<string, unknown> } }): Promise<{ data: { user: User; session: Session } | null; error: AuthError | null }> }).signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: userData ? {
              full_name: userData.fullName,
              ...userData
            } : undefined
          }
        })

        if (error) {
          logger.security('sign_up_failed', email, { error: error.message })
          return { error }
        }

        logger.security('sign_up_success', data?.user?.id)
        return { data }
      } else {
        // Mock client - simulate success for development
        logger.dev('Mock sign up for development:', email)
        const mockUser = {
          id: 'mock-user-id',
          email: email,
          user_metadata: { 
            full_name: userData?.fullName || 'Development User',
            ...userData
          }
        }
        setUser(mockUser as unknown as User)
        return { data: { user: mockUser as unknown as User, session: null } }
      }
    } catch (error) {
      logger.error('Sign up error', error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      logger.security('sign_out_attempt', user?.id)
      
      // Check if we have a real Supabase client
      if ('signOut' in supabase.auth) {
        const { error } = await (supabase.auth as { signOut(): Promise<{ error: AuthError | null }> }).signOut()
        
        if (error) {
          logger.error('Sign out error', error)
          return { error }
        }
      } else {
        // Mock client - clear user state
        logger.dev('Mock sign out for development')
        setUser(null)
        setSession(null)
      }

      logger.security('sign_out_success')
      return {}
    } catch (error) {
      logger.error('Sign out error', error)
      return { error: error as AuthError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      logger.security('password_reset_attempt', email)
      
      // Check if we have a real Supabase client
      if ('resetPasswordForEmail' in supabase.auth) {
        const { error } = await (supabase.auth as { resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<{ error: AuthError | null }> }).resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        })

        if (error) {
          logger.security('password_reset_failed', email, { error: error.message })
          return { error }
        }
      } else {
        // Mock client - simulate success
        logger.dev('Mock password reset for development:', email)
      }

      logger.security('password_reset_sent', email)
      return {}
    } catch (error) {
      logger.error('Password reset error', error)
      return { error: error as AuthError }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext