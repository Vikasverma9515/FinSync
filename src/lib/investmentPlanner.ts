import type { UserProfile } from '@/types'

interface RecommendedAsset {
  symbol: string
  name: string
  allocation: number
  reason: string
}

interface InvestmentPlanRecommendation {
  portfolio: RecommendedAsset[]
  summary: string
  riskLevel: string
}

const STOCK_RECOMMENDATIONS: Record<string, { low: string[]; medium: string[]; high: string[] }> = {
  stocks: {
    low: ['TCS', 'SBIN', 'INFY', 'HDFCBANK', 'ITC'],
    medium: ['RELIANCE', 'WIPRO', 'BHARTIARTL', 'MARUTI', 'SUNPHARMA'],
    high: ['ZOMATO', 'NYKAA', 'LT', 'BAJAJFINSV', 'HDFC'],
  },
}

export function generateInvestmentPlan(profile: UserProfile): InvestmentPlanRecommendation {
  const allocations = getAllocationByRisk(profile.risk_tolerance, profile.age)
  const selectedStocks = selectStocksForRisk(profile.risk_tolerance)

  const portfolio: RecommendedAsset[] = selectedStocks.map((stock, index) => ({
    symbol: stock,
    name: stock,
    allocation: allocations[index],
    reason: getReasonForStock(stock, profile.risk_tolerance),
  }))

  return {
    portfolio,
    summary: generateSummary(profile),
    riskLevel: profile.risk_tolerance,
  }
}

function getAllocationByRisk(
  riskTolerance: string,
  age: number
): number[] {
  const allocations: Record<string, number[]> = {
    low: [30, 25, 20, 15, 10],
    medium: [25, 20, 20, 20, 15],
    high: [20, 20, 20, 20, 20],
  }

  let baseAllocation = allocations[riskTolerance] || allocations.medium

  if (age < 30 && riskTolerance !== 'low') {
    baseAllocation = baseAllocation.map((a, i) => (i < 2 ? a + 5 : Math.max(a - 2, 5)))
  } else if (age > 50 && riskTolerance !== 'high') {
    baseAllocation = baseAllocation.map((a, i) => (i < 2 ? a - 5 : Math.max(a + 3, 10)))
  }

  return normalizeAllocations(baseAllocation)
}

function normalizeAllocations(allocations: number[]): number[] {
  const sum = allocations.reduce((a, b) => a + b, 0)
  return allocations.map(a => Math.round((a / sum) * 100))
}

function selectStocksForRisk(riskTolerance: string): string[] {
  const riskMap: Record<string, 'low' | 'medium' | 'high'> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
  }

  const risk = riskMap[riskTolerance] || 'medium'
  return STOCK_RECOMMENDATIONS.stocks[risk]
}

function getReasonForStock(stock: string, riskTolerance: string): string {
  const reasons: Record<string, Record<string, string>> = {
    TCS: {
      low: 'Strong, stable IT company with consistent dividends',
      medium: 'Leading IT services provider with growth potential',
      high: 'Tech sector exposure with global presence',
    },
    INFY: {
      low: 'Blue-chip IT company with reliable returns',
      medium: 'Consistent performer in the tech sector',
      high: 'Growth opportunity in digital services',
    },
    RELIANCE: {
      low: 'Diversified conglomerate with stable business',
      medium: 'Market leader with diverse revenue streams',
      high: 'Growth potential in energy and retail sectors',
    },
    SBIN: {
      low: 'Major bank with deposit safety and dividend yield',
      medium: 'Banking sector exposure with growth prospects',
      high: 'Financial sector leverage',
    },
    HDFCBANK: {
      low: 'Premium banking stock with consistent performance',
      medium: 'Top-tier bank with expansion potential',
      high: 'Sector leader with growth opportunities',
    },
    ITC: {
      low: 'Dividend-paying consumer goods company',
      medium: 'Diversified portfolio with dividend income',
      high: 'Consumer sector exposure with growth',
    },
    WIPRO: {
      low: 'Established IT company with regular dividends',
      medium: 'IT services firm with cloud computing exposure',
      high: 'Technology sector participation',
    },
    BHARTIARTL: {
      low: 'Telecom leader with steady cashflows',
      medium: 'Essential services provider with growth',
      high: 'Telecom sector with expansion plans',
    },
    ZOMATO: {
      low: 'Not recommended for conservative investors',
      medium: 'Digital platform with expansion potential',
      high: 'High-growth startup with market disruption',
    },
    NYKAA: {
      low: 'Not recommended for conservative investors',
      medium: 'E-commerce platform with growth potential',
      high: 'Digital consumer company with growth prospects',
    },
  }

  return (
    reasons[stock]?.[riskTolerance] ||
    `Recommended for your ${riskTolerance} risk profile`
  )
}

function generateSummary(profile: UserProfile): string {
  const baseMessage = `Based on your profile (age ${profile.age}, ${profile.risk_tolerance} risk tolerance, ₹${profile.initial_capital} initial capital)`

  const goals: Record<string, string> = {
    low: ', we recommend a conservative portfolio focused on dividend-yielding stocks and stable companies.',
    medium:
      ', we recommend a balanced portfolio with a mix of growth and income-generating stocks.',
    high: ', we recommend an aggressive growth portfolio with exposure to emerging opportunities.',
  }

  return baseMessage + (goals[profile.risk_tolerance] || goals.medium)
}
