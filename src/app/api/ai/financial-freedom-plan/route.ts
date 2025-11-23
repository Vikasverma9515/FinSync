import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      monthlyIncome,
      monthlyExpenses,
      savingsGoal,
      timeHorizon,
      riskPreference,
      currentSavings,
    } = body;

    const monthlyExpenses12 = monthlyExpenses * 12;
    const annualIncomeTarget = monthlyIncome * 12;
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const annualSurplus = monthlySurplus * 12;
    const riskAllocation = riskPreference === 'low' ? { stocks: 40, bonds: 40, cash: 20, other: 0 } :
                          riskPreference === 'medium' ? { stocks: 60, bonds: 25, cash: 10, other: 5 } :
                          { stocks: 75, bonds: 15, cash: 5, other: 5 };
    
    const prompt = `You are an expert Indian financial freedom coach and wealth strategist with 15+ years of experience helping people achieve financial independence through disciplined investing and strategic planning.

FINANCIAL PROFILE:
- Monthly Income: ₹${monthlyIncome.toLocaleString()}
- Annual Income: ₹${annualIncomeTarget.toLocaleString()}
- Monthly Expenses: ₹${monthlyExpenses.toLocaleString()}
- Annual Expenses: ₹${monthlyExpenses12.toLocaleString()}
- Monthly Surplus Available: ₹${monthlySurplus.toLocaleString()}
- Annual Surplus Available: ₹${annualSurplus.toLocaleString()}
- Savings Goal (Financial Freedom Target): ₹${savingsGoal.toLocaleString()}
- Time Horizon: ${timeHorizon} years
- Risk Preference: ${riskPreference}
- Current Savings: ₹${currentSavings.toLocaleString()}

Create a COMPREHENSIVE, ACTIONABLE financial freedom plan with SPECIFIC numbers:

KEY REQUIREMENTS:
1. Show YEARLY wealth accumulation targets with specific rupee amounts
2. Calculate exact monthly savings needed to reach ₹${savingsGoal.toLocaleString()} in ${timeHorizon} years
3. Include passive income generation strategies with projected amounts
4. Provide detailed investment allocation with specific percentages
5. Show wealth projections for each year (NOT just final year)
6. Include "days to financial freedom" calculation
7. Provide specific tax optimization strategies
8. Suggest lifestyle optimization tips to increase savings rate

Use this realistic ${riskPreference} risk allocation:
- Stocks: ${riskAllocation.stocks}%
- Bonds: ${riskAllocation.bonds}%
- Cash/FDs: ${riskAllocation.cash}%
- Others: ${riskAllocation.other}%

Respond ONLY with valid JSON in this exact format:
{
  "yearlyTargets": [
    {"year": 1, "targetSavings": ${currentSavings + (annualSurplus * 1)}, "passiveIncome": ${(currentSavings + (annualSurplus * 1)) * 0.07}, "netWorth": ${currentSavings + (annualSurplus * 1) + ((currentSavings + (annualSurplus * 1)) * 0.07)}, "savingsRate": "${Math.round((annualSurplus / annualIncomeTarget) * 100)}%"},
    {"year": 2, "targetSavings": ${currentSavings + (annualSurplus * 2)}, "passiveIncome": ${(currentSavings + (annualSurplus * 2)) * 0.08}, "netWorth": ${currentSavings + (annualSurplus * 2) + ((currentSavings + (annualSurplus * 2)) * 0.08)}, "savingsRate": "${Math.round((annualSurplus / annualIncomeTarget) * 100)}%"},
    "...continue for each year up to ${timeHorizon}"
  ],
  "monthlySavingsNeeded": ${Math.ceil(annualSurplus / 12)},
  "daysToFinancialFreedom": ${Math.ceil((savingsGoal - currentSavings) / (annualSurplus / 365))},
  "investmentAllocation": {"stocks": ${riskAllocation.stocks}, "bonds": ${riskAllocation.bonds}, "cash": ${riskAllocation.cash}, "other": ${riskAllocation.other}},
  "investmentBreakdown": {
    "monthlyStocksAmount": ${Math.ceil((monthlySurplus * riskAllocation.stocks) / 100)},
    "monthlyBondsAmount": ${Math.ceil((monthlySurplus * riskAllocation.bonds) / 100)},
    "monthlyCashAmount": ${Math.ceil((monthlySurplus * riskAllocation.cash) / 100)},
    "monthlyOthersAmount": ${Math.ceil((monthlySurplus * riskAllocation.other) / 100)}
  },
  "insights": [
    {"type": "achievement|warning|suggestion", "title": "Specific insight with numbers", "description": "Detailed explanation", "impact": "high|medium|low"}
  ],
  "summary": "Compelling 4-5 sentence summary showing their exact path to ₹${savingsGoal.toLocaleString()} with specific milestones and monthly amounts",
  "recommendations": [
    "Invest ₹${Math.ceil((monthlySurplus * riskAllocation.stocks) / 100)} monthly in stocks through SIP",
    "Place ₹${Math.ceil((monthlySurplus * riskAllocation.bonds) / 100)} in fixed income instruments",
    "Keep ₹${Math.ceil((monthlySurplus * riskAllocation.cash) / 100)} as emergency fund monthly",
    "At ${riskPreference} risk, expect 8-11% annual returns, reaching ₹${savingsGoal.toLocaleString()} in ${Math.ceil((savingsGoal - currentSavings) / annualSurplus)} years",
    "More specific, actionable recommendations based on their exact situation"
  ],
  "taxOptimization": "Specific tax-saving strategies like ELSS, 80C, 80D based on their income",
  "lifestyle": "Specific tips to increase savings rate without sacrificing quality of life"
}`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content || "";
    
    console.log('Raw financial freedom plan response from Groq:', text.substring(0, 500));

    // Parse JSON from response - handle markdown code blocks
    let jsonText = text;
    
    // Remove markdown code blocks if present
    const codeBlockMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    }
    
    // Try to extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from financial freedom plan response. Full text:', text);
      throw new Error("No JSON found in response");
    }

    const planData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(planData);
  } catch (error) {
    console.error("Financial Freedom Plan Error:", error);
    return NextResponse.json(
      { error: "Failed to generate financial freedom plan" },
      { status: 500 }
    );
  }
}
