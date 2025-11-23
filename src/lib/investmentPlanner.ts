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

function getRiskToleranceFromScore(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore <= 3) return 'low'
  if (riskScore <= 6) return 'medium'
  return 'high'
}

export async function generateInvestmentPlan(
  profile: UserProfile
): Promise<InvestmentPlanRecommendation> {
  try {
    // Call Gemini AI API to generate the plan
    const response = await fetch('/api/ai/investment-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        age: profile.age,
        riskScore: profile.risk_score,
        investmentAmount: profile.total_net_worth || 0,
        timeHorizon: 10,
        investmentGoal: 'Long-term wealth creation',
        currentPortfolio: profile.total_net_worth || 0,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate plan from Gemini AI')
    }

    const aiData = await response.json()

    const portfolio: RecommendedAsset[] = (aiData.portfolio || []).map((asset: any) => ({
      symbol: asset.symbol,
      name: asset.name,
      allocation: asset.allocation,
      reason: asset.reason,
    }))

    const riskTolerance = getRiskToleranceFromScore(profile.risk_score)

    return {
      portfolio: portfolio.length > 0 ? portfolio : generateFallbackPortfolio(profile, riskTolerance),
      summary: aiData.summary || generateSummary(profile, riskTolerance),
      riskLevel: aiData.riskLevel || riskTolerance,
    }
  } catch (error) {
    console.error('Error generating investment plan with Gemini AI, falling back to local generation:', error)

    // Fallback to local generation
    const riskTolerance = getRiskToleranceFromScore(profile.risk_score)
    const allocations = getAllocationByRisk(riskTolerance, profile.age)
    const selectedStocks = selectStocksForRisk(riskTolerance)

    const portfolio: RecommendedAsset[] = selectedStocks.map((stock, index) => ({
      symbol: stock,
      name: stock,
      allocation: allocations[index],
      reason: getReasonForStock(stock, riskTolerance),
    }))

    return {
      portfolio,
      summary: generateSummary(profile, riskTolerance),
      riskLevel: riskTolerance,
    }
  }
}

function generateFallbackPortfolio(profile: UserProfile, riskTolerance: 'low' | 'medium' | 'high'): RecommendedAsset[] {
  const allocations = getAllocationByRisk(riskTolerance, profile.age)
  const selectedStocks = selectStocksForRisk(riskTolerance)

  return selectedStocks.map((stock, index) => ({
    symbol: stock,
    name: stock,
    allocation: allocations[index],
    reason: getReasonForStock(stock, riskTolerance),
  }))
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

function generateSummary(profile: UserProfile, riskTolerance: 'low' | 'medium' | 'high'): string {
  const baseMessage = `Based on your profile (age ${profile.age}, risk score ${profile.risk_score}, net worth ₹${profile.total_net_worth.toLocaleString()})`

  const goals: Record<string, string> = {
    low: ', we recommend a conservative portfolio focused on dividend-yielding stocks and stable companies.',
    medium:
      ', we recommend a balanced portfolio with a mix of growth and income-generating stocks.',
    high: ', we recommend an aggressive growth portfolio with exposure to emerging opportunities.',
  }

  return baseMessage + (goals[riskTolerance] || goals.medium)
}
