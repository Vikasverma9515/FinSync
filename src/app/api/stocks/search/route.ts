import { searchStocks } from '@/lib/stocks'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 1) {
    return NextResponse.json(
      { error: 'Query is required' },
      { status: 400 }
    )
  }

  const results = await searchStocks(query)
  return NextResponse.json(results)
}
