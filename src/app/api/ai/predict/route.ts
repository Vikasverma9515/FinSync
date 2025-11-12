import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { finSyncAI } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { symbol, currentPrice, timeframe } = await request.json()

    if (!symbol || !currentPrice) {
      return NextResponse.json({ error: 'Symbol and current price are required' }, { status: 400 })
    }

    const prediction = await finSyncAI.predictStockPrice(symbol, currentPrice, timeframe)

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error('AI Predict API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}