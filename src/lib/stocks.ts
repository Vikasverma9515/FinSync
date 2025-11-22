const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  timestamp: string
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `https://finance-portfolio-management-apis.onrender.com/api/output/stocks/${symbol}`
    )

    if (!response.ok) return null

    const data = await response.json()

    return {
      symbol: symbol.toUpperCase(),
      name: data.name || symbol,
      price: data.price || 0,
      change: data.change || 0,
      changePercent: data.changePercent || 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes = await Promise.all(
    symbols.map(symbol => getStockQuote(symbol))
  )
  
  return quotes.filter((quote): quote is StockQuote => quote !== null)
}

export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_API_KEY}`
    )

    if (!response.ok) return []

    const data = await response.json()
    
    return (data.result || [])
      .slice(0, 10)
      .map((result: any) => ({
        symbol: result.symbol,
        name: result.description,
      }))
  } catch (error) {
    console.error('Error searching stocks:', error)
    return []
  }
}

const POPULAR_STOCKS = [
  'TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'ICICIBANK',
  'SBIN', 'BHARTIARTL', 'ITC', 'WIPRO', 'LT'
]

export function getPopularStocks() {
  return POPULAR_STOCKS
}
