import { NextRequest } from 'next/server'
import { registerUser } from '@/lib/auth-service'
import { 
  withMiddleware, 
  corsMiddleware, 
  rateLimitMiddleware, 
  validateRequestMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod,
  validateContentType
} from '@/lib/middleware'
import { registerSchema } from '@/lib/validations'

async function handleSignup(request: NextRequest) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  // Validate content type
  const contentTypeError = validateContentType(request)
  if (contentTypeError) return contentTypeError

  try {
    // Get request body
    const body = await request.json()

    // Register user
    const result = await registerUser(body)

    if (!result.success) {
      return createErrorResponse(
        result.error || 'Registration failed',
        400,
        'REGISTRATION_FAILED'
      )
    }

    // Return success response with user data and token
    return createSuccessResponse(
      {
        user: result.data?.user,
        token: result.data?.token
      },
      'User registered successfully',
      201
    )
  } catch (error) {
    console.error('Signup error:', error)
    return createErrorResponse(
      'Internal server error during registration',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export the POST handler with middleware
export const POST = withMiddleware(
  handleSignup,
  corsMiddleware(),
  rateLimitMiddleware(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  validateRequestMiddleware(registerSchema)
)
