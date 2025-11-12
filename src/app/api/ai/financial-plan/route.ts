import { NextRequest, NextResponse } from 'next/server'
import { finSyncAI } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const {
      monthlyIncome,
      monthlyExpenses,
      savingsGoal,
      timeHorizon,
      riskPreference,
      currentSavings
    } = await request.json()

    if (!monthlyIncome || !monthlyExpenses || !savingsGoal || !timeHorizon || !riskPreference || currentSavings === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const returnRate = riskPreference === 'low' ? 6 : riskPreference === 'medium' ? 8 : 10
    const monthlySavings = monthlyIncome - monthlyExpenses

    const prompt = `Generate a financial freedom plan. Return ONLY valid JSON, no markdown or extra text.

User data:
- Monthly income: ₹${monthlyIncome}
- Monthly expenses: ₹${monthlyExpenses}
- Monthly savings: ₹${monthlySavings}
- Savings goal: ₹${savingsGoal}
- Time horizon: ${timeHorizon} years
- Risk preference: ${riskPreference}
- Current savings: ₹${currentSavings}
- Expected return rate: ${returnRate}%

Calculate:
1. Wealth path: yearly projections for ${timeHorizon} years
2. Freedom score: 0-100 based on feasibility
3. 3-4 insights about the plan
4. Brief summary

JSON format:
{
  "wealthPathMap": {
    "totalYears": ${timeHorizon},
    "finalWealth": 0,
    "yearlyTargets": [
      {
        "year": 1,
        "totalWealth": 0,
        "passiveIncome": 0
      }
    ]
  },
  "freedomScore": {
    "score": 0,
    "level": "beginner",
    "nextMilestone": "Save 6 months expenses",
    "factors": {
      "savingsRate": 0,
      "timeHorizon": 0,
      "riskManagement": 0,
      "goalFeasibility": 0
    }
  },
  "insights": [
    {
      "type": "achievement",
      "title": "Good savings rate",
      "description": "You're saving X% of income"
    }
  ],
  "summary": "Brief overview of the plan"
}`

    const aiResponse = await finSyncAI.callAIAPI(prompt, 3000)

    // Log the raw response for debugging
    console.log('OpenRouter API response:', aiResponse)

    // Return the raw AI response - parsing will happen on the frontend
    return NextResponse.json({
      aiResponse: aiResponse,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Financial plan API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate financial plan', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}