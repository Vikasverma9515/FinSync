import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { finSyncAI } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get user context if authenticated
    let userContext = {}

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // Get portfolio
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)

        userContext = {
          profile,
          portfolio: portfolio || []
        }
      }
    } catch (error) {
      // Continue without user context
      console.log('No user context available')
    }

    const response = await finSyncAI.chatWithAI(message, userContext)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}