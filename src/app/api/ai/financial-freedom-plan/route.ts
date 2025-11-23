import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");

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

    const prompt = `You are a financial advisor. Create a detailed financial freedom plan based on these inputs:
- Monthly Income: ₹${monthlyIncome}
- Monthly Expenses: ₹${monthlyExpenses}
- Savings Goal: ₹${savingsGoal}
- Time Horizon: ${timeHorizon} years
- Risk Preference: ${riskPreference}
- Current Savings: ₹${currentSavings}

Please provide:
1. A yearly wealth accumulation plan (show targets for each year)
2. Monthly savings needed
3. Investment allocation recommendations based on risk preference
4. Key insights and recommendations
5. Potential challenges and solutions

Format the response as JSON with these fields:
{
  "yearlyTargets": [{"year": number, "targetSavings": number, "passiveIncome": number}],
  "monthlySavingsNeeded": number,
  "investmentAllocation": {"stocks": number, "bonds": number, "cash": number, "other": number},
  "insights": [{"type": "achievement|warning|suggestion", "title": string, "description": string, "impact": "high|medium|low"}],
  "summary": string,
  "recommendations": [string]
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
    console.error("Financial Freedom Plan Error:", error);
    return NextResponse.json(
      { error: "Failed to generate financial freedom plan" },
      { status: 500 }
    );
  }
}
