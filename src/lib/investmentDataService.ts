import { StockData } from "@/types/stock"

class InvestmentDataService {
  private alphaVantageKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY
  private cache = new Map<string, { data: any, timestamp: number }>()
  private CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getRealTimePrice(symbol: string) {
    const cacheKey = `price_${symbol}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`
      )
      const data = await response.json()
      const result = data.chart.result[0]
      const meta = result.meta
      
      const priceData = {
        symbol: meta.symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.previousClose,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        volume: meta.regularMarketVolume,
        previousClose: meta.previousClose
      }

      this.setCachedData(cacheKey, priceData)
      return priceData
    } catch (error) {
      console.error('Error fetching real-time price:', error)
      return null
    }
  }

  async getCompanyOverview(symbol: string) {
    const cacheKey = `overview_${symbol}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      )
      const data = await response.json()
      
      if (data['Error Message'] || data['Note']) {
        throw new Error('API limit reached or invalid symbol')
      }

      this.setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error fetching company overview:', error)
      return null
    }
  }

  async getCompleteStockData(symbol: string): Promise<StockData | null> {
    try {
      const [priceData, overview] = await Promise.all([
        this.getRealTimePrice(symbol),
        this.getCompanyOverview(symbol)
      ])

      if (!priceData || !overview) {
        throw new Error('Failed to fetch required data')
      }

      const recommendation = this.generateRecommendation(overview, priceData)

      return {
        symbol: overview.Symbol,
        name: overview.Name,
        price: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        volume: priceData.volume,
        marketCap: this.formatMarketCap(overview.MarketCapitalization),
        peRatio: parseFloat(overview.PERatio) || 0,
        eps: parseFloat(overview.EPS) || 0,
        dividendYield: parseFloat(overview.DividendYield) || 0,
        beta: parseFloat(overview.Beta) || 1,
        sector: overview.Sector || 'Unknown',
        industry: overview.Industry || 'Unknown',
        description: overview.Description || '',
        employees: parseInt(overview.FullTimeEmployees) || 0,
        website: overview.OfficialSite || '',
        headquarters: `${overview.Country || ''}`.trim(),
        financials: {
          revenue: parseFloat(overview.RevenueTTM) || 0,
          profitMargin: parseFloat(overview.ProfitMargin) || 0,
          operatingMargin: parseFloat(overview.OperatingMarginTTM) || 0,
          returnOnEquity: parseFloat(overview.ReturnOnEquityTTM) || 0,
          debtToEquity: parseFloat(overview.DebtToEquityRatio) || 0,
          currentRatio: parseFloat(overview.CurrentRatio) || 0
        },
        technicals: {
          fiftyDayMA: parseFloat(overview['50DayMovingAverage']) || 0,
          twoHundredDayMA: parseFloat(overview['200DayMovingAverage']) || 0,
          fiftyTwoWeekHigh: parseFloat(overview['52WeekHigh']) || 0,
          fiftyTwoWeekLow: parseFloat(overview['52WeekLow']) || 0,
          rsi: 50,
          support: parseFloat(overview['52WeekLow']) * 1.05,
          resistance: parseFloat(overview['52WeekHigh']) * 0.95
        },
        recommendation
      }
    } catch (error) {
      console.error('Error getting complete stock data:', error)
      return null
    }
  }

  private generateRecommendation(overview: any, priceData: any) {
    const pe = parseFloat(overview.PERatio) || 0
    const profitMargin = parseFloat(overview.ProfitMargin) || 0
    const roe = parseFloat(overview.ReturnOnEquityTTM) || 0
    const currentPrice = priceData.price
    const fiftyTwoWeekLow = parseFloat(overview['52WeekLow']) || 0
    const fiftyTwoWeekHigh = parseFloat(overview['52WeekHigh']) || 0
    
    let score = 0
    const reasoning: string[] = []
    
    // P/E Analysis
    if (pe > 0 && pe < 15) {
      score += 2
      reasoning.push('Attractive P/E ratio suggests undervaluation')
    } else if (pe > 30) {
      score -= 2
      reasoning.push('High P/E ratio may indicate overvaluation')
    }
    
    // Profitability
    if (profitMargin > 0.15) {
      score += 2
      reasoning.push('Strong profit margins indicate efficient operations')
    } else if (profitMargin < 0.05) {
      score -= 1
      reasoning.push('Low profit margins may indicate challenges')
    }
    
    // Return on Equity
    if (roe > 0.15) {
      score += 1
      reasoning.push('Good return on equity shows effective management')
    }
    
    // Price position
    const pricePosition = (currentPrice - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow)
    if (pricePosition < 0.3) {
      score += 1
      reasoning.push('Trading near 52-week lows presents opportunity')
    } else if (pricePosition > 0.8) {
      score -= 1
      reasoning.push('Trading near 52-week highs may limit upside')
    }
    
    let rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
    let targetPrice: number
    
    if (score >= 4) {
      rating = 'Strong Buy'
      targetPrice = currentPrice * 1.25
    } else if (score >= 2) {
      rating = 'Buy'
      targetPrice = currentPrice * 1.15
    } else if (score >= -1) {
      rating = 'Hold'
      targetPrice = currentPrice * 1.05
    } else if (score >= -3) {
      rating = 'Sell'
      targetPrice = currentPrice * 0.9
    } else {
      rating = 'Strong Sell'
      targetPrice = currentPrice * 0.8
    }
    
    return {
      rating,
      targetPrice,
      analystConsensus: `${score >= 0 ? 'Positive' : 'Negative'} outlook based on fundamental analysis`,
      reasoning,
      confidenceScore: Math.min(Math.max((Math.abs(score) / 6) * 100, 40), 95)
    }
  }

  private formatMarketCap(marketCap: string): string {
    const value = parseInt(marketCap) || 0
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value}`
  }

  // Get popular stocks for homepage
  async getPopularStocks(symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META']) {
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getCompleteStockData(symbol))
    )
    
    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<StockData>).value)
  }
}

export const investmentDataService = new InvestmentDataService()