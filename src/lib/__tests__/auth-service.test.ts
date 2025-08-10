import {
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendEmailVerification
} from '../auth-service'
import { testPrisma, createTestUser, createTestSession, createTestEmailTemplate, cleanupTestDatabase } from '../test-utils'
import { hashPassword } from '../auth'

// Mock email service
jest.mock('../email', () => ({
  sendWelcomeEmail: jest.fn(() => Promise.resolve(true)),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve(true)),
  sendEmailVerification: jest.fn(() => Promise.resolve(true)),
}))

const emailMocks = require('../email')

describe('Authentication Service Integration Tests', () => {
  beforeEach(async () => {
    await cleanupTestDatabase()
    jest.clearAllMocks()
  })

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe'
      }

      const result = await registerUser(userData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data?.user.email).toBe(userData.email)
        expect(result.data?.user.firstName).toBe(userData.firstName)
        expect(result.data?.user.lastName).toBe(userData.lastName)
        expect(result.data?.user.username).toBe(userData.username)
        expect(result.data?.user.emailVerified).toBeNull() // Not verified yet
        expect(result.data?.user.isActive).toBe(true)
        expect(result.data?.token).toBeDefined()
        expect(typeof result.data?.token).toBe('string')
      }

      // Verify user was created in database
      const dbUser = await testPrisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(dbUser).toBeDefined()
      expect(dbUser?.email).toBe(userData.email)

      // Verify session was created
      const session = await testPrisma.session.findUnique({
        where: { token: result.data?.token }
      })
      expect(session).toBeDefined()

      // Verify welcome email was sent
      expect(emailMocks.sendWelcomeEmail).toHaveBeenCalledWith(
        userData.email,
        userData.firstName,
        expect.any(String) // verification token
      )

      // Verify verification session was created
      const verificationSessions = await testPrisma.session.findMany({
        where: {
          userId: dbUser?.id,
          token: { startsWith: 'verify_' }
        }
      })
      expect(verificationSessions).toHaveLength(1)
    })

    it('should reject registration with existing email', async () => {
      // Create existing user
      await createTestUser({ email: 'existing@example.com' })

      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      }

      const result = await registerUser(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('An account with this email already exists')
    })

    it('should reject registration with existing username', async () => {
      // Create existing user
      await createTestUser({ username: 'existinguser' })

      const userData = {
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        username: 'existinguser'
      }

      const result = await registerUser(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('This username is already taken')
    })

    it('should reject registration with invalid data', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'weak',
        firstName: '',
        lastName: 'Doe'
      }

      const result = await registerUser(userData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid email address')
    })

    it('should register user without username', async () => {
      const userData = {
        email: 'noUsername@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      }

      const result = await registerUser(userData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data?.user.username).toBeNull()
      }
    })
  })

  describe('User Login', () => {
    it('should login user with correct credentials', async () => {
      const hashedPassword = await hashPassword('Password123')
      const user = await createTestUser({
        email: 'user@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe'
      })

      const loginData = {
        email: 'user@example.com',
        password: 'Password123'
      }

      const result = await loginUser(loginData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data?.user.email).toBe(user.email)
        expect(result.data?.user.firstName).toBe(user.firstName)
        expect(result.data?.user.lastName).toBe(user.lastName)
        expect(result.data?.token).toBeDefined()
        expect(typeof result.data?.token).toBe('string')
        // Password should not be in response
        expect((result.data?.user as any).password).toBeUndefined()
      }

      // Verify session was created
      const session = await testPrisma.session.findUnique({
        where: { token: result.data?.token }
      })
      expect(session).toBeDefined()
      expect(session?.userId).toBe(user.id)
    })

    it('should reject login with incorrect email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      }

      const result = await loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email or password')
    })

    it('should reject login with incorrect password', async () => {
      const hashedPassword = await hashPassword('Password123')
      await createTestUser({
        email: 'user@example.com',
        password: hashedPassword
      })

      const loginData = {
        email: 'user@example.com',
        password: 'WrongPassword'
      }

      const result = await loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email or password')
    })

    it('should reject login for inactive user', async () => {
      const hashedPassword = await hashPassword('Password123')
      await createTestUser({
        email: 'inactive@example.com',
        password: hashedPassword,
        isActive: false
      })

      const loginData = {
        email: 'inactive@example.com',
        password: 'Password123'
      }

      const result = await loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Account is deactivated. Please contact support.')
    })

    it('should reject login with invalid data', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'Password123'
      }

      const result = await loginUser(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid email address')
    })
  })

  describe('User Logout', () => {
    it('should logout user successfully', async () => {
      const user = await createTestUser()
      const session = await createTestSession(user.id)

      const result = await logoutUser(session.token)

      expect(result.success).toBe(true)

      // Verify session was deleted
      const deletedSession = await testPrisma.session.findUnique({
        where: { id: session.id }
      })
      expect(deletedSession).toBeNull()
    })

    it('should handle logout with non-existent token gracefully', async () => {
      const result = await logoutUser('non-existent-token')

      expect(result.success).toBe(true) // Should not fail
    })
  })

  describe('Password Reset', () => {
    it('should request password reset successfully', async () => {
      const user = await createTestUser({
        email: 'user@example.com',
        firstName: 'John'
      })

      const result = await requestPasswordReset('user@example.com')

      expect(result.success).toBe(true)

      // Verify reset token session was created
      const resetSessions = await testPrisma.session.findMany({
        where: {
          userId: user.id,
          token: { startsWith: 'reset_' }
        }
      })
      expect(resetSessions).toHaveLength(1)
      expect(resetSessions[0].expiresAt.getTime()).toBeGreaterThan(Date.now())

      // Verify reset email was sent
      expect(emailMocks.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        'John',
        expect.any(String) // reset token
      )
    })

    it('should handle password reset for non-existent user gracefully', async () => {
      const result = await requestPasswordReset('nonexistent@example.com')

      // Should return success to prevent email enumeration
      expect(result.success).toBe(true)

      // Should not send email
      expect(emailMocks.sendPasswordResetEmail).not.toHaveBeenCalled()
    })

    it('should handle password reset for inactive user gracefully', async () => {
      await createTestUser({
        email: 'inactive@example.com',
        isActive: false
      })

      const result = await requestPasswordReset('inactive@example.com')

      // Should return success to prevent email enumeration
      expect(result.success).toBe(true)

      // Should not send email
      expect(emailMocks.sendPasswordResetEmail).not.toHaveBeenCalled()
    })

    it('should reset password with valid token', async () => {
      const user = await createTestUser()
      
      // Create reset token session
      const resetToken = 'valid-reset-token'
      await testPrisma.session.create({
        data: {
          userId: user.id,
          token: `reset_${resetToken}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
        }
      })

      // Create a regular session that should be invalidated
      const regularSession = await createTestSession(user.id)

      const result = await resetPassword(resetToken, 'NewPassword123')

      expect(result.success).toBe(true)

      // Verify password was updated (by trying to login with new password)
      const loginResult = await loginUser({
        email: user.email,
        password: 'NewPassword123'
      })
      expect(loginResult.success).toBe(true)

      // Verify reset token was deleted
      const deletedResetSession = await testPrisma.session.findUnique({
        where: { token: `reset_${resetToken}` }
      })
      expect(deletedResetSession).toBeNull()

      // Verify other sessions were invalidated
      const deletedRegularSession = await testPrisma.session.findUnique({
        where: { id: regularSession.id }
      })
      expect(deletedRegularSession).toBeNull()
    })

    it('should reject password reset with invalid token', async () => {
      const result = await resetPassword('invalid-token', 'NewPassword123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid or expired reset token')
    })

    it('should reject password reset with expired token', async () => {
      const user = await createTestUser()
      
      // Create expired reset token session
      const resetToken = 'expired-reset-token'
      const expiredSession = await testPrisma.session.create({
        data: {
          userId: user.id,
          token: `reset_${resetToken}`,
          expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      })

      const result = await resetPassword(resetToken, 'NewPassword123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid or expired reset token')

      // Verify expired token was cleaned up
      const deletedSession = await testPrisma.session.findUnique({
        where: { id: expiredSession.id }
      })
      expect(deletedSession).toBeNull()
    })

    it('should reject password reset with weak password', async () => {
      const user = await createTestUser()
      
      const resetToken = 'valid-reset-token'
      await testPrisma.session.create({
        data: {
          userId: user.id,
          token: `reset_${resetToken}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        }
      })

      const result = await resetPassword(resetToken, 'weak')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Password must be at least 8 characters')
    })
  })

  describe('Email Verification', () => {
    it('should verify email with valid token', async () => {
      const user = await createTestUser({
        emailVerified: null // Not verified
      })
      
      const verificationToken = 'valid-verification-token'
      await testPrisma.session.create({
        data: {
          userId: user.id,
          token: `verify_${verificationToken}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      })

      const result = await verifyEmail(verificationToken)

      expect(result.success).toBe(true)

      // Verify user email was marked as verified
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: user.id }
      })
      expect(updatedUser?.emailVerified).toBeInstanceOf(Date)

      // Verify verification token was deleted
      const deletedSession = await testPrisma.session.findUnique({
        where: { token: `verify_${verificationToken}` }
      })
      expect(deletedSession).toBeNull()
    })

    it('should reject email verification with invalid token', async () => {
      const result = await verifyEmail('invalid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid or expired verification token')
    })

    it('should reject email verification with expired token', async () => {
      const user = await createTestUser()
      
      const verificationToken = 'expired-verification-token'
      const expiredSession = await testPrisma.session.create({
        data: {
          userId: user.id,
          token: `verify_${verificationToken}`,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
        }
      })

      const result = await verifyEmail(verificationToken)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid or expired verification token')

      // Verify expired token was cleaned up
      const deletedSession = await testPrisma.session.findUnique({
        where: { id: expiredSession.id }
      })
      expect(deletedSession).toBeNull()
    })

    it('should resend email verification', async () => {
      const user = await createTestUser({
        email: 'unverified@example.com',
        firstName: 'John',
        emailVerified: null
      })

      const result = await resendEmailVerification('unverified@example.com')

      expect(result.success).toBe(true)

      // Verify new verification token was created
      const verificationSessions = await testPrisma.session.findMany({
        where: {
          userId: user.id,
          token: { startsWith: 'verify_' }
        }
      })
      expect(verificationSessions).toHaveLength(1)

      // Verify verification email was sent
      expect(emailMocks.sendEmailVerification).toHaveBeenCalledWith(
        'unverified@example.com',
        'John',
        expect.any(String)
      )
    })

    it('should reject resend verification for non-existent user', async () => {
      const result = await resendEmailVerification('nonexistent@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found or account inactive')
    })

    it('should reject resend verification for already verified user', async () => {
      const user = await createTestUser({
        email: 'verified@example.com',
        emailVerified: new Date()
      })

      const result = await resendEmailVerification('verified@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email is already verified')
    })

    it('should reject resend verification for inactive user', async () => {
      await createTestUser({
        email: 'inactive@example.com',
        emailVerified: null,
        isActive: false
      })

      const result = await resendEmailVerification('inactive@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found or account inactive')
    })

    it('should replace old verification tokens when resending', async () => {
      const user = await createTestUser({
        email: 'user@example.com',
        firstName: 'John',
        emailVerified: null
      })

      // Create old verification token
      const oldToken = await testPrisma.session.create({
        data: {
          userId: user.id,
          token: 'verify_old-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })

      const result = await resendEmailVerification('user@example.com')

      expect(result.success).toBe(true)

      // Verify old token was deleted
      const deletedOldToken = await testPrisma.session.findUnique({
        where: { id: oldToken.id }
      })
      expect(deletedOldToken).toBeNull()

      // Verify new token was created
      const verificationSessions = await testPrisma.session.findMany({
        where: {
          userId: user.id,
          token: { startsWith: 'verify_' }
        }
      })
      expect(verificationSessions).toHaveLength(1)
      expect(verificationSessions[0].id).not.toBe(oldToken.id)
    })
  })
})
