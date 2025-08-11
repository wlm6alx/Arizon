import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const sendCustomEmailSchema = z.object({
  to: z.union([
    z.string().email('Invalid email format'),
    z.array(z.string().email('Invalid email format')).min(1, 'At least one recipient required')
  ]),
  subject: z.string().min(1, 'Subject is required'),
  content: z.object({
    html: z.string().optional(),
    text: z.string().optional(),
  }).refine(
    (data) => data.html || data.text,
    { message: 'Either HTML or text content must be provided' }
  ),
  from: z.string().email('Invalid sender email format').optional(),
})

/**
 * POST /api/email/send
 * Send custom email with specified content and destination
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = sendCustomEmailSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { to, subject, content, from } = validation.data

    // Prepare email options
    const emailOptions = {
      to,
      subject,
      html: content.html,
      text: content.text,
      from,
    }

    // Send email
    const emailSent = await sendEmail(emailOptions)

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Email sent successfully',
      recipients: Array.isArray(to) ? to : [to],
      subject,
      from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
    })

  } catch (error) {
    console.error('Error sending custom email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
