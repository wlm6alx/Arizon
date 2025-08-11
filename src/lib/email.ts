import nodemailer from 'nodemailer'
import { prisma } from './prisma'
import { EmailStatus } from '@prisma/client'

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
}

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  templateName?: string
  templateVariables?: Record<string, string | number | boolean | null>
}

export interface EmailTemplate {
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables?: Record<string, string | number | boolean | null>
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const emailId = await logEmailAttempt(options)
  
  try {
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || EMAIL_CONFIG.auth.user,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }

    // If template is specified, load and process it
    if (options.templateName) {
      const processedTemplate = await processEmailTemplate(
        options.templateName,
        options.templateVariables || {}
      )
      mailOptions.html = processedTemplate.html
      mailOptions.text = processedTemplate.text
      mailOptions.subject = processedTemplate.subject
    }

    const info = await transporter.sendMail(mailOptions)
    
    // Update email log as sent
    await updateEmailLog(emailId, EmailStatus.SENT, null, new Date())
    
    console.log('Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    
    // Update email log as failed
    await updateEmailLog(emailId, EmailStatus.FAILED, error instanceof Error ? error.message : 'Unknown error')
    
    return false
  }
}

/**
 * Process email template with variables
 */
async function processEmailTemplate(
  templateName: string,
  variables: Record<string, string | number | boolean | null>
): Promise<{ html: string; text: string; subject: string }> {
  const template = await prisma.emailTemplate.findUnique({
    where: { name: templateName },
  })

  if (!template) {
    throw new Error(`Email template '${templateName}' not found`)
  }

  // Simple template variable replacement
  let html = template.htmlContent
  let text = template.textContent || ''
  let subject = template.subject

  // Replace variables in format {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    html = html.replace(placeholder, String(value))
    text = text.replace(placeholder, String(value))
    subject = subject.replace(placeholder, String(value))
  })

  return { html, text, subject }
}

/**
 * Log email attempt
 */
async function logEmailAttempt(options: EmailOptions): Promise<string> {
  const emailLog = await prisma.emailLog.create({
    data: {
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      from: options.from || process.env.SMTP_FROM || EMAIL_CONFIG.auth.user,
      subject: options.subject,
      templateId: options.templateName || null,
      status: EmailStatus.PENDING,
    },
  })

  return emailLog.id
}

/**
 * Update email log status
 */
async function updateEmailLog(
  emailId: string,
  status: EmailStatus,
  error?: string | null,
  sentAt?: Date
): Promise<void> {
  await prisma.emailLog.update({
    where: { id: emailId },
    data: {
      status,
      error,
      sentAt,
    },
  })
}

/**
 * Create or update email template
 */
export async function createEmailTemplate(template: EmailTemplate): Promise<void> {
  await prisma.emailTemplate.upsert({
    where: { name: template.name },
    update: {
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables,
    },
    create: {
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables,
    },
  })
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  verificationToken?: string
): Promise<boolean> {
  const verificationLink = verificationToken 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    : null

  return await sendEmail({
    to: userEmail,
    subject: '', // Will be overridden by template
    templateName: 'welcome',
    templateVariables: {
      userName,
      verificationLink,
      appName: 'Arizon',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@arizon.com',
    },
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string
): Promise<boolean> {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  return await sendEmail({
    to: userEmail,
    subject: '', // Will be overridden by template
    templateName: 'password-reset',
    templateVariables: {
      userName,
      resetLink,
      appName: 'Arizon',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@arizon.com',
    },
  })
}

/**
 * Send email verification
 */
/**
 * Send simple 6-digit verification code email (no templates needed)
 */
export async function sendVerificationCodeEmail(
  userEmail: string,
  userName: string,
  verificationCode: string
): Promise<boolean> {
  const subject = 'Verify Your Email - Arizon'
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for signing up with Arizon! Please use the verification code below to verify your email address:</p>
      
      <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${verificationCode}</h1>
      </div>
      
      <p><strong>This code will expire in 15 minutes.</strong></p>
      <p>If you didn't request this verification, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px; text-align: center;">
        This is an automated message from Arizon. Please do not reply to this email.
      </p>
    </div>
  `
  
  const textContent = `
Hello ${userName},

Thank you for signing up with Arizon! Please use the verification code below to verify your email address:

Verification Code: ${verificationCode}

This code will expire in 15 minutes.

If you didn't request this verification, please ignore this email.

---
This is an automated message from Arizon.
  `

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@arizon.com',
      to: userEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    }

    // Log email attempt
    const emailLogId = await logEmailAttempt({
      to: userEmail,
      from: mailOptions.from,
      subject: subject,
    })

    // Send email using existing transporter
    await transporter.sendMail(mailOptions)
    
    // Update log as successful
    await updateEmailLog(emailLogId, EmailStatus.SENT, null, new Date())
    
    return true
  } catch (error) {
    console.error('Failed to send verification code email:', error)
    
    // Update log as failed if we have the log ID
    try {
      const emailLogId = await logEmailAttempt({
        to: userEmail,
        from: process.env.SMTP_FROM || 'noreply@arizon.com',
        subject: subject,
      })
      await updateEmailLog(emailLogId, EmailStatus.FAILED, error instanceof Error ? error.message : 'Unknown error')
    } catch (logError) {
      console.error('Failed to log email error:', logError)
    }
    
    return false
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('Email configuration is valid')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}
