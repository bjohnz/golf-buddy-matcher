'use client'

import { Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface UpgradeButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  href?: string
  onClick?: () => void
}

export default function UpgradeButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  showIcon = true,
  href = '/pricing',
  onClick
}: UpgradeButtonProps) {
  const buttonContent = (
    <>
      {showIcon && <Crown className="h-4 w-4 mr-2" />}
      {children || 'Upgrade to Premium'}
      {showIcon && <ArrowRight className="h-4 w-4 ml-2" />}
    </>
  )

  if (href) {
    return (
      <Link href={href}>
        <Button
          variant={variant}
          size={size}
          className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white ${className}`}
          onClick={onClick}
        >
          {buttonContent}
        </Button>
      </Link>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </Button>
  )
}

export function SmallUpgradeButton({ className = '', ...props }: UpgradeButtonProps) {
  return (
    <UpgradeButton
      size="sm"
      variant="outline"
      className={`text-green-600 border-green-300 hover:bg-green-50 ${className}`}
      {...props}
    />
  )
}

export function FloatingUpgradeButton({ className = '', ...props }: UpgradeButtonProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <UpgradeButton
        size="lg"
        className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        {...props}
      />
    </div>
  )
} 