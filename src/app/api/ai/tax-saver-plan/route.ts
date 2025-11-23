import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { calculateTaxOldRegime, DEDUCTION_LIMITS, getTaxBreakdown } from '@/lib/taxCalculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      annualIncome,
      employmentType,
      investments80C,
      healthInsurance80D,
      homeLoanInterest,
      rentPaid,
      age,
      hasParents,
      city,
      investmentPreference,
    } = body

    console.log('Tax Saver API - Received request:', { annualIncome, employmentType, age })

    // Validate inputs
    if (!annualIncome || annualIncome <= 0) {
      return NextResponse.json(
        { error: 'Invalid annual income' },
        { status: 400 }
      )
    }

    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set')
      return NextResponse.json(
        { error: 'API configuration error - GROQ_API_KEY not found' },
        { status: 500 }
      )
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })

    // Calculate current tax (with existing deductions)
    const currentTax = calculateTaxOldRegime(annualIncome, {
      section80C: investments80C || 0,
      section80D: healthInsurance80D || 0,
      homeLoanInterest: homeLoanInterest || 0,
      standardDeduction: employmentType === 'salaried' ? DEDUCTION_LIMITS.STANDARD_DEDUCTION : 0,
    })

    console.log('Calculated current tax:', currentTax)

    // Calculate remaining deduction limits
    const remaining80C = Math.max(0, DEDUCTION_LIMITS['80C'] - (investments80C || 0))
    const remaining80D = Math.max(0, (age >= 60 ? DEDUCTION_LIMITS['80D_SENIOR'] : DEDUCTION_LIMITS['80D']) - (healthInsurance80D || 0))
    const remaining80DParents = hasParents ? DEDUCTION_LIMITS['80D_PARENTS'] : 0

    const prompt = `You are an expert Indian tax consultant helping a user optimize their tax savings legally.

USER PROFILE:
- Annual Income: ₹${annualIncome.toLocaleString()}
- Employment Type: ${employmentType}
- Age: ${age} years
- Current 80C Investments: ₹${investments80C?.toLocaleString() || 0}
- Current 80D Health Insurance: ₹${healthInsurance80D?.toLocaleString() || 0}
- Home Loan Interest: ₹${homeLoanInterest?.toLocaleString() || 0}
- Rent Paid (Monthly): ₹${rentPaid?.toLocaleString() || 0}
- Has Parents: ${hasParents ? 'Yes' : 'No'}
- City: ${city}
- Investment Preference: ${investmentPreference}

REMAINING DEDUCTION OPPORTUNITIES:
- 80C Remaining: ₹${remaining80C.toLocaleString()} (out of ₹1,50,000 limit)
- 80D Remaining (Self): ₹${remaining80D.toLocaleString()}
- 80D Available (Parents): ₹${remaining80DParents.toLocaleString()}
- 80CCD(1B) NPS: ₹50,000 (additional over 80C)

CURRENT TAX LIABILITY: ₹${Math.round(currentTax).toLocaleString()}

CREATE A COMPREHENSIVE TAX OPTIMIZATION PLAN:

1. Identify ALL remaining deduction opportunities
2. Recommend specific investments based on their preference (${investmentPreference})
3. Calculate exact tax savings for each recommendation
4. Create a month-by-month action plan for the next financial year
5. Provide practical, actionable advice

Respond ONLY with valid JSON in this EXACT format:
{
  "optimizedTax": number (calculated after all recommended deductions),
  "totalSavings": number (current tax - optimized tax),
  "deductions": [
    {
      "section": "80C" | "80D" | "80CCD(1B)" | "HRA" | "Home Loan",
      "utilized": number (current amount),
      "remaining": number (available to invest),
      "limit": number (maximum limit),
      "recommendations": ["Specific recommendation 1", "Specific recommendation 2"]
    }
  ],
  "recommendations": [
    {
      "title": "Specific investment/deduction name",
      "description": "Why this is recommended for them",
      "amount": number (recommended amount to invest),
      "taxSaving": number (exact tax saved),
      "category": "80C" | "80D" | "80CCD(1B)" | "HRA" | "Other"
    }
  ],
  "monthlyPlan": [
    {
      "month": "April 2024",
      "action": "Specific action to take",
      "amount": number (if applicable)
    }
  ],
  "summary": "2-3 sentences explaining the overall strategy and total savings"
}

IMPORTANT:
- All amounts should be realistic and based on their actual income
- Recommendations should be specific (e.g., "Invest in ELSS mutual funds" not just "80C")
- Tax savings should be accurately calculated
- Monthly plan should cover the entire financial year (April to March)
- Consider their investment preference (safe/balanced/growth)`

    console.log('Calling Groq API...')

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const aiResponse = response.choices[0]?.message?.content || ''
    console.log('AI Response received, length:', aiResponse.length)

    // Parse JSON from response
    let jsonText = aiResponse
    const codeBlockMatch = aiResponse.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', aiResponse.substring(0, 200))
      throw new Error('No JSON found in AI response')
    }

    const planData = JSON.parse(jsonMatch[0])

    // Add current tax and tax breakdown
    planData.currentTax = Math.round(currentTax)
    planData.taxBreakdown = getTaxBreakdown(annualIncome, 'old')
    planData.status = 'ok'

    console.log('Tax plan generated successfully')

    return NextResponse.json(planData)
  } catch (error) {
    console.error('Tax Saver Plan API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Failed to generate tax optimization plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
