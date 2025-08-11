import { createEmailTemplate } from '../lib/email'

/**
 * Seed default email templates
 */
export async function seedEmailTemplates(): Promise<void> {
  console.log('Seeding email templates...')

  // Welcome email template
  await createEmailTemplate({
    name: 'welcome',
    subject: 'Welcome to {{appName}}! 🎉',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to {{appName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to {{appName}}!</h1>
        </div>
        <div class="content">
          <h2>Hi {{userName}}! 👋</h2>
          <p>We're thrilled to have you join our community! Your account has been successfully created and you're ready to get started.</p>
          
          {{#if verificationLink}}
          <p>To complete your registration, please verify your email address:</p>
          <a href="{{verificationLink}}" class="button">Verify Email Address</a>
          <p><small>If the button doesn't work, copy and paste this link into your browser: {{verificationLink}}</small></p>
          {{/if}}
          
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile setup</li>
            <li>Explore our features</li>
            <li>Connect with other users</li>
          </ul>
          
          <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
          
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 {{appName}}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Welcome to {{appName}}!
      
      Hi {{userName}}!
      
      We're thrilled to have you join our community! Your account has been successfully created and you're ready to get started.
      
      {{#if verificationLink}}
      To complete your registration, please verify your email address by visiting: {{verificationLink}}
      {{/if}}
      
      Here's what you can do next:
      - Complete your profile setup
      - Explore our features
      - Connect with other users
      
      If you have any questions, feel free to reach out to our support team at {{supportEmail}}.
      
      Best regards,
      The {{appName}} Team
    `,
    variables: {
      userName: 'string',
      verificationLink: 'string (optional)',
      appName: 'string',
      supportEmail: 'string'
    }
  })

  // Password reset email template
  await createEmailTemplate({
    name: 'password-reset',
    subject: 'Reset Your {{appName}} Password 🔒',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi {{userName}},</h2>
          <p>We received a request to reset your password for your {{appName}} account.</p>
          
          <p>Click the button below to reset your password:</p>
          <a href="{{resetLink}}" class="button">Reset Password</a>
          
          <p><small>If the button doesn't work, copy and paste this link into your browser: {{resetLink}}</small></p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If you continue to have problems, please contact our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
          
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 {{appName}}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Password Reset Request
      
      Hi {{userName}},
      
      We received a request to reset your password for your {{appName}} account.
      
      Please visit the following link to reset your password: {{resetLink}}
      
      Security Notice:
      - This link will expire in 1 hour for security reasons
      - If you didn't request this reset, please ignore this email
      - Never share this link with anyone
      
      If you continue to have problems, please contact our support team at {{supportEmail}}.
      
      Best regards,
      The {{appName}} Team
    `,
    variables: {
      userName: 'string',
      resetLink: 'string',
      appName: 'string',
      supportEmail: 'string'
    }
  })

  // Email verification template
  await createEmailTemplate({
    name: 'email-verification',
    subject: 'Verify Your {{appName}} Email Address ✉️',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hi {{userName}},</h2>
          <p>Thank you for signing up for {{appName}}! To complete your account setup, please verify your email address.</p>
          
          <p>Click the button below to verify your email:</p>
          <a href="{{verificationLink}}" class="button">Verify Email Address</a>
          
          <p><small>If the button doesn't work, copy and paste this link into your browser: {{verificationLink}}</small></p>
          
          <p>This verification link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with {{appName}}, you can safely ignore this email.</p>
          
          <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
          
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 {{appName}}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Verify Your Email Address
      
      Hi {{userName}},
      
      Thank you for signing up for {{appName}}! To complete your account setup, please verify your email address.
      
      Please visit the following link to verify your email: {{verificationLink}}
      
      This verification link will expire in 24 hours for security reasons.
      
      If you didn't create an account with {{appName}}, you can safely ignore this email.
      
      If you have any questions, feel free to reach out to our support team at {{supportEmail}}.
      
      Best regards,
      The {{appName}} Team
    `,
    variables: {
      userName: 'string',
      verificationLink: 'string',
      appName: 'string',
      supportEmail: 'string'
    }
  })

  console.log('Email templates seeded successfully!')
}

// Run this function to seed templates
if (require.main === module) {
  seedEmailTemplates()
    .then(() => {
      console.log('Template seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error seeding templates:', error)
      process.exit(1)
    })
}
