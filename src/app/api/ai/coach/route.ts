import { NextRequest, NextResponse } from 'next/server'
import { finSyncAI } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { message, plan, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build context from plan and conversation history
    let context = ''

    if (plan) {
      context += `User's Financial Plan:
- Freedom Score: ${plan.freedomScore.score}/100 (${plan.freedomScore.level})
- Time Horizon: ${plan.wealthPathMap.totalYears} years
- Target Wealth: ₹${plan.wealthPathMap.finalWealth.toLocaleString()}
- Monthly Savings Needed: ₹${plan.wealthPathMap.monthlySavingsNeeded.toFixed(0)}

Recent Insights: ${plan.insights.slice(0, 2).map((i: any) => i.title + ': ' + i.description).join('; ')}
`
    }

    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3)
      context += '\nRecent conversation:\n'
      recentMessages.forEach((msg: any) => {
        context += `${msg.role === 'user' ? 'User' : 'Maya'}: ${msg.content}\n`
      })
    }

    const prompt = `You are Maya, a knowledgeable and encouraging Financial Freedom Coach at FinSync. Help users on their journey to financial independence.

${context}

User's question: "${message}"

Respond as Maya:
- Be encouraging and supportive
- Give specific, actionable advice
- Reference their financial plan when relevant
- Keep responses conversational but informative
- Suggest 1-3 specific next steps when appropriate
- If they mention spending habits, gently suggest alternatives
- Always remind that you're not a certified financial advisor

Keep response under 100 words. End with 1-2 specific suggestions if applicable.`

    const response = await finSyncAI.callAIAPI(prompt, 150)

    // Extract suggestions from response if any
    const suggestions = extractSuggestions(response)

    return NextResponse.json({
      response: response.replace(/\*\*.*?\*\*/g, '').trim(), // Remove any markdown
      suggestions,
    })
  } catch (error) {
    console.error('Financial coach API error:', error)
    return NextResponse.json(
      {
        response: "I'm here to help you on your financial freedom journey! What specific aspect would you like to discuss - saving strategies, investment planning, or expense tracking?",
        suggestions: ["Review your monthly budget", "Set specific savings goals", "Learn about compound interest"]
      },
      { status: 500 }
    )
  }
}

function extractSuggestions(response: string): string[] {
  // Look for common suggestion patterns
  const suggestionPatterns = [
    /suggest.*?:?\s*(.+?)(?:\n|$)/gi,
    /try.*?:?\s*(.+?)(?:\n|$)/gi,
    /consider.*?:?\s*(.+?)(?:\n|$)/gi,
    /(\d+\.\s*.+?)(?:\n|$)/g,
  ]

  const suggestions: string[] = []

  for (const pattern of suggestionPatterns) {
    let match
    while ((match = pattern.exec(response)) !== null) {
      const suggestion = match[1].trim()
      if (suggestion.length > 10 && suggestion.length < 100) {
        suggestions.push(suggestion)
      }
    }
  }

  return suggestions.slice(0, 3) // Limit to 3 suggestions
}