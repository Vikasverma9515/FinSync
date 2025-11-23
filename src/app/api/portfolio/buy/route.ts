import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const decoded = await jose.jwtVerify(token, secret)
        userId = decoded.payload.userId as string
        console.log('Portfolio Buy: User verified, userId:', userId)
      } catch {
        console.error('Portfolio Buy: Token verification failed')
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      }
    }

    if (!userId) {
      console.error('Portfolio Buy: No userId found')
      return NextResponse.json(
        { error: 'Missing authorization' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    const { symbol, name, quantity, price, date } = await request.json()
    console.log('Portfolio Buy: Received payload', { symbol, name, quantity, price, date })

    if (!symbol || !quantity || !price) {
      console.error('Portfolio Buy: Missing required fields', { symbol, quantity, price })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const totalValue = quantity * price

    const { data: existingHolding, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single()

    console.log('Portfolio Buy: Existing holding check', { existingHolding, fetchError })

    const purchaseDate = date ? new Date(date).toISOString() : new Date().toISOString()

    if (existingHolding) {
      console.log('Portfolio Buy: Updating existing holding')
      const newQuantity = existingHolding.quantity + quantity
      const newAveragePrice =
        (existingHolding.average_price * existingHolding.quantity + totalValue) /
        newQuantity

      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          quantity: newQuantity,
          average_price: newAveragePrice,
          current_price: price,
          purchase_date: purchaseDate,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('symbol', symbol)
      
      if (updateError) {
        console.error('Portfolio Buy: Update error:', updateError)
      } else {
        console.log('Portfolio Buy: Update successful')
      }
    } else {
      console.log('Portfolio Buy: Inserting new holding')
      const { error: insertError } = await supabase.from('portfolios').insert({
        user_id: userId,
        symbol,
        name,
        quantity,
        average_price: price,
        current_price: price,
        purchase_date: purchaseDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      
      if (insertError) {
        console.error('Portfolio Buy: Insert error:', insertError)
      } else {
        console.log('Portfolio Buy: Insert successful')
      }
    }

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'buy',
      symbol,
      quantity,
      price,
      total_value: totalValue,
      created_at: new Date().toISOString(),
    })

    if (txError) {
      console.error('Portfolio Buy: Transaction insert error:', txError)
    } else {
      console.log('Portfolio Buy: Transaction recorded')
    }

    console.log('Portfolio Buy: Complete, sending success response')
    return NextResponse.json({ success: true, message: `Added ${symbol}` })
  } catch (error) {
    console.error('Portfolio Buy: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
