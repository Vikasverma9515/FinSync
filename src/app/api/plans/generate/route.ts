import { generateInvestmentPlan } from '@/lib/investmentPlanner'
import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const plan = generateInvestmentPlan(profile)

    const { error: insertError } = await supabase
      .from('investment_plans')
      .upsert({
        user_id: user.id,
        recommended_stocks: plan.portfolio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save plan' },
        { status: 500 }
      )
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error generating plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
