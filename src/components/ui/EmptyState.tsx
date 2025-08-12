import { Target, Users, MessageCircle, RefreshCw, LucideIcon } from 'lucide-react'
import { Button } from './Button'

// Import images using Next.js Image component or public URLs
const getImageUrl = (type: string) => {
  switch (type) {
    case 'no-matches':
      return '/images/no-matches.svg'
    case 'no-messages':
      return '/images/no-messages.svg'
    case 'no-activity':
      return '/images/no-activity.svg'
    case 'no-profiles':
      return '/images/no-profiles.svg'
    default:
      return '/images/empty-state.svg'
  }
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="bg-green-600 hover:bg-green-700"
          >
            {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            onClick={onSecondaryAction}
            variant="outline"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

// Specific empty states for common scenarios
export function NoMatchesEmptyState({ onStartMatching }: { onStartMatching: () => void }) {
  return (
    <EmptyState
      icon={Target}
      title="No Matches Yet"
      description="Start swiping to find your perfect golf partner! We'll match you with compatible golfers in your area."
      actionLabel="Start Matching"
      onAction={onStartMatching}
    />
  )
}

export function NoMessagesEmptyState({ onStartChat }: { onStartChat: () => void }) {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No Messages Yet"
      description="When you match with someone, you can start chatting here to coordinate your golf round."
      actionLabel="Find Matches"
      onAction={onStartChat}
    />
  )
}

export function NoProfilesEmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No More Profiles"
      description="You've seen all the available golf partners in your area. Check back later for new profiles!"
      actionLabel="Refresh"
      onAction={onRefresh}
      secondaryActionLabel="Adjust Preferences"
      onSecondaryAction={() => {/* TODO: Open preferences modal */}}
    />
  )
}

export function NoActivityEmptyState() {
  return (
    <EmptyState
      icon={RefreshCw}
      title="No Recent Activity"
      description="Your recent matches, messages, and profile views will appear here."
      actionLabel="Start Matching"
      onAction={() => {/* TODO: Navigate to matching */}}
    />
  )
} 