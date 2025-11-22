import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Creating new user with data:', {
      name: body.name,
      email: body.email,
      portfolio: body.portfolio?.length || 0,
      age: body.Age,
      riskScore: body.RiskScore,
    })

    const response = await fetch('https://finance-portfolio-management-apis.onrender.com/api/input/newUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.text()
      
      try {
        const errorJson = JSON.parse(errorData)
        
        if (errorJson.message && errorJson.message.includes('already exists')) {
          console.log('User already exists in friend API, proceeding with login')
          return NextResponse.json({ success: true, message: 'User already exists' }, { status: 200 })
        }
      } catch {
      }
      
      console.error('Friend API error:', response.status, errorData)
      return NextResponse.json(
        { error: 'Failed to create user', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Friend API new user response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}