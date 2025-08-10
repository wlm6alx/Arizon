// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.JWT_EXPIRES_IN = '1h'
process.env.DATABASE_URL = 'postgresql://postgres:admin@localhost:5432/arizon_test'
process.env.SMTP_HOST = 'smtp.example.com'
process.env.SMTP_PORT = '587'
process.env.SMTP_USER = 'test@example.com'
process.env.SMTP_PASS = 'test-password'
process.env.SMTP_FROM = 'noreply@test.com'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.SUPPORT_EMAIL = 'support@test.com'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific log levels
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
    verify: jest.fn(() => Promise.resolve(true)),
  })),
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
