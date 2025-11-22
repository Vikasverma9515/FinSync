import { searchStocks } from '@/lib/stocks'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    console.log(`Searching for stocks with query: ${query}`)
    const results = await searchStocks(query)
    console.log(`Found ${results.length} stocks for query: ${query}`)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching stocks:', error)
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    )
  }
}
