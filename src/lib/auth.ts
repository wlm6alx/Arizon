import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export type ExpiresIn =
  | `${number}Hrs`

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as ExpiresIn || '3Hrs' // change this later

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Create a session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken({ userId, email: '' }) // Email will be populated from user data
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<{ id: string; userId: string; email: string } | null> {
  try {
    // Check if session exists in database and is not expired
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } })
      }
      return null
    }

    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    return {
      id: session.userId,
      userId: session.userId,
      email: session.user.email,
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { token },
    })
  } catch (error) {
    // Session might not exist, which is fine
    console.error('Error deleting session:', error)
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
  }
}
