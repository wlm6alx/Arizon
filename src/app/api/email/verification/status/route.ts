import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verificationStatusSchema = z.object({
  email: z.string().email('Invalid email format'),
})

/**
 * GET /api/email/verification/status
 * Check email verification status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const validation = verificationStatusSchema.safeParse({ email })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpires: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isVerified = user.emailVerified !== null
    const hasValidToken = user.emailVerificationToken && 
                         user.emailVerificationExpires && 
                         user.emailVerificationExpires > new Date()

    return NextResponse.json({
      email: user.email,
      isVerified,
      hasValidToken,
      verifiedAt: user.emailVerified,
      verificationExpires: user.emailVerificationExpires,
    })

  } catch (error) {
    console.error('Error checking verification status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
