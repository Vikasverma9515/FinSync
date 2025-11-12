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

    const { symbol, quantity, price } = await request.json()

    if (!symbol || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: holding } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .eq('symbol', symbol)
      .single()

    if (!holding) {
      return NextResponse.json(
        { error: 'Stock not found in portfolio' },
        { status: 404 }
      )
    }

    if (holding.quantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient quantity to sell' },
        { status: 400 }
      )
    }

    const newQuantity = holding.quantity - quantity
    const totalValue = quantity * price

    if (newQuantity === 0) {
      await supabase
        .from('portfolios')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol)
    } else {
      await supabase
        .from('portfolios')
        .update({
          quantity: newQuantity,
          current_price: price,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('symbol', symbol)
    }

    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'sell',
      symbol,
      quantity,
      price,
      total_value: totalValue,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error selling stock:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
