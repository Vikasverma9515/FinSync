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
          console.log('Predict request with credentials')
        }
      } catch (error) {
        console.error('Failed to get credentials:', error)
      }
    } else {
      console.warn('Predict request WITHOUT auth token')
    }

    const { searchParams } = new URL(request.url)
    const userProfile: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      userProfile[key] = value
    })

    console.log('Predict API received user profile:', userProfile)

    const queryParams = new URLSearchParams()
    Object.entries(userProfile).forEach(([key, value]) => {
      queryParams.append(key, String(value))
    })

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

          console.log('Re-authenticated with Friend API for predict')
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }
          if (credentials.cookies) {
            headers['Cookie'] = credentials.cookies
          }
          
          const response = await fetch(
            `https://finance-portfolio-management-apis.onrender.com/api/output/predict?${queryParams.toString()}`,
            {
              method: 'GET',
              headers,
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            console.log('Friend API predict response:', data)
            const nextRes = NextResponse.json(data, { status: response.status })
            const cookie = response.headers.get('set-cookie')
            if (cookie) {
              nextRes.headers.set('set-cookie', cookie)
            }
            return nextRes
          }
        }
      } catch (error) {
        console.error('Error fetching predict with auth:', error)
      }
    }

    const response = await fetch(
      `https://finance-portfolio-management-apis.onrender.com/api/output/predict?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('External API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch predict data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Predict API response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching predict data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
