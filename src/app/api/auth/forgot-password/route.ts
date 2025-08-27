import { NextRequest } from 'next/server'
import { requestPasswordReset } from '@/lib/auth-service'
import { 
  withMiddleware, 
  corsMiddleware, 
  rateLimitMiddleware, 
  validateRequestMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod,
  validateContentType,
  getValidatedData
} from '@/lib/middleware'
import { passwordResetRequestSchema } from '@/lib/validations'

async function handleForgotPassword(request: NextRequest) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  // Validate content type
  const contentTypeError = validateContentType(request)
  if (contentTypeError) return contentTypeError

  try {
    // Get pre-validated body from middleware using central utility
    const body = getValidatedData<{ email: string }>(request)

    // Request password reset
    const result = await requestPasswordReset(body.email)

    if (!result.success) {
      return createErrorResponse(
        result.error || 'Échec de la demande de réinitialisation',
        400,
        'PASSWORD_RESET_REQUEST_FAILED'
      )
    }

    // Return success response
    return createSuccessResponse(
      { message: 'Email de réinitialisation envoyé' },
      'Demande de réinitialisation traitée avec succès',
      200
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return createErrorResponse(
      'Erreur interne du serveur lors de la demande de réinitialisation',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export the POST handler with middleware
export const POST = withMiddleware(
  handleForgotPassword,
  corsMiddleware(),
  rateLimitMiddleware(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  validateRequestMiddleware(passwordResetRequestSchema)
)
