'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-6">
            We&apos;re sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800 mb-2">Error Details (Development):</p>
              <p className="text-xs text-red-600 font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-500 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If the problem persists, please contact support</p>
          {error.digest && (
            <p className="mt-2">Reference: {error.digest}</p>
          )}
        </div>
      </div>
    </div>
  )
} 