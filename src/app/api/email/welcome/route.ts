import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'
import { z } from 'zod'
import crypto from 'crypto'

const sendWelcomeSchema = z.object({
  email: z.string().email('Invalid email format'),
  includeVerification: z.boolean().optional().default(false),
})

/**
 * POST /api/email/welcome
 * Send welcome email to a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = sendWelcomeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, includeVerification } = validation.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let verificationToken: string | undefined

    // Generate verification token if requested and email not verified
    if (includeVerification && !user.emailVerified) {
      verificationToken = crypto.randomBytes(32).toString('hex')
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Update user with verification token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        },
      })
    }

    // Send welcome email
    const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'
    const emailSent = await sendWelcomeEmail(
      user.email,
      userName,
      verificationToken
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Welcome email sent successfully',
      email: user.email,
      includeVerification,
      verificationIncluded: !!verificationToken,
    })

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
