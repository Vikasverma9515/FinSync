// const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

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

const INDIAN_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited' },
  { symbol: 'INFY', name: 'Infosys Limited' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited' },
  { symbol: 'ITC', name: 'ITC Limited' },
  { symbol: 'WIPRO', name: 'Wipro Limited' },
  { symbol: 'LT', name: 'Larsen & Toubro Limited' },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Limited' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited' },
  { symbol: 'HDFC', name: 'Housing Development Finance Corporation' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Limited' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited' },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories Limited" },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Limited' },
  { symbol: 'COALINDIA', name: 'Coal India Limited' },
  { symbol: 'BAJAJFINANCE', name: 'Bajaj Finance Limited' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Limited' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Limited' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited' },
]

export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
  try {
    const searchQuery = query.toLowerCase().trim()
    
    if (!searchQuery) {
      return []
    }
    
    const results = INDIAN_STOCKS.filter(stock => 
      stock.symbol.toLowerCase().includes(searchQuery) || 
      stock.name.toLowerCase().includes(searchQuery)
    )
    
    return results.slice(0, 10)
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

export interface PredictResponse {
  ai_strategy: {
    [key: string]: number
  }
  final_recommendation: Array<{
    Allocation: number
    Asset: string
    Tickers: string[]
  }>
  user_profile: {
    Age: number
    AnnualIncome: number
    Dependents: number
    FinancialCondition: number
    FinancialGoal: number
    InvestmentHorizon: number
    InvestmentKnowledge: number
    RiskScore: number
    TotalNetWorth: number
  }
}

export async function getPredictData(userProfile: any, token?: string): Promise<PredictResponse | null> {
  try {
    const queryParams = new URLSearchParams()
    Object.entries(userProfile).forEach(([key, value]) => {
      queryParams.append(key, String(value))
    })

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`/api/predict?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) return null
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching predict data:', error)
    return null
  }
}
