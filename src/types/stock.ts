export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  peRatio: number
  eps: number
  dividendYield: number
  beta: number
  sector: string
  industry: string
  description: string
  employees: number
  website: string
  headquarters: string
  financials: {
    revenue: number
    profitMargin: number
    operatingMargin: number
    returnOnEquity: number
    debtToEquity: number
    currentRatio: number
  }
  technicals: {
    fiftyDayMA: number
    twoHundredDayMA: number
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
    rsi: number
    support: number
    resistance: number
  }
  recommendation: {
    rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
    targetPrice: number
    analystConsensus: string
    reasoning: string[]
    confidenceScore: number
  }
}

export interface PortfolioRecommendation {
  symbol: string
  name: string
  allocation: number
  reasoning: string
  riskLevel: 'Low' | 'Medium' | 'High'
  expectedReturn: number
}