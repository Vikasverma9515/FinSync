import { getStockQuote } from '@/lib/stocks'
import { NextRequest, NextResponse } from 'next/server'
import { getFriendAPICredentials, updateSessionCookies } from '@/lib/friend-api-session'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400 }
    )
  }

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
          console.log(`Stock quote request with credentials for ${symbol}`)
        }
      } catch (error) {
        console.error('Failed to get credentials:', error)
      }
    } else {
      console.warn(`Stock quote request WITHOUT auth token for ${symbol}`)
    }

    if (credentials) {
      try {
        console.log(`Attempting to login for stock quote: ${symbol}`)
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
          const freshCookies = loginResponse.headers.get('set-cookie')
          console.log(`Login successful for ${symbol}, got fresh cookies`)

          if (freshCookies && userId) {
            await updateSessionCookies(userId, freshCookies)
          }

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }

          // Use fresh cookies from login response
          if (freshCookies) {
            headers['Cookie'] = freshCookies.split(';')[0]
          }

          console.log(`Fetching stock ${symbol} with fresh cookies`)
          const response = await fetch(
            `https://finance-portfolio-management-apis.onrender.com/api/output/stocks/${symbol}`,
            {
              method: 'GET',
              headers,
            }
          )

          if (response.ok) {
            const data = await response.json()
            console.log(`Stock response successful for ${symbol}:`, data)

            const mappedData = {
              symbol: symbol.toUpperCase(),
              name: data.companyName || data.name || symbol,
              price: parseFloat(String(data.currentPrice || data.price || 0)),
              change: parseFloat(String(data.change || 0)),
              changePercent: parseFloat(String(data.changePercent || data.percentageChange || 0)),
              timestamp: new Date().toISOString(),
            }

            console.log(`Mapped stock data for ${symbol}:`, mappedData)
            const nextRes = NextResponse.json(mappedData, { status: response.status })
            const cookie = response.headers.get('set-cookie')
            if (cookie) {
              nextRes.headers.set('set-cookie', cookie)
            }
            return nextRes
          } else {
            console.error(`Stock request failed for ${symbol} even with auth:`, response.status)
          }
        } else {
          console.error(`Login failed for ${symbol}:`, loginResponse.status)
        }
      } catch (error) {
        console.error(`Error fetching stock ${symbol} with auth:`, error)
      }
    }

    // Fallback: Use hardcoded credentials for testing if no user credentials found
    console.log(`Attempting fallback authentication for ${symbol}`)

    let loginResponse = null
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        attempts++
        loginResponse = await fetch(
          'https://finance-portfolio-management-apis.onrender.com/api/input/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: "anshh.pasriccha@gmail.com",
              password: "12345678"
            }),
          }
        )

        if (loginResponse.ok) {
          break
        } else {
          console.warn(`Fallback auth attempt ${attempts} failed: ${loginResponse.status}`)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      } catch (e) {
        console.error(`Fallback auth attempt ${attempts} error:`, e)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    let cookieHeader = ''
    let token = ''

    if (loginResponse && loginResponse.ok) {
      const setCookie = loginResponse.headers.get('set-cookie')
      if (setCookie) {
        cookieHeader = setCookie
      }

      try {
        const loginData = await loginResponse.json()
        if (loginData.token) {
          token = loginData.token
        }
      } catch (e) {
        console.error('Failed to parse login response:', e)
      }
    } else {
      console.warn('Fallback authentication failed after retries')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `https://finance-portfolio-management-apis.onrender.com/api/output/stocks/${symbol}`,
      {
        method: 'GET',
        headers,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch stock ${symbol}: ${response.status}`, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch quote', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`Friend API stock response for ${symbol}:`, data)

    const mappedData = {
      symbol: symbol.toUpperCase(),
      name: data.companyName || data.name || symbol,
      price: parseFloat(String(data.currentPrice || data.price || 0)),
      change: parseFloat(String(data.change || 0)),
      changePercent: parseFloat(String(data.changePercent || data.percentageChange || 0)),
      timestamp: new Date().toISOString(),
    }

    console.log(`Mapped stock data for ${symbol}:`, mappedData)
    const nextRes = NextResponse.json(mappedData, { status: response.status })
    const cookie = response.headers.get('set-cookie')
    if (cookie) {
      nextRes.headers.set('set-cookie', cookie)
    }
    return nextRes
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}
