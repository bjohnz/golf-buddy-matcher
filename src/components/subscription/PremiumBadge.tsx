'use client'

import { Crown, Lock } from 'lucide-react'
import { SimpleTooltip } from '@/components/ui/Tooltip'

interface PremiumBadgeProps {
  isPremium: boolean
  feature: string
  className?: string
  showLock?: boolean
}

export default function PremiumBadge({ 
  isPremium, 
  feature, 
  className = '',
  showLock = false 
}: PremiumBadgeProps) {
  if (isPremium) {
    return (
      <SimpleTooltip content={`Premium feature: ${feature}`}>
        <div className={`inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-full ${className}`}>
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </div>
      </SimpleTooltip>
    )
  }

  if (showLock) {
    return (
      <SimpleTooltip content={`Upgrade to Premium to unlock ${feature}`}>
        <div className={`inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full ${className}`}>
          <Lock className="h-3 w-3 mr-1" />
          Premium Only
        </div>
      </SimpleTooltip>
    )
  }

  return null
}

export function PremiumLock({ feature, className = '' }: { feature: string; className?: string }) {
  return (
    <SimpleTooltip content={`Upgrade to Premium to unlock ${feature}`}>
      <div className={`inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full ${className}`}>
        <Lock className="h-3 w-3" />
      </div>
    </SimpleTooltip>
  )
} 