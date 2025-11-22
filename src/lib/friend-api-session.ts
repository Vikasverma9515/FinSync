import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

interface SessionData {
  email: string
  password: string
  cookies: string
  timestamp: number
}

const sessions = new Map<string, SessionData>()

export async function createFriendAPISession(email: string, password: string, userId: string, cookies: string = ''): Promise<string> {
  const sessionToken = await new jose.SignJWT({
    email,
    password,
    userId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)

  sessions.set(userId, {
    email,
    password,
    cookies,
    timestamp: Date.now(),
  })

  return sessionToken
}

export async function getFriendAPICredentials(token: string): Promise<{ email: string; password: string; cookies: string } | null> {
  try {
    const decoded = await jose.jwtVerify(token, secret)
    const userId = decoded.payload.userId as string
    
    const session = sessions.get(userId)
    
    return {
      email: session?.email || (decoded.payload.email as string),
      password: session?.password || (decoded.payload.password as string),
      cookies: session?.cookies || '',
    }
  } catch (error) {
    console.error('Failed to get credentials:', error)
    return null
  }
}

export async function updateSessionCookies(userId: string, cookies: string): Promise<void> {
  const session = sessions.get(userId)
  if (session) {
    session.cookies = cookies
    session.timestamp = Date.now()
  }
}
