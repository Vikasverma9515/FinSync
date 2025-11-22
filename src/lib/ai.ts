import { UserProfile, Portfolio, InvestmentPlan, InvestmentQuestionnaireData, InvestmentPlanOutput } from '@/types'

interface AIPrediction {
  symbol: string
  currentPrice: number
  predictedPrice: number
  confidence: number
  timeframe: string
  reasoning: string
}

interface AISuggestion {
  type: 'buy' | 'sell' | 'hold'
  symbol: string
  reason: string
  confidence: number
}

interface AIPlan {
  title: string
  description: string
  recommendedStocks: Array<{
    symbol: string
    name: string
    allocation: number
    reasoning: string
  }>
  riskLevel: 'low' | 'medium' | 'high'
  expectedReturn: string
}

export class FinSyncAI {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not found in environment variables')
    }
  }

  async predictStockPrice(symbol: string, currentPrice: number, timeframe: string = '1M'): Promise<AIPrediction> {
    const prompt = `As a financial AI analyst, predict the future price of ${symbol} stock.

Current price: $${currentPrice}
Timeframe: ${timeframe}

Consider:
- Recent market trends
- Company fundamentals
- Economic indicators
- Technical analysis
- Risk factors

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{"predictedPrice": 3500, "confidence": 75, "reasoning": "detailed explanation here"}

Do not include any markdown, asterisks, or additional text. Just the JSON object.`

    const response = await this.callAIAPI(prompt)
    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '')
    const data = JSON.parse(cleanedResponse)

    return {
      symbol,
      currentPrice,
      predictedPrice: data.predictedPrice,
      confidence: data.confidence,
      timeframe,
      reasoning: data.reasoning
    }
  }

  async generateInvestmentPlan(profile: UserProfile, currentPortfolio?: Portfolio[]): Promise<AIPlan> {
    const portfolioInfo = currentPortfolio ?
      `Current portfolio: ${currentPortfolio.map(p => `${p.symbol}: ${p.quantity} shares at avg $${p.average_price}`).join(', ')}` :
      'No current portfolio'

    const prompt = `Create a personalized investment plan for this user:

User Profile:
- Age: ${profile.age}
- Risk Score: ${profile.risk_score}
- Investment Horizon: ${profile.investment_horizon} years
- Annual Income: $${profile.annual_income}
- Total Net Worth: $${profile.total_net_worth}
- Dependents: ${profile.dependents}

${portfolioInfo}

Create a diversified investment plan with 4-6 stocks that matches their risk profile and goals.
Consider Indian market stocks and global opportunities.

Response format:
{
  "title": "Plan name",
  "description": "Brief plan description",
  "recommendedStocks": [
    {
      "symbol": "TCS.NS",
      "name": "Tata Consultancy Services",
      "allocation": 25,
      "reasoning": "Explanation why this stock fits"
    }
  ],
  "riskLevel": "medium",
  "expectedReturn": "12-15% annually"
}`

    const response = await this.callAIAPI(prompt)
    return JSON.parse(response)
  }

  async generatePersonalizedInvestmentPlan(questionnaireData: InvestmentQuestionnaireData, userProfile?: UserProfile): Promise<InvestmentPlanOutput> {
    const planTypeNames = {
      growth_accelerator: 'Growth Accelerator Plan',
      balanced_wealth_builder: 'Balanced Wealth Builder',
      conservative_income_generator: 'Conservative Income Generator'
    }

    const prompt = `Create a personalized investment plan based on this questionnaire data:

Plan Type: ${planTypeNames[questionnaireData.planType]}
Experience Level: ${questionnaireData.experienceLevel}
Preferred Sectors: ${questionnaireData.preferredSectors.join(', ')}
Investment Horizon: ${questionnaireData.investmentHorizon}
Risk Comfort: ${questionnaireData.riskComfort}
Monthly Commitment: ${questionnaireData.monthlyCommitment}
Financial Goals: ${questionnaireData.financialGoals.join(', ')}

${userProfile ? `User Profile:
- Age: ${userProfile.age}
- Risk Score: ${userProfile.risk_score}
- Investment Horizon: ${userProfile.investment_horizon} years
- Annual Income: ₹${userProfile.annual_income}
- Total Net Worth: ₹${userProfile.total_net_worth}` : ''}

Create a comprehensive investment plan with:
1. Plan name and description
2. Risk level (low/medium/high)
3. Expected return range
4. 4-6 recommended stocks with allocations, sectors, and reasoning
5. 5-7 step-by-step implementation steps
6. Summary and status

Response format:
{
  "plan_name": "Plan Name",
  "plan_type": "${questionnaireData.planType}",
  "description": "Brief description",
  "risk_level": "medium",
  "expected_return": "12-15% annually",
  "recommended_stocks": [
    {
      "symbol": "TCS.NS",
      "name": "Tata Consultancy Services",
      "allocation": 25,
      "sector": "Technology",
      "reasoning": "Explanation"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "Step Title",
      "description": "Step description",
      "actions": ["Action 1", "Action 2"],
      "timeline": "1-2 weeks",
      "expected_outcome": "Expected result"
    }
  ],
  "summary": "Overall summary",
  "status": "ok"
}`

    const response = await this.callAIAPI(prompt)
    return JSON.parse(response)
  }

  async getMarketInsights(): Promise<string> {
    const prompt = `Provide current market insights for Indian stock market in a concise, point-wise format.

Return exactly 10 short, punchy points (one sentence each) covering:
1. Major indices performance
2. Top performing sectors
3. Struggling sectors
4. Key economic indicators
5. Market sentiment
6. Investment opportunities
7. Risk factors
8. Global market impact
9. Upcoming catalysts
10. Expert recommendations

Make each point human-readable and actionable. Keep total response under 800 characters.

Format: Just the 10 points, one per line, no numbering or bullets.`

    return await this.callAIAPI(prompt)
  }

  async analyzePortfolio(portfolio: Portfolio[], profile: UserProfile): Promise<{
    analysis: string
    suggestions: AISuggestion[]
    predictions: AIPrediction[]
  }> {
    const portfolioSummary = portfolio.map(p =>
      `${p.symbol}: ${p.quantity} shares at avg $${p.average_price}, current $${p.current_price || p.average_price}`
    ).join('\n')

    const prompt = `Analyze this investment portfolio:

User Profile:
- Age: ${profile.age}
- Risk Score: ${profile.risk_score}
- Investment Horizon: ${profile.investment_horizon} years

Portfolio Holdings:
${portfolioSummary}

Provide:
1. Overall portfolio analysis
2. Specific suggestions (buy/sell/hold) for each holding
3. Price predictions for next 3 months

Response format:
{
  "analysis": "comprehensive analysis",
  "suggestions": [
    {
      "type": "hold",
      "symbol": "TCS.NS",
      "reason": "reason",
      "confidence": 85
    }
  ],
  "predictions": [
    {
      "symbol": "TCS.NS",
      "currentPrice": 3200,
      "predictedPrice": 3500,
      "confidence": 75,
      "timeframe": "3M",
      "reasoning": "detailed reasoning"
    }
  ]
}`

    const response = await this.callAIAPI(prompt)
    return JSON.parse(response)
  }

  async chatWithAI(message: string, context?: {
    profile?: UserProfile
    portfolio?: Portfolio[]
    recentTransactions?: any[]
  }): Promise<string> {
    let contextInfo = ''

    if (context?.profile) {
      contextInfo += `\nUser: Age ${context.profile.age}, Risk Score: ${context.profile.risk_score}, Investment Horizon: ${context.profile.investment_horizon} years`
    }

    if (context?.portfolio && context.portfolio.length > 0) {
      contextInfo += `\nPortfolio: ${context.portfolio.map(p => `${p.symbol} (${p.quantity} shares)`).join(', ')}`
    }

    const prompt = `You are Alex, a friendly financial buddy at FinSync. Talk like a real person - casual, helpful, and natural. Keep responses under 50 words.

${contextInfo}

User: ${message}

Respond naturally. Ask only 1 question max. If giving advice, say "I'm not a financial advisor, but..." Keep it short and friendly!`

    return await this.callAIAPI(prompt, 150)
  }

  async callAIAPI(prompt: string, maxTokens: number = 2000): Promise<string> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'FinSync',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'z-ai/glm-4.5-air:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter API error:', response.status, errorText)
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw new Error('Failed to get AI response')
    }
  }
}

// Export singleton instance
export const finSyncAI = new FinSyncAI()