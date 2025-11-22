import { NextRequest, NextResponse } from 'next/server'
import { getFriendAPICredentials, updateSessionCookies } from '@/lib/friend-api-session'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let credentials = null
    let userId = null
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        credentials = await getFriendAPICredentials(token)
        const decoded = await jose.jwtVerify(token, secret)
        userId = decoded.payload.userId as string
        if (credentials) {
          console.log('Profit/Loss request with credentials')
        }
      } catch (error) {
        console.error('Failed to get credentials:', error)
      }
    } else {
      console.warn('Profit/Loss request WITHOUT auth token')
    }

    if (credentials) {
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

        if (loginResponse.ok) {
          const setCookie = loginResponse.headers.get('set-cookie')
          if (setCookie && userId) {
            await updateSessionCookies(userId, setCookie)
          }

          console.log('Re-authenticated with Friend API for profit/loss')
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }
          if (credentials.cookies) {
            headers['Cookie'] = credentials.cookies
          }
          
          const response = await fetch(
            'https://finance-portfolio-management-apis.onrender.com/api/output/calculateProfitOrLoss',
            {
              method: 'GET',
              headers,
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            console.log('Friend API profit/loss response:', data)
            
            const formattedData = {
              totalProfit: data.totalProfit || data.totalPnL || data.pnl || 0,
              percentage: data.percentage || data.percentagePnL || data.pnlPercentage || 0,
              rawData: data,
            }
            
            return NextResponse.json(formattedData)
          }
        }
      } catch (error) {
        console.error('Error fetching profit/loss with auth:', error)
      }
    }

    const response = await fetch('https://finance-portfolio-management-apis.onrender.com/api/output/calculateProfitOrLoss', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

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
    
    const formattedData = {
      totalProfit: data.totalProfit || data.totalPnL || data.pnl || 0,
      percentage: data.percentage || data.percentagePnL || data.pnlPercentage || 0,
      rawData: data,
    }
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching profit/loss:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}