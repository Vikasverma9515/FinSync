import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const apiKey = process.env.GROQ_API_KEY

if (!apiKey) {
    console.error('GROQ_API_KEY is not set in environment variables!')
}

const groq = new Groq({
    apiKey: apiKey || ''
})

export async function POST(request: NextRequest) {
    try {
        console.log('=== Chatbot API Called ===')

        const { message, conversationHistory } = await request.json()

        console.log('Received message:', message)

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const systemPrompt = `You are Arjun, a friendly and knowledgeable financial advisor at FinSync. You're having a real conversation with someone who trusts you for financial guidance.

YOUR PERSONALITY:
- Warm, approachable, and genuinely interested in helping
- Speak naturally like a friend who happens to be a finance expert
- Ask follow-up questions to understand their situation better
- Give personalized advice based on what they tell you
- Use relatable examples and simple language
- Be encouraging and supportive, not preachy

YOUR EXPERTISE:
- Indian stock market (NSE, BSE, mutual funds, ETFs)
- Tax planning (Section 80C, 80D, ELSS, NPS)
- Investment strategies (SIP, lump sum, diversification)
- Retirement planning and wealth building
- Portfolio management and risk assessment

FORMATTING RULES (IMPORTANT):
- Use **bold** for important terms, numbers, and key points
- Use bullet points (•) for lists and options
- Use line breaks for better readability
- Structure: Brief intro → Key points → Action steps → Question
- Example format:
  "Great question! As a student, here's what I recommend:
  
  **Start Small:**
  • Open a savings account with **₹500/month**
  • Try a **low-cost index fund** for long-term growth
  • Build an **emergency fund** of ₹10,000 first
  
  **Why this works:** You're building discipline while your money grows. The key is consistency, not amount.
  
  What's your monthly budget for investing?"

CONVERSATION STYLE:
- Start by understanding their situation (age, income, goals, risk appetite)
- Give specific, actionable advice with numbers and examples
- Explain WHY something is good, not just WHAT to do
- Use conversational phrases like "I'd suggest...", "Here's what I recommend...", "Let me explain..."
- Keep responses 100-150 words - detailed enough to be helpful, short enough to be digestible
- End with a thoughtful question or next step

IMPORTANT RULES:
- Always use markdown formatting for clarity
- Bold all numbers, percentages, and financial terms
- Use bullet points for lists of 2+ items
- Add line breaks between sections
- Personalize based on what they share (student, working professional, etc.)
- Give real examples with actual numbers (e.g., "Start with **₹1000/month** in an index fund")
- Be honest about risks and limitations
- If you don't have enough info, ask clarifying questions

Remember: You're not just answering questions - you're building a relationship and helping them achieve their financial goals.`

        console.log('Calling Groq API...')

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            max_tokens: 400,
            top_p: 0.9,
        })

        console.log('Groq API response received')

        const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.'

        // Generate smart follow-up options
        const followUpOptions = generateFollowUpOptions(message, responseText)

        return NextResponse.json({
            response: responseText,
            followUpOptions: followUpOptions
        })
    } catch (error: any) {
        console.error('Groq API error:', error)
        console.error('Error details:', error.message)
        return NextResponse.json(
            {
                error: 'Failed to get AI response',
                details: error.message
            },
            { status: 500 }
        )
    }
}

function generateFollowUpOptions(userMessage: string, aiResponse: string): string[] {
    const lowerMessage = userMessage.toLowerCase()
    const lowerResponse = aiResponse.toLowerCase()

    // Context-aware follow-ups based on conversation
    if (lowerMessage.includes('student') || lowerMessage.includes('college')) {
        return [
            "Best investment for students?",
            "How to start with ₹500?",
            "Part-time income ideas",
            "Build emergency fund"
        ]
    } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
        return [
            "Best savings accounts?",
            "How much to save monthly?",
            "Fixed deposit vs mutual funds",
            "Tax-free savings options"
        ]
    } else if (lowerMessage.includes('tax')) {
        return [
            "80C deductions explained",
            "ELSS vs PPF comparison",
            "How to save ₹50k in tax?",
            "NPS benefits"
        ]
    } else if (lowerMessage.includes('stock') || lowerMessage.includes('share')) {
        return [
            "How to pick good stocks?",
            "Blue chip vs small cap?",
            "When to sell stocks?",
            "Dividend investing tips"
        ]
    } else if (lowerMessage.includes('retire') || lowerMessage.includes('pension')) {
        return [
            "How much for retirement?",
            "NPS vs mutual funds?",
            "Retirement at 50 possible?",
            "Best retirement plans"
        ]
    } else if (lowerResponse.includes('mutual fund') || lowerResponse.includes('sip')) {
        return [
            "Which mutual funds to choose?",
            "SIP amount for beginners?",
            "Index funds vs active funds",
            "How to track SIP returns?"
        ]
    } else {
        return [
            "Tell me more details",
            "What are the risks?",
            "How do I start?",
            "Any alternatives?"
        ]
    }
}
