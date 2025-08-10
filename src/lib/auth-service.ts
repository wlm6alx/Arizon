import { prisma } from './prisma'
import { hashPassword, verifyPassword, createSession, deleteSession } from './auth'
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerification } from './email'
import { validateData, registerSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema } from './validations'
import { getDefaultRole, assignRole } from './rbac'
import crypto from 'crypto'

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  username?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      username: string | null
      emailVerified: Date | null
      isActive: boolean
    }
    token: string
  }
  error?: string
}

/**
 * Register a new user
 */
export async function registerUser(userData: RegisterData): Promise<AuthResult> {
  try {
    // Validate input data
    const validation = validateData(registerSchema, userData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.errors.join(', ')
      }
    }

    const { email, password, firstName, lastName, username } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(username ? [{ username }] : [])
        ]
      }
    })

    if (existingUser) {
      return {
        success: false,
        error: existingUser.email === email 
          ? 'An account with this email already exists'
          : 'This username is already taken'
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        emailVerified: true,
        isActive: true,
      }
    })

    // Assign default role to new user
    const defaultRole = await getDefaultRole()
    if (defaultRole) {
      await assignRole(user.id, defaultRole.type)
    }

    // Create session
    const token = await createSession(user.id)

    // Send welcome email with verification
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    // Store verification token (you might want to create a separate table for this)
    // For now, we'll use a simple approach with sessions
    await prisma.session.create({
      data: {
        userId: user.id,
        token: `verify_${verificationToken}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    })

    // Send welcome email
    await sendWelcomeEmail(
      user.email,
      user.firstName || 'User',
      verificationToken
    )

    return {
      success: true,
      data: {
        user,
        token
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: 'Registration failed. Please try again.'
    }
  }
}

/**
 * Login user
 */
export async function loginUser(loginData: LoginData): Promise<AuthResult> {
  try {
    // Validate input data
    const validation = validateData(loginSchema, loginData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.errors.join(', ')
      }
    }

    const { email, password } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        username: true,
        emailVerified: true,
        isActive: true,
      }
    })

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is deactivated. Please contact support.'
      }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    // Create session
    const token = await createSession(user.id)

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Login failed. Please try again.'
    }
  }
}

/**
 * Logout user
 */
export async function logoutUser(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteSession(token)
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: 'Logout failed. Please try again.'
    }
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate email
    const validation = validateData(passwordResetRequestSchema, { email })
    if (!validation.success) {
      return {
        success: false,
        error: validation.errors.join(', ')
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        isActive: true,
      }
    })

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) {
      return { success: true }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Store reset token
    await prisma.session.create({
      data: {
        userId: user.id,
        token: `reset_${resetToken}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      }
    })

    // Send reset email
    await sendPasswordResetEmail(
      user.email,
      user.firstName || 'User',
      resetToken
    )

    return { success: true }
  } catch (error) {
    console.error('Password reset request error:', error)
    return {
      success: false,
      error: 'Password reset request failed. Please try again.'
    }
  }
}

/**
 * Reset password
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validation = validateData(passwordResetSchema, { token, password: newPassword })
    if (!validation.success) {
      return {
        success: false,
        error: validation.errors.join(', ')
      }
    }

    // Find reset token
    const resetSession = await prisma.session.findUnique({
      where: { token: `reset_${token}` },
      include: { user: true }
    })

    if (!resetSession || resetSession.expiresAt < new Date()) {
      // Clean up expired token
      if (resetSession) {
        await prisma.session.delete({ where: { id: resetSession.id } })
      }
      return {
        success: false,
        error: 'Invalid or expired reset token'
      }
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    await prisma.user.update({
      where: { id: resetSession.userId },
      data: { password: hashedPassword }
    })

    // Delete reset token
    await prisma.session.delete({ where: { id: resetSession.id } })

    // Invalidate all other sessions for security
    await prisma.session.deleteMany({
      where: { 
        userId: resetSession.userId,
        token: { not: { startsWith: 'reset_' } }
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: 'Password reset failed. Please try again.'
    }
  }
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find verification token
    const verificationSession = await prisma.session.findUnique({
      where: { token: `verify_${token}` },
      include: { user: true }
    })

    if (!verificationSession || verificationSession.expiresAt < new Date()) {
      // Clean up expired token
      if (verificationSession) {
        await prisma.session.delete({ where: { id: verificationSession.id } })
      }
      return {
        success: false,
        error: 'Invalid or expired verification token'
      }
    }

    // Update user email verification
    await prisma.user.update({
      where: { id: verificationSession.userId },
      data: { emailVerified: new Date() }
    })

    // Delete verification token
    await prisma.session.delete({ where: { id: verificationSession.id } })

    return { success: true }
  } catch (error) {
    console.error('Email verification error:', error)
    return {
      success: false,
      error: 'Email verification failed. Please try again.'
    }
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
        isActive: true,
      }
    })

    if (!user || !user.isActive) {
      return {
        success: false,
        error: 'User not found or account inactive'
      }
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: 'Email is already verified'
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    // Delete old verification tokens
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        token: { startsWith: 'verify_' }
      }
    })

    // Store new verification token
    await prisma.session.create({
      data: {
        userId: user.id,
        token: `verify_${verificationToken}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    })

    // Send verification email
    await sendEmailVerification(
      user.email,
      user.firstName || 'User',
      verificationToken
    )

    return { success: true }
  } catch (error) {
    console.error('Resend verification error:', error)
    return {
      success: false,
      error: 'Failed to resend verification email. Please try again.'
    }
  }
}
