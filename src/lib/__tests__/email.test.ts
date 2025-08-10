import {
  sendEmail,
  createEmailTemplate,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  testEmailConfig
} from '../email'
import { testPrisma, createTestEmailTemplate, cleanupTestDatabase } from '../test-utils'
import { EmailStatus } from '@prisma/client'

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
    verify: jest.fn(() => Promise.resolve(true)),
  })),
}))

const nodemailer = require('nodemailer')

describe('Email Service', () => {
  beforeEach(async () => {
    await cleanupTestDatabase()
    jest.clearAllMocks()
  })

  describe('Email Sending', () => {
    it('should send a basic email successfully', async () => {
      const mockSendMail = jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
        verify: jest.fn(() => Promise.resolve(true)),
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
        text: 'Test text content'
      })

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
        text: 'Test text content'
      })

      // Check email log was created
      const emailLog = await testPrisma.emailLog.findFirst({
        where: { to: 'test@example.com' }
      })
      expect(emailLog).toBeDefined()
      expect(emailLog?.status).toBe(EmailStatus.SENT)
      expect(emailLog?.sentAt).toBeInstanceOf(Date)
    })

    it('should handle email sending failure', async () => {
      const mockSendMail = jest.fn(() => Promise.reject(new Error('SMTP Error')))
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
        verify: jest.fn(() => Promise.resolve(true)),
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      })

      expect(result).toBe(false)

      // Check email log shows failure
      const emailLog = await testPrisma.emailLog.findFirst({
        where: { to: 'test@example.com' }
      })
      expect(emailLog).toBeDefined()
      expect(emailLog?.status).toBe(EmailStatus.FAILED)
      expect(emailLog?.error).toBe('SMTP Error')
      expect(emailLog?.sentAt).toBeNull()
    })

    it('should send email to multiple recipients', async () => {
      const mockSendMail = jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
        verify: jest.fn(() => Promise.resolve(true)),
      })

      const recipients = ['test1@example.com', 'test2@example.com']
      const result = await sendEmail({
        to: recipients,
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      })

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: 'test1@example.com, test2@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: undefined
      })
    })
  })

  describe('Email Templates', () => {
    it('should create an email template', async () => {
      await createEmailTemplate({
        name: 'test-template',
        subject: 'Test Subject {{name}}',
        htmlContent: '<h1>Hello {{name}}!</h1>',
        textContent: 'Hello {{name}}!',
        variables: { name: 'string' }
      })

      const template = await testPrisma.emailTemplate.findUnique({
        where: { name: 'test-template' }
      })

      expect(template).toBeDefined()
      expect(template?.subject).toBe('Test Subject {{name}}')
      expect(template?.htmlContent).toBe('<h1>Hello {{name}}!</h1>')
      expect(template?.textContent).toBe('Hello {{name}}!')
    })

    it('should update existing email template', async () => {
      // Create initial template
      await createTestEmailTemplate({
        name: 'test-template',
        subject: 'Original Subject'
      })

      // Update template
      await createEmailTemplate({
        name: 'test-template',
        subject: 'Updated Subject {{name}}',
        htmlContent: '<h1>Updated content {{name}}!</h1>',
        textContent: 'Updated content {{name}}!',
        variables: { name: 'string' }
      })

      const template = await testPrisma.emailTemplate.findUnique({
        where: { name: 'test-template' }
      })

      expect(template).toBeDefined()
      expect(template?.subject).toBe('Updated Subject {{name}}')
      expect(template?.htmlContent).toBe('<h1>Updated content {{name}}!</h1>')
    })

    it('should send email using template', async () => {
      const mockSendMail = jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
        verify: jest.fn(() => Promise.resolve(true)),
      })

      // Create template
      await createTestEmailTemplate({
        name: 'greeting-template',
        subject: 'Hello {{name}}!',
        htmlContent: '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{appName}}.</p>',
        textContent: 'Welcome {{name}}! Thanks for joining {{appName}}.'
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: '', // Will be overridden by template
        templateName: 'greeting-template',
        templateVariables: {
          name: 'John Doe',
          appName: 'TestApp'
        }
      })

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: 'test@example.com',
        subject: 'Hello John Doe!',
        html: '<h1>Welcome John Doe!</h1><p>Thanks for joining TestApp.</p>',
        text: 'Welcome John Doe! Thanks for joining TestApp.'
      })
    })

    it('should throw error for non-existent template', async () => {
      await expect(
        sendEmail({
          to: 'test@example.com',
          subject: '',
          templateName: 'non-existent-template',
          templateVariables: { name: 'John' }
        })
      ).rejects.toThrow("Email template 'non-existent-template' not found")
    })
  })

  describe('Predefined Email Functions', () => {
    beforeEach(() => {
      const mockSendMail = jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
        verify: jest.fn(() => Promise.resolve(true)),
      })
    })

    it('should send welcome email', async () => {
      // Create welcome template
      await createTestEmailTemplate({
        name: 'welcome',
        subject: 'Welcome to {{appName}}!',
        htmlContent: '<h1>Welcome {{userName}}!</h1>',
        textContent: 'Welcome {{userName}}!'
      })

      const result = await sendWelcomeEmail(
        'user@example.com',
        'John Doe',
        'verification-token-123'
      )

      expect(result).toBe(true)

      // Check email log
      const emailLog = await testPrisma.emailLog.findFirst({
        where: { to: 'user@example.com' }
      })
      expect(emailLog).toBeDefined()
      expect(emailLog?.templateId).toBe('welcome')
    })

    it('should send password reset email', async () => {
      // Create password reset template
      await createTestEmailTemplate({
        name: 'password-reset',
        subject: 'Reset Your Password',
        htmlContent: '<h1>Reset Password</h1><a href="{{resetLink}}">Reset</a>',
        textContent: 'Reset your password: {{resetLink}}'
      })

      const result = await sendPasswordResetEmail(
        'user@example.com',
        'John Doe',
        'reset-token-123'
      )

      expect(result).toBe(true)

      // Check email log
      const emailLog = await testPrisma.emailLog.findFirst({
        where: { to: 'user@example.com' }
      })
      expect(emailLog).toBeDefined()
      expect(emailLog?.templateId).toBe('password-reset')
    })

    it('should send email verification', async () => {
      // Create email verification template
      await createTestEmailTemplate({
        name: 'email-verification',
        subject: 'Verify Your Email',
        htmlContent: '<h1>Verify Email</h1><a href="{{verificationLink}}">Verify</a>',
        textContent: 'Verify your email: {{verificationLink}}'
      })

      const result = await sendEmailVerification(
        'user@example.com',
        'John Doe',
        'verification-token-123'
      )

      expect(result).toBe(true)

      // Check email log
      const emailLog = await testPrisma.emailLog.findFirst({
        where: { to: 'user@example.com' }
      })
      expect(emailLog).toBeDefined()
      expect(emailLog?.templateId).toBe('email-verification')
    })
  })

  describe('Email Configuration', () => {
    it('should test email configuration successfully', async () => {
      const mockVerify = jest.fn(() => Promise.resolve(true))
      nodemailer.createTransport.mockReturnValue({
        verify: mockVerify,
        sendMail: jest.fn()
      })

      const result = await testEmailConfig()

      expect(result).toBe(true)
      expect(mockVerify).toHaveBeenCalled()
    })

    it('should handle email configuration failure', async () => {
      const mockVerify = jest.fn(() => Promise.reject(new Error('Connection failed')))
      nodemailer.createTransport.mockReturnValue({
        verify: mockVerify,
        sendMail: jest.fn()
      })

      const result = await testEmailConfig()

      expect(result).toBe(false)
      expect(mockVerify).toHaveBeenCalled()
    })
  })
})
