import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");

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

    const prompt = `You are an investment advisor. Create a detailed investment plan based on these inputs:
- Age: ${age} years
- Risk Score: ${riskScore}/10
- Investment Amount: ₹${investmentAmount}
- Time Horizon: ${timeHorizon} years
- Investment Goal: ${investmentGoal}
- Current Portfolio Value: ₹${currentPortfolio || 0}

Based on Indian market context, please provide:
1. Asset allocation recommendations (stocks, bonds, mutual funds, fixed deposits, real estate)
2. Specific stock recommendations with allocation percentages
3. Expected return projections
4. Risk assessment and mitigation strategies
5. Diversification recommendations
6. Quarterly rebalancing suggestions

Format the response as JSON with these fields:
{
  "portfolio": [{"symbol": string, "name": string, "allocation": number, "reason": string, "expectedReturn": number}],
  "assetAllocation": {"stocks": number, "bonds": number, "mutualFunds": number, "fixedDeposits": number, "others": number},
  "summary": string,
  "expectedAnnualReturn": number,
  "riskLevel": "low|medium|high",
  "recommendations": [string],
  "riskMitigation": [string]
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
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
