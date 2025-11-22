import { NextRequest, NextResponse } from 'next/server'
import { createFriendAPISession } from '@/lib/friend-api-session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch('https://finance-portfolio-management-apis.onrender.com/api/input/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Friend API login error:', response.status, errorData)
      return NextResponse.json(
        { error: 'Failed to login', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Friend API login response:', data)
    
    const userId = data.foundUser?._id
    const token = await createFriendAPISession(body.email, body.password, userId)
    
    const nextRes = NextResponse.json({
      ...data,
      token,
    }, { status: response.status })
    
    const cookie = response.headers.get('set-cookie')
    if (cookie) {
      console.log('Forwarding cookie from Friend API')
      nextRes.headers.set('set-cookie', cookie)
    }
    
    return nextRes
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}