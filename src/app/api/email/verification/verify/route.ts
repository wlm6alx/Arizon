import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for verification code
const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Verification code must contain only numbers'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const result = verifyCodeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: result.error.issues.map(issue => issue.message)
        },
        { status: 400 }
      )
    }

    const { email, code } = result.data

    // Find user with matching email
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

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Email is already verified',
          alreadyVerified: true
        },
        { status: 200 }
      )
    }

    // Check if verification code exists
    if (!user.emailVerificationToken) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new verification code.' },
        { status: 400 }
      )
    }

    // Check if verification code has expired
    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new verification code.' },
        { status: 400 }
      )
    }

    // Check if verification code matches
    if (user.emailVerificationToken !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your code and try again.' },
        { status: 400 }
      )
    }

    // Verification successful - update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully!',
        verifiedAt: new Date().toISOString()
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error during email verification' },
      { status: 500 }
    )
  }
}
