import { NextRequest, NextResponse } from 'next/server'
import { finSyncAI } from '@/lib/ai'

export async function GET() {
  try {
    const insights = await finSyncAI.getMarketInsights()
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('AI Insights API error:', error)
    return NextResponse.json(
      { error: 'Failed to get market insights' },
      { status: 500 }
    )
  }
}