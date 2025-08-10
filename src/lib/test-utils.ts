import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import crypto from 'crypto'

// Create a separate Prisma client for testing
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL?.replace('arizon', 'arizon_test') || 'postgresql://postgres:admin@localhost:5432/arizon_test'
    }
  }
})

/**
 * Setup test database
 */
export async function setupTestDatabase() {
  try {
    // Create test database if it doesn't exist
    execSync('createdb arizon_test -U postgres -h localhost', { stdio: 'ignore' })
  } catch (error) {
    // Database might already exist, which is fine
  }

  // Run migrations
  try {
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL?.replace('arizon', 'arizon_test')
      },
      stdio: 'ignore'
    })
  } catch (error) {
    console.warn('Migration failed, trying to push schema:', error)
    try {
      execSync('npx prisma db push', {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL?.replace('arizon', 'arizon_test')
        },
        stdio: 'ignore'
      })
    } catch (pushError) {
      console.error('Failed to setup test database:', pushError)
    }
  }
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase() {
  // Clean all tables in reverse dependency order
  await testPrisma.postTag.deleteMany()
  await testPrisma.postCategory.deleteMany()
  await testPrisma.emailLog.deleteMany()
  await testPrisma.emailTemplate.deleteMany()
  await testPrisma.post.deleteMany()
  await testPrisma.tag.deleteMany()
  await testPrisma.category.deleteMany()
  await testPrisma.session.deleteMany()
  await testPrisma.user.deleteMany()
}

/**
 * Create test user
 */
export async function createTestUser(overrides: Partial<{
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  emailVerified: Date | null
  isActive: boolean
}> = {}) {
  const defaultUser = {
    email: `test-${crypto.randomBytes(4).toString('hex')}@example.com`,
    username: `testuser${crypto.randomBytes(4).toString('hex')}`,
    firstName: 'Test',
    lastName: 'User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6UP9Dh/Ey2', // hashed "password123"
    emailVerified: new Date(),
    isActive: true,
    ...overrides
  }

  return await testPrisma.user.create({
    data: defaultUser
  })
}

/**
 * Create test session
 */
export async function createTestSession(userId: string, overrides: Partial<{
  token: string
  expiresAt: Date
}> = {}) {
  const defaultSession = {
    userId,
    token: `test-token-${crypto.randomBytes(16).toString('hex')}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    ...overrides
  }

  return await testPrisma.session.create({
    data: defaultSession
  })
}

/**
 * Create test email template
 */
export async function createTestEmailTemplate(overrides: Partial<{
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: Record<string, string | number | boolean | null>
}> = {}) {
  const defaultTemplate = {
    name: `test-template-${crypto.randomBytes(4).toString('hex')}`,
    subject: 'Test Email Subject',
    htmlContent: '<h1>Test Email</h1><p>Hello {{name}}!</p>',
    textContent: 'Test Email\nHello {{name}}!',
    variables: { name: 'string' },
    ...overrides
  }

  return await testPrisma.emailTemplate.create({
    data: defaultTemplate
  })
}

/**
 * Wait for a promise with timeout
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

/**
 * Mock email transporter for testing
 */
export const mockEmailTransporter = {
  sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
  verify: jest.fn(() => Promise.resolve(true)),
}

// Global test setup and teardown
beforeAll(async () => {
  await setupTestDatabase()
})

afterEach(async () => {
  await cleanupTestDatabase()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})
