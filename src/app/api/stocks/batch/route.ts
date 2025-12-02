import { NextRequest, NextResponse } from 'next/server'
import { getFriendAPICredentials } from '@/lib/friend-api-session'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')

    if (!symbolsParam) {
        return NextResponse.json(
            { error: 'Symbols parameter is required' },
            { status: 400 }
        )
    }

    const symbols = symbolsParam.split(',').filter(s => s.trim().length > 0)

    if (symbols.length === 0) {
        return NextResponse.json({ data: [] })
    }

    console.log(`Batch fetching ${symbols.length} stocks: ${symbols.join(', ')}`)

    try {
        // 1. Authenticate
        let loginResponse = null
        let cookieHeader = ''
        let token = ''

        // Try to use user credentials first
        const authHeader = request.headers.get('authorization')
        if (authHeader) {
            try {
                const jwtToken = authHeader.replace('Bearer ', '')
                const credentials = await getFriendAPICredentials(jwtToken)

                if (credentials) {
                    console.log('Attempting batch auth with user credentials...')
                    const userLoginResponse = await fetch(
                        'https://finance-portfolio-management-apis.onrender.com/api/input/login',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                            }),
                        }
                    )

                    if (userLoginResponse.ok) {
                        loginResponse = userLoginResponse
                        console.log('Batch auth successful with user credentials')
                    }
                }
            } catch (error) {
                console.error('Failed to use user credentials for batch auth:', error)
            }
        }

        // Fallback to hardcoded credentials if user auth failed
        if (!loginResponse || !loginResponse.ok) {
            console.log('Using fallback credentials for batch auth...')
            let attempts = 0
            const maxAttempts = 3

            while (attempts < maxAttempts) {
                try {
                    attempts++
                    const fallbackResponse = await fetch(
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

                    if (fallbackResponse.ok) {
                        loginResponse = fallbackResponse
                        break
                    } else {
                        console.warn(`Batch auth attempt ${attempts} failed: ${fallbackResponse.status}`)
                        if (attempts < maxAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 1000))
                        }
                    }
                } catch (e) {
                    console.error(`Batch auth attempt ${attempts} error:`, e)
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }
                }
            }
        }

        if (!loginResponse || !loginResponse.ok) {
            throw new Error('All auth attempts failed')
        }

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

        // 2. Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        if (cookieHeader) {
            headers['Cookie'] = cookieHeader
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // 3. Fetch all stocks in parallel
        const results = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const response = await fetch(
                        `https://finance-portfolio-management-apis.onrender.com/api/output/stocks/${symbol}`,
                        {
                            method: 'GET',
                            headers,
                        }
                    )

                    if (!response.ok) {
                        console.warn(`Failed to fetch ${symbol}: ${response.status}`)
                        return null
                    }

                    const data = await response.json()
                    return {
                        symbol: symbol.toUpperCase(),
                        name: data.companyName || data.name || symbol,
                        price: parseFloat(String(data.currentPrice || data.price || 0)),
                        change: parseFloat(String(data.change || 0)),
                        changePercent: parseFloat(String(data.changePercent || data.percentageChange || 0)),
                        timestamp: new Date().toISOString(),
                    }
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error)
                    return null
                }
            })
        )

        const validResults = results.filter(Boolean)
        console.log(`Successfully fetched ${validResults.length}/${symbols.length} stocks`)

        return NextResponse.json(validResults)

    } catch (error) {
        console.error('Batch fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to process batch request' },
            { status: 500 }
        )
    }
}
