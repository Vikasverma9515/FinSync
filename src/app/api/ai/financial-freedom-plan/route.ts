import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing");
      return NextResponse.json(
        { error: "Server configuration error: Missing API Key" },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Financial Freedom Plan Request Body:", body);

    const {
      monthlyIncome,
      monthlyExpenses,
      savingsGoal,
      timeHorizon,
      riskPreference,
      currentSavings,
    } = body;

    // Validate inputs
    if (
      typeof monthlyIncome !== 'number' ||
      typeof monthlyExpenses !== 'number' ||
      typeof savingsGoal !== 'number' ||
      typeof timeHorizon !== 'number' ||
      typeof currentSavings !== 'number'
    ) {
      console.error("Invalid input types:", body);
      return NextResponse.json(
        { error: "Invalid input: All financial values must be numbers" },
        { status: 400 }
      );
    }

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

Respond ONLY with valid JSON in this exact format. Do not include any text before or after the JSON.
{
  "yearlyTargets": [
    {
      "year": 1,
      "targetSavings": number,
      "passiveIncome": number,
      "netWorth": number,
      "savingsRate": "percentage string"
    }
    // ... generate an entry for EVERY year from 1 to ${timeHorizon}
  ],
  "monthlySavingsNeeded": number,
  "daysToFinancialFreedom": number,
  "investmentAllocation": {
    "stocks": number,
    "bonds": number,
    "cash": number,
    "other": number
  },
  "investmentBreakdown": {
    "monthlyStocksAmount": number,
    "monthlyBondsAmount": number,
    "monthlyCashAmount": number,
    "monthlyOthersAmount": number
  },
  "insights": [
    {
      "type": "achievement" | "warning" | "suggestion",
      "title": "string",
      "description": "string",
      "impact": "high" | "medium" | "low"
    }
  ],
  "summary": "string",
  "recommendations": ["string", "string", "string", "string", "string"],
  "taxOptimization": "string",
  "lifestyle": "string"
}`;

    console.log("Sending prompt to Groq...");
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5, // Lower temperature for more deterministic JSON
      max_tokens: 4000, // Increased tokens for long yearly arrays
      response_format: { type: "json_object" },
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
  } catch (error: any) {
    console.error("Financial Freedom Plan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate financial freedom plan", details: error.toString() },
      { status: 500 }
    );
  }
}
