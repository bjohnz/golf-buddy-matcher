'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Target, Star, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ChatMessage, MatchWithProfile } from '@/types'
import { MessagingService } from '@/lib/messaging'
import { RatingService } from '@/lib/ratings'
import { formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import RatingModal from '@/components/ratings/RatingModal'
import { SimpleTooltip } from '@/components/ui/Tooltip'
import { NoMessagesEmptyState } from '@/components/ui/EmptyState'

interface ChatPageProps {
  params: Promise<{
    matchId: string
  }>
}

export default function ChatPage({ params }: ChatPageProps) {
  const { matchId } = use(params)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [matchProfile, setMatchProfile] = useState<MatchWithProfile | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [playedTogetherConfirmed, setPlayedTogetherConfirmed] = useState(false)
  const [canRate, setCanRate] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = 'current-user-id' // TODO: Get from auth context

  useEffect(() => {
    loadChatData()
  }, [matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatData = async () => {
    try {
      setLoading(true)
      
      // Load match profile and messages
      const [matchProfiles, chatMessages] = await Promise.all([
        MessagingService.getMatchesWithProfiles(currentUserId),
        MessagingService.getMessages(matchId, currentUserId)
      ])

      const currentMatch = matchProfiles.find(mp => mp.match.id === matchId)
      if (currentMatch) {
        setMatchProfile(currentMatch)
        
        // Check if both users confirmed they played together
        const playedTogether = await RatingService.getPlayedTogetherStatus(matchId)
        if (playedTogether?.confirmed_at) {
          setPlayedTogetherConfirmed(true)
          
          // Check if current user can rate (hasn't rated yet)
          const hasRated = await RatingService.hasRatedUser(
            currentUserId,
            currentMatch.profile.id,
            matchId
          )
          setCanRate(!hasRated)
        }
      }

      setMessages(chatMessages)
      
      // Mark messages as read
      await MessagingService.markMessagesAsRead(matchId, currentUserId)
    } catch (error) {
      console.error('Error loading chat data:', error)
      toast.error('Failed to load chat')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const result = await MessagingService.sendMessage(
        matchId,
        currentUserId,
        messageContent
      )

      if (result.success) {
        // Add message to local state
        const newChatMessage: ChatMessage = {
          id: result.messageId || `msg-${Date.now()}`,
          content: messageContent,
          senderId: currentUserId,
          senderName: 'You',
          timestamp: new Date().toISOString(),
          isOwn: true,
          isRead: false
        }
        setMessages(prev => [...prev, newChatMessage])
      } else {
        toast.error('Failed to send message')
        setNewMessage(messageContent) // Restore message
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setNewMessage(messageContent) // Restore message
    } finally {
      setSending(false)
    }
  }

  const handleConfirmPlayedTogether = async () => {
    if (!matchProfile) return

    try {
      const isUser1 = matchProfile.match.user1_id === currentUserId
      const result = await RatingService.confirmPlayedTogether(
        matchId,
        currentUserId,
        isUser1
      )

      if (result.success) {
        if (result.bothConfirmed) {
          setPlayedTogetherConfirmed(true)
          setCanRate(true)
          toast.success('Both players confirmed! You can now rate your experience.')
        } else {
          toast.success('Confirmation sent! Waiting for the other player to confirm.')
        }
      } else {
        toast.error('Failed to confirm played together')
      }
    } catch (error) {
      console.error('Error confirming played together:', error)
      toast.error('Failed to confirm played together')
    }
  }

  const handleRatingSubmitted = () => {
    setCanRate(false)
    toast.success('Thank you for your feedback!')
  }

  const handleStartChat = () => {
    // Focus on message input
    const messageInput = document.querySelector('input[type="text"]') as HTMLInputElement
    messageInput?.focus()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!matchProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Match not found</p>
          <Link href="/matches" className="text-green-600 hover:text-green-700">
            Back to matches
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link 
              href="/matches"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            
            {/* Profile Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                {matchProfile.profile.avatar_url ? (
                  <img
                    src={matchProfile.profile.avatar_url}
                    alt={matchProfile.profile.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {matchProfile.profile.full_name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{matchProfile.profile.full_name}</h2>
                <p className="text-sm text-gray-600">{matchProfile.profile.handicap} handicap</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Played Together Button */}
            {!playedTogetherConfirmed && (
              <SimpleTooltip content="Confirm you played golf together to enable rating">
                <Button
                  onClick={handleConfirmPlayedTogether}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  We played golf!
                </Button>
              </SimpleTooltip>
            )}

            {/* Rate Button */}
            {playedTogetherConfirmed && canRate && (
              <SimpleTooltip content="Rate your golf experience with this player">
                <Button
                  onClick={() => setShowRatingModal(true)}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate Experience
                </Button>
              </SimpleTooltip>
            )}

            <SimpleTooltip content="Get help with chatting and rating">
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </SimpleTooltip>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <NoMessagesEmptyState onStartChat={handleStartChat} />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isOwn ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <SimpleTooltip content="Type your message here">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={sending}
            />
          </SimpleTooltip>
          <SimpleTooltip content="Send message">
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
        </form>
      </div>

      {/* Rating Modal */}
      {matchProfile && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          raterId={currentUserId}
          ratedUserId={matchProfile.profile.id}
          ratedUserName={matchProfile.profile.full_name}
          matchId={matchId}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
} 