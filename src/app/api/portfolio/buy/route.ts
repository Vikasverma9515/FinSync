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

    const { symbol, name, quantity, price } = await request.json()

    if (!symbol || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const totalValue = quantity * price

    const { data: existingHolding } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .eq('symbol', symbol)
      .single()

    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity
      const newAveragePrice =
        (existingHolding.average_price * existingHolding.quantity + totalValue) /
        newQuantity

      await supabase
        .from('portfolios')
        .update({
          quantity: newQuantity,
          average_price: newAveragePrice,
          current_price: price,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('symbol', symbol)
    } else {
      await supabase.from('portfolios').insert({
        user_id: user.id,
        symbol,
        name,
        quantity,
        average_price: price,
        current_price: price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'buy',
      symbol,
      quantity,
      price,
      total_value: totalValue,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error buying stock:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
