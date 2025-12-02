import { NextRequest, NextResponse } from 'next/server'
import { getFriendAPICredentials, updateSessionCookies } from '@/lib/friend-api-session'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response

      // If it's a 5xx error, we might want to retry. 4xx usually shouldn't be retried unless it's 429.
      if (response.status < 500 && response.status !== 429) {
        return response
      }

      console.warn(`Attempt ${i + 1} failed with status ${response.status}. Retrying in ${delay}ms...`)
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed with error: ${error}. Retrying in ${delay}ms...`)
    }

    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }

  throw new Error(`Failed to fetch after ${retries} attempts`)
}

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
        console.log('Attempting to login with credentials for predict...')
        // Try to login first to get fresh cookies
        const loginResponse = await fetchWithRetry(
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
          },
          3,
          2000
        )

        if (loginResponse.ok) {
          // Get fresh cookies from the login response
          const freshCookies = loginResponse.headers.get('set-cookie')
          console.log('Login successful, got fresh cookies')

          if (freshCookies && userId) {
            await updateSessionCookies(userId, freshCookies)
          }

          // Use the fresh cookies for the prediction request
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }

          // Use the fresh cookies from login response
          if (freshCookies) {
            headers['Cookie'] = freshCookies.split(';')[0] // Use the first cookie
          }

          console.log('Making predict request with fresh cookies')
          const response = await fetchWithRetry(
            `https://finance-portfolio-management-apis.onrender.com/api/output/predict?${queryParams.toString()}`,
            {
              method: 'GET',
              headers,
            },
            3,
            2000
          )

          if (response.ok) {
            const data = await response.json()
            console.log('Predict response successful with auth:', data)
            const nextRes = NextResponse.json(data, { status: response.status })
            const cookie = response.headers.get('set-cookie')
            if (cookie) {
              nextRes.headers.set('set-cookie', cookie)
            }
            return nextRes
          } else {
            console.error('Predict request failed even with auth:', response.status)
          }
        } else {
          console.error('Login failed:', loginResponse.status)
        }
      } catch (error) {
        console.error('Error in authenticated predict flow:', error)
      }
    }

    // Fallback: Make direct unauthenticated request with retry logic
    try {
      const response = await fetchWithRetry(
        `https://finance-portfolio-management-apis.onrender.com/api/output/predict?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        3,
        2000
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
      console.error('Final attempt failed:', error)
      return NextResponse.json(
        { error: 'Failed to fetch predict data after retries' },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Error fetching predict data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
