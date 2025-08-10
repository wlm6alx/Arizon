import { NextRequest } from 'next/server'
import { logoutUser } from '@/lib/auth-service'
import { 
  withMiddleware, 
  corsMiddleware, 
  authMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod
} from '@/lib/middleware'

async function handleLogout(request: NextRequest) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    // Get user from middleware (set by authMiddleware)
    const user = (request as any).user

    if (!user?.id) {
      return createErrorResponse(
        'User not authenticated',
        401,
        'UNAUTHORIZED'
      )
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return createErrorResponse(
        'No token provided',
        401,
        'NO_TOKEN'
      )
    }

    // Logout user
    const result = await logoutUser(token)

    if (!result.success) {
      return createErrorResponse(
        result.error || 'Logout failed',
        400,
        'LOGOUT_FAILED'
      )
    }

    // Return success response
    return createSuccessResponse(
      null,
      'Logout successful'
    )
  } catch (error) {
    console.error('Logout error:', error)
    return createErrorResponse(
      'Internal server error during logout',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export the POST handler with middleware
export const POST = withMiddleware(
  handleLogout,
  corsMiddleware(),
  authMiddleware()
)
