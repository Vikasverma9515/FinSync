import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const decoded = await jose.jwtVerify(token, secret)
        userId = decoded.payload.userId as string
      } catch {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing authorization' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    const { symbol, quantity, average_price, purchase_date } = await request.json()

    if (!symbol || quantity === undefined || average_price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const purchaseDate = purchase_date ? new Date(purchase_date).toISOString() : new Date().toISOString()

    const { data: existingHolding, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single()

    if (fetchError || !existingHolding) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        quantity,
        average_price,
        purchase_date: purchaseDate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('symbol', symbol)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update holding' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Portfolio updated successfully' })
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
