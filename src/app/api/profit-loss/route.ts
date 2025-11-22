import { NextRequest, NextResponse } from 'next/server'
import { getFriendAPICredentials, updateSessionCookies } from '@/lib/friend-api-session'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  let credentials = null
  let userId = null
  
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '')
      console.log('Verifying token for profit/loss...')
      const decoded = await jose.jwtVerify(token, secret)
      userId = decoded.payload.userId as string
      console.log('Token verified, userId:', userId)
      
      credentials = await getFriendAPICredentials(token)
      if (credentials) {
        console.log('Profit/Loss request with credentials for:', credentials.email)
      } else {
        console.error('Failed to retrieve credentials from token')
        return NextResponse.json(
          { error: 'Failed to retrieve user credentials' },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error('Failed to verify/get credentials:', error)
      return NextResponse.json(
        { error: 'Invalid authentication token', details: String(error) },
        { status: 401 }
      )
    }
  } else {
    console.warn('Profit/Loss request WITHOUT auth token')
    return NextResponse.json(
      { error: 'Missing authorization header' },
      { status: 401 }
    )
  }

  try {
    const loginResponse = await fetch(
      'https://finance-portfolio-management-apis.onrender.com/api/input/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      }
    )

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.error('Failed to login to Friend API:', loginResponse.status, errorText)
      return NextResponse.json(
        { error: 'Failed to authenticate with external API', details: errorText },
        { status: 401 }
      )
    }

    const setCookie = loginResponse.headers.get('set-cookie')
    if (setCookie && userId) {
      await updateSessionCookies(userId, setCookie)
    }

    console.log('Re-authenticated with Friend API for profit/loss')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (setCookie) {
      headers['Cookie'] = setCookie
    } else if (credentials.cookies) {
      headers['Cookie'] = credentials.cookies
    }
    
    const response = await fetch(
      'https://finance-portfolio-management-apis.onrender.com/api/output/calculateProfitOrLoss',
      {
        method: 'GET',
        headers,
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch profit/loss: ${response.status}`, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch profit/loss', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Friend API profit/loss response:', data)
    
    let totalProfit = 0
    let percentage = 0
    let stockData = []
    
    if (data.data && Array.isArray(data.data)) {
      stockData = data.data
      totalProfit = stockData.reduce((sum: number, item: any) => sum + (item.profit || 0), 0)
      const maxAbsProfit = Math.max(...stockData.map((s: any) => Math.abs(s.profit) || 1), 1)
      percentage = stockData.length > 0 && maxAbsProfit > 0 ? (totalProfit / maxAbsProfit) * 100 : 0
    } else {
      totalProfit = data.totalProfit || data.totalPnL || data.pnl || 0
      percentage = data.percentage || data.percentagePnL || data.pnlPercentage || 0
    }
    
    const formattedData = {
      totalProfit,
      percentage,
      data: stockData,
      message: data.message || 'Profit/Loss data retrieved'
    }
    
    console.log('Formatted profit/loss:', formattedData)
    const nextRes = NextResponse.json(formattedData, { status: response.status })
    const cookie = response.headers.get('set-cookie')
    if (cookie) {
      nextRes.headers.set('set-cookie', cookie)
    }
    return nextRes
  } catch (error) {
    console.error('Error fetching profit/loss:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
