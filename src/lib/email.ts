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
export async function sendEmailVerification(
  userEmail: string,
  userName: string,
  verificationToken: string
): Promise<boolean> {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

  return await sendEmail({
    to: userEmail,
    subject: '', // Will be overridden by template
    templateName: 'email-verification',
    templateVariables: {
      userName,
      verificationLink,
      appName: 'Arizon',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@arizon.com',
    },
  })
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
