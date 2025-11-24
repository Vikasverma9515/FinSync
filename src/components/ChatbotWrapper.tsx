'use client'

import { useAuth } from '@/lib/auth-context'
import { AIWealthChatbot } from './AIWealthChatbot'

export function ChatbotWrapper() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return null

  return <AIWealthChatbot />
}
