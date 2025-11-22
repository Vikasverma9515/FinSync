export interface UserProfile {
  id: string
  email: string
  full_name: string
  age: number
  risk_score: number
  investment_horizon: number
  financial_goal: number
  financial_condition: number
  annual_income: number
  total_net_worth: number
  dependents: number
  investment_knowledge: number
  created_at: string
  updated_at: string
}

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  timestamp: string
}

export interface Portfolio {
  id: string
  user_id: string
  symbol: string
  name: string
  quantity: number
  average_price: number
  current_price: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'buy' | 'sell'
  symbol: string
  quantity: number
  price: number
  total_value: number
  created_at: string
}

export interface InvestmentPlan {
  id: string
  user_id: string
  recommended_stocks: Array<{
    symbol: string
    name: string
    allocation_percentage: number
    reason: string
  }>
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

// Investment Planning Types
export interface InvestmentQuestionnaireData {
  planType: 'growth_accelerator' | 'balanced_wealth_builder' | 'conservative_income_generator'
  experienceLevel: string
  preferredSectors: string[]
  investmentHorizon: string
  riskComfort: string
  monthlyCommitment: string
  financialGoals: string[]
}

export interface InvestmentPlanStep {
  step_number: number
  title: string
  description: string
  actions: string[]
  timeline: string
  expected_outcome: string
}

export interface InvestmentPlanOutput {
  plan_name: string
  plan_type: string
  description: string
  risk_level: 'low' | 'medium' | 'high'
  expected_return: string
  recommended_stocks: Array<{
    symbol: string
    name: string
    allocation: number
    sector: string
    reasoning: string
  }>
  steps: InvestmentPlanStep[]
  summary: string
  status: 'ok' | 'warning' | 'error'
  reason?: string
}

// Financial Freedom Planner Types
export interface FinancialFreedomInputs {
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoal: number
  timeHorizon: number // in years
  riskPreference: 'low' | 'medium' | 'high'
  currentSavings: number
  expectedReturnRate?: number // optional, defaults based on risk
}

export interface YearlyTarget {
  year: number
  targetSavings: number
  investmentAllocation: {
    stocks: number
    bonds: number
    cash: number
    other: number
  }
  passiveIncome: number
  totalWealth: number
}

export interface WealthPathMap {
  yearlyTargets: YearlyTarget[]
  totalYears: number
  finalWealth: number
  monthlySavingsNeeded: number
}

export interface FreedomScore {
  score: number // 0-100
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  factors: {
    savingsRate: number
    investmentStrategy: number
    timeHorizon: number
    riskManagement: number
  }
  nextMilestone: string
}

export interface PersonalizedInsight {
  type: 'warning' | 'suggestion' | 'achievement' | 'opportunity'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
}

export interface FinancialFreedomPlan {
  wealthPathMap: WealthPathMap
  freedomScore: FreedomScore
  insights: PersonalizedInsight[]
  summary: string
  createdAt: string
}

export interface FinancialCoachMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestions?: string[]
}
