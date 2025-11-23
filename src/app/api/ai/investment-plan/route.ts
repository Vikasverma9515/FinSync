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
      age,
      riskScore,
      investmentAmount,
      timeHorizon,
      investmentGoal,
      currentPortfolio,
    } = body;

    const riskLevel = riskScore <= 3 ? 'low' : riskScore <= 6 ? 'medium' : 'high';
    const monthlyInvestmentCapacity = investmentAmount / timeHorizon / 12;
    
    const prompt = `You are an expert Indian financial advisor with deep knowledge of the Indian stock market, mutual funds, tax implications, and wealth management.

INVESTOR PROFILE:
- Age: ${age} years
- Risk Tolerance Score: ${riskScore}/10 (${riskLevel} risk)
- Initial Investment Amount: ₹${investmentAmount.toLocaleString()}
- Investment Horizon: ${timeHorizon} years
- Investment Goal: ${investmentGoal}
- Current Portfolio Value: ₹${currentPortfolio?.toLocaleString() || '0'}
- Implied Monthly Investment Capacity: ₹${monthlyInvestmentCapacity.toFixed(0).toLocaleString()}

Create a HIGHLY DETAILED, PERSONALIZED investment plan with SPECIFIC numbers and actionable advice:

KEY REQUIREMENTS:
1. Provide SPECIFIC rupee amounts for each asset class allocation
2. Include concrete wealth projections for years 1, 3, 5, and ${timeHorizon}
3. Recommend EXACT monthly/lump-sum investment amounts
4. Give at least 5-7 specific stock recommendations with detailed reasoning
5. Calculate expected returns with specific numbers (not ranges)
6. Provide tax-efficient strategies for their profile
7. Include risk mitigation with specific percentages in debt/FDs

Respond ONLY with valid JSON in this format:
{
  "portfolio": [
    {"symbol": "TCS.NS", "name": "Stock Name", "allocation": 20, "reason": "Specific reason tailored to their ${timeHorizon}-year ${riskLevel} risk profile", "expectedReturn": 14}
  ],
  "assetAllocation": {"stocks": 70, "bonds": 15, "mutualFunds": 0, "fixedDeposits": 15, "others": 0},
  "monthlyInvestmentPlan": {
    "lumpSum": ${investmentAmount},
    "monthlyAmount": ${monthlyInvestmentCapacity.toFixed(0)},
    "expectedWealthIn1Year": "Calculated amount in ₹",
    "expectedWealthIn3Years": "Calculated amount in ₹",
    "expectedWealthIn5Years": "Calculated amount in ₹",
    "expectedWealthInFinalYear": "Amount in ₹ after ${timeHorizon} years"
  },
  "summary": "Detailed 3-4 sentence summary explaining their specific wealth accumulation path with numbers",
  "expectedAnnualReturn": 12,
  "riskLevel": "${riskLevel}",
  "recommendations": [
    "Specific actionable step 1 with numbers/timeline",
    "Specific actionable step 2 with numbers/timeline",
    "At least 5-7 concrete recommendations"
  ],
  "riskMitigation": [
    "Keep ₹X (${Math.floor(monthlyInvestmentCapacity * 6)} - 6 months expenses) in emergency fund",
    "Allocate 15% to fixed deposits for stability",
    "Specific risk mitigation strategies based on their ${riskLevel} profile"
  ],
  "taxStrategy": "Specific tax-saving recommendations for their profile"
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
    
    console.log('Raw investment plan response from Groq:', text.substring(0, 500));

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
      console.error('Failed to extract JSON from investment plan response. Full text:', text);
      throw new Error("No JSON found in response");
    }

    const planData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(planData);
  } catch (error) {
    console.error("Investment Plan Error:", error);
    return NextResponse.json(
      { error: "Failed to generate investment plan" },
      { status: 500 }
    );
  }
}
