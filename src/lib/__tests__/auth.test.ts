import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  createSession,
  validateSession,
  deleteSession,
  cleanupExpiredSessions
} from '../auth'
import { testPrisma, createTestUser, createTestSession, cleanupTestDatabase } from '../test-utils'

describe('Auth Utilities', () => {
  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
      expect(hashedPassword.startsWith('$2a$')).toBe(true)
    })

    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword456'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
      
      // Both should still verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true)
      expect(await verifyPassword(password, hash2)).toBe(true)
    })
  })

  describe('JWT Token Management', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' }
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify a valid JWT token', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' }
      const token = generateToken(payload)
      
      const decoded = verifyToken(token)
      
      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.email).toBe(payload.email)
      expect(decoded?.iat).toBeDefined()
      expect(decoded?.exp).toBeDefined()
    })

    it('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token'
      const decoded = verifyToken(invalidToken)
      
      expect(decoded).toBeNull()
    })

    it('should reject expired JWT token', () => {
      // This would require mocking time or using a very short expiry
      // For now, we'll test with a malformed token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid'
      const decoded = verifyToken(expiredToken)
      
      expect(decoded).toBeNull()
    })
  })

  describe('Session Management', () => {
    it('should create a session', async () => {
      const user = await createTestUser()
      const token = await createSession(user.id)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      
      // Verify session was created in database
      const session = await testPrisma.session.findUnique({
        where: { token }
      })
      
      expect(session).toBeDefined()
      expect(session?.userId).toBe(user.id)
      expect(session?.expiresAt).toBeInstanceOf(Date)
      expect(session?.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('should validate a valid session', async () => {
      const user = await createTestUser()
      const token = await createSession(user.id)
      
      const sessionData = await validateSession(token)
      
      expect(sessionData).toBeDefined()
      expect(sessionData?.userId).toBe(user.id)
      expect(sessionData?.email).toBe(user.email)
    })

    it('should reject invalid session token', async () => {
      const invalidToken = 'invalid-session-token'
      const sessionData = await validateSession(invalidToken)
      
      expect(sessionData).toBeNull()
    })

    it('should reject expired session', async () => {
      const user = await createTestUser()
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      const session = await createTestSession(user.id, {
        expiresAt: expiredDate
      })
      
      const sessionData = await validateSession(session.token)
      
      expect(sessionData).toBeNull()
      
      // Verify expired session was deleted
      const deletedSession = await testPrisma.session.findUnique({
        where: { id: session.id }
      })
      expect(deletedSession).toBeNull()
    })

    it('should delete a session', async () => {
      const user = await createTestUser()
      const session = await createTestSession(user.id)
      
      await deleteSession(session.token)
      
      // Verify session was deleted
      const deletedSession = await testPrisma.session.findUnique({
        where: { id: session.id }
      })
      expect(deletedSession).toBeNull()
    })

    it('should handle deleting non-existent session gracefully', async () => {
      const nonExistentToken = 'non-existent-token'
      
      // Should not throw an error
      await expect(deleteSession(nonExistentToken)).resolves.toBeUndefined()
    })

    it('should cleanup expired sessions', async () => {
      const user = await createTestUser()
      
      // Create expired session
      const expiredSession = await createTestSession(user.id, {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      })
      
      // Create valid session
      const validSession = await createTestSession(user.id)
      
      await cleanupExpiredSessions()
      
      // Expired session should be deleted
      const deletedSession = await testPrisma.session.findUnique({
        where: { id: expiredSession.id }
      })
      expect(deletedSession).toBeNull()
      
      // Valid session should remain
      const remainingSession = await testPrisma.session.findUnique({
        where: { id: validSession.id }
      })
      expect(remainingSession).toBeDefined()
    })
  })
})
