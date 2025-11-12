import type {
  FinancialFreedomInputs,
  FinancialFreedomPlan,
  WealthPathMap,
  FreedomScore,
  PersonalizedInsight,
  YearlyTarget,
  FinancialCoachMessage,
} from '@/types'

// Expected return rates based on risk preference
const RISK_RETURN_RATES = {
  low: 0.06, // 6% for conservative
  medium: 0.08, // 8% for balanced
  high: 0.10, // 10% for aggressive
}

// Investment allocation percentages by risk
const RISK_ALLOCATIONS = {
  low: { stocks: 40, bonds: 40, cash: 15, other: 5 },
  medium: { stocks: 60, bonds: 25, cash: 10, other: 5 },
  high: { stocks: 80, bonds: 10, cash: 5, other: 5 },
}

export function generateFinancialFreedomPlan(
  inputs: FinancialFreedomInputs
): FinancialFreedomPlan {
  const wealthPathMap = calculateWealthPathMap(inputs)
  const freedomScore = calculateFreedomScore(inputs, wealthPathMap)
  const insights = generateInsights(inputs, wealthPathMap, freedomScore)

  return {
    wealthPathMap,
    freedomScore,
    insights,
    summary: generateSummary(inputs, wealthPathMap, freedomScore),
    createdAt: new Date().toISOString(),
  }
}

function calculateWealthPathMap(inputs: FinancialFreedomInputs): WealthPathMap {
  const {
    monthlyIncome,
    monthlyExpenses,
    savingsGoal,
    timeHorizon,
    riskPreference,
    currentSavings,
    expectedReturnRate = RISK_RETURN_RATES[riskPreference],
  } = inputs

  const monthlySavings = monthlyIncome - monthlyExpenses
  const annualSavings = monthlySavings * 12

  // Calculate future value of current savings
  const currentSavingsFV = currentSavings * Math.pow(1 + expectedReturnRate, timeHorizon)

  // Calculate required monthly savings to reach goal
  const requiredMonthlySavings = calculateRequiredMonthlySavings(
    savingsGoal - currentSavingsFV,
    expectedReturnRate,
    timeHorizon * 12
  )

  const yearlyTargets: YearlyTarget[] = []
  let cumulativeSavings = currentSavings

  for (let year = 1; year <= timeHorizon; year++) {
    // Calculate savings at end of this year
    const yearEndSavings = cumulativeSavings * (1 + expectedReturnRate) + annualSavings

    // Calculate passive income (4% safe withdrawal rate)
    const passiveIncome = yearEndSavings * 0.04

    yearlyTargets.push({
      year,
      targetSavings: yearEndSavings,
      investmentAllocation: RISK_ALLOCATIONS[riskPreference],
      passiveIncome,
      totalWealth: yearEndSavings,
    })

    cumulativeSavings = yearEndSavings
  }

  return {
    yearlyTargets,
    totalYears: timeHorizon,
    finalWealth: cumulativeSavings,
    monthlySavingsNeeded: Math.max(requiredMonthlySavings, 0),
  }
}

function calculateRequiredMonthlySavings(
  targetAmount: number,
  annualReturn: number,
  months: number
): number {
  if (targetAmount <= 0) return 0

  const monthlyRate = annualReturn / 12
  const requiredMonthly =
    (targetAmount * monthlyRate) /
    (Math.pow(1 + monthlyRate, months) - 1)

  return requiredMonthly
}

function calculateFreedomScore(
  inputs: FinancialFreedomInputs,
  wealthPathMap: WealthPathMap
): FreedomScore {
  const { monthlyIncome, monthlyExpenses, timeHorizon, riskPreference } = inputs

  // Calculate savings rate (percentage of income saved)
  const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100

  // Score components (0-25 points each)
  const savingsRateScore = Math.min((savingsRate / 20) * 25, 25) // Target: 20% savings rate
  const investmentStrategyScore = riskPreference === 'medium' ? 25 : riskPreference === 'low' ? 20 : 15
  const timeHorizonScore = Math.min((timeHorizon / 10) * 25, 25) // Target: 10+ years
  const riskManagementScore = wealthPathMap.finalWealth >= inputs.savingsGoal ? 25 : 15

  const totalScore = savingsRateScore + investmentStrategyScore + timeHorizonScore + riskManagementScore

  let level: FreedomScore['level']
  if (totalScore >= 80) level = 'expert'
  else if (totalScore >= 60) level = 'advanced'
  else if (totalScore >= 40) level = 'intermediate'
  else level = 'beginner'

  const nextMilestone = getNextMilestone(level, savingsRate, timeHorizon)

  return {
    score: Math.round(totalScore),
    level,
    factors: {
      savingsRate: Math.round(savingsRateScore),
      investmentStrategy: investmentStrategyScore,
      timeHorizon: Math.round(timeHorizonScore),
      riskManagement: riskManagementScore,
    },
    nextMilestone,
  }
}

function getNextMilestone(
  currentLevel: FreedomScore['level'],
  savingsRate: number,
  timeHorizon: number
): string {
  if (currentLevel === 'beginner') {
    return savingsRate < 15 ? 'Save 15% of your income monthly' : 'Plan for at least 5 years of investing'
  }
  if (currentLevel === 'intermediate') {
    return timeHorizon < 7 ? 'Extend your investment horizon to 7+ years' : 'Optimize your risk allocation'
  }
  if (currentLevel === 'advanced') {
    return 'Focus on consistent monthly investments and portfolio rebalancing'
  }
  return 'Maintain your excellent financial habits and consider advanced strategies'
}

function generateInsights(
  inputs: FinancialFreedomInputs,
  wealthPathMap: WealthPathMap,
  freedomScore: FreedomScore
): PersonalizedInsight[] {
  const insights: PersonalizedInsight[] = []

  const { monthlyIncome, monthlyExpenses, savingsGoal, timeHorizon, riskPreference } = inputs
  const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100

  // Savings rate insights
  if (savingsRate < 15) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `You're saving only ${savingsRate.toFixed(1)}% of your income. Aim for at least 20% to reach your goals faster.`,
      impact: 'high',
      actionable: true,
    })
  } else if (savingsRate >= 25) {
    insights.push({
      type: 'achievement',
      title: 'Excellent Savings Rate',
      description: `Great job saving ${savingsRate.toFixed(1)}% of your income! You're on track for financial independence.`,
      impact: 'high',
      actionable: false,
    })
  }

  // Time horizon insights
  if (timeHorizon < 5) {
    insights.push({
      type: 'suggestion',
      title: 'Consider Longer Time Horizon',
      description: 'Extending your investment period by 2-3 years could significantly reduce your monthly savings requirement.',
      impact: 'medium',
      actionable: true,
    })
  }

  // Goal feasibility insights
  const monthlySavingsNeeded = wealthPathMap.monthlySavingsNeeded
  const currentMonthlySavings = monthlyIncome - monthlyExpenses

  if (monthlySavingsNeeded > currentMonthlySavings * 1.5) {
    const additionalNeeded = monthlySavingsNeeded - currentMonthlySavings
    insights.push({
      type: 'suggestion',
      title: 'Increase Monthly Savings',
      description: `To reach your goal, consider increasing savings by ₹${additionalNeeded.toFixed(0)} per month or extending your timeline.`,
      impact: 'high',
      actionable: true,
    })
  }

  // Risk-adjusted insights
  if (riskPreference === 'high' && timeHorizon < 10) {
    insights.push({
      type: 'warning',
      title: 'Risk-Time Mismatch',
      description: 'High-risk investments work best with longer time horizons. Consider moderate risk for better stability.',
      impact: 'medium',
      actionable: true,
    })
  }

  // Passive income insights
  const finalPassiveIncome = wealthPathMap.yearlyTargets[wealthPathMap.yearlyTargets.length - 1]?.passiveIncome || 0
  if (finalPassiveIncome >= monthlyExpenses * 12) {
    insights.push({
      type: 'achievement',
      title: 'Financial Independence Achievable',
      description: `At the end of ${timeHorizon} years, you'll generate ₹${finalPassiveIncome.toFixed(0)} annually in passive income!`,
      impact: 'high',
      actionable: false,
    })
  }

  return insights
}

function generateSummary(
  inputs: FinancialFreedomInputs,
  wealthPathMap: WealthPathMap,
  freedomScore: FreedomScore
): string {
  const { savingsGoal, timeHorizon } = inputs

  return `Your ${timeHorizon}-year financial freedom plan shows a projected wealth of ₹${wealthPathMap.finalWealth.toLocaleString()} with a Freedom Score of ${freedomScore.score}/100 (${freedomScore.level} level). ${wealthPathMap.monthlySavingsNeeded > 0 ? `You'll need to save ₹${wealthPathMap.monthlySavingsNeeded.toFixed(0)} monthly to reach your ₹${savingsGoal.toLocaleString()} goal.` : 'You\'re on track to exceed your savings goal!'}`
}

// Financial Coach Functions
export async function getFinancialCoachResponse(
  userMessage: string,
  plan?: FinancialFreedomPlan,
  conversationHistory?: FinancialCoachMessage[]
): Promise<{
  response: string
  suggestions?: string[]
}> {
  try {
    const response = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        plan,
        conversationHistory,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Financial coach error:', error)
    return {
      response: "I'm here to help you on your financial freedom journey! What specific aspect would you like to discuss - saving strategies, investment planning, or expense tracking?",
      suggestions: ["Review your monthly budget", "Set specific savings goals", "Learn about compound interest"],
    }
  }
}



export function generateCoachWelcomeMessage(plan: FinancialFreedomPlan): FinancialCoachMessage {
  const score = plan.freedomScore.score
  let welcomeMessage = ''

  if (score >= 80) {
    welcomeMessage = `Excellent! Your Freedom Score of ${score} shows you're on an advanced path to financial independence. I'm here to help you maintain and accelerate your progress. What would you like to focus on today?`
  } else if (score >= 60) {
    welcomeMessage = `Great progress! Your Freedom Score of ${score} indicates solid financial habits. Let's work together to push you toward that ${plan.wealthPathMap.finalWealth.toLocaleString()} goal. What's your main concern right now?`
  } else if (score >= 40) {
    welcomeMessage = `Good start! Your Freedom Score of ${score} means you're building a foundation. I can help you optimize your savings and investment strategy. What aspect of financial planning interests you most?`
  } else {
    welcomeMessage = `Welcome to your financial freedom journey! Your current Freedom Score of ${score} gives us a clear starting point. I'm excited to help you improve it. Shall we start with understanding your spending patterns or setting savings goals?`
  }

  return {
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content: welcomeMessage,
    timestamp: new Date().toISOString(),
    suggestions: [
      'Review my spending habits',
      'Optimize my investment strategy',
      'Set up automatic savings',
    ],
  }
}