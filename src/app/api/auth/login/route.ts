import { NextRequest } from 'next/server'
import { loginUser } from '@/lib/auth-service'
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
import { loginSchema, type LoginData } from '@/lib/validations'

async function handleLogin(request: NextRequest) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  // Validate content type
  const contentTypeError = validateContentType(request)
  if (contentTypeError) return contentTypeError

  try {
    // Get pre-validated body from middleware using central utility
    const body = getValidatedData<LoginData>(request)

    // Login user
    const result = await loginUser(body)

    if (!result.success) {
      return createErrorResponse(
        result.error || 'Login failed',
        401,
        'LOGIN_FAILED'
      )
    }

    // Return success response with user data and token
    return createSuccessResponse(
      {
        user: result.data?.user,
        token: result.data?.token
      },
      'Login successful'
    )
  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse(
      'Internal server error during login',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export the POST handler with middleware
export const POST = withMiddleware(
  handleLogin,
  corsMiddleware(),
  rateLimitMiddleware(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
  validateRequestMiddleware(loginSchema)
)
