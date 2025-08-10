import { NextRequest } from 'next/server'
import { getAllRoles, hasPermission, isAdmin } from '@/lib/rbac'
import { 
  withMiddleware, 
  corsMiddleware, 
  authMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod
} from '@/lib/middleware'

async function handleGetRoles(request: NextRequest) {
  try {
    // Get user from middleware
    const user = (request as any).user

    if (!user?.id) {
      return createErrorResponse(
        'User not authenticated',
        401,
        'UNAUTHORIZED'
      )
    }

    // Check permission - only admins or users with role read permission
    const canReadRoles = await hasPermission(user.id, 'roles', 'read') || await isAdmin(user.id)
    if (!canReadRoles) {
      return createErrorResponse(
        'Insufficient permissions to view roles',
        403,
        'FORBIDDEN'
      )
    }

    // Get all roles with permissions
    const roles = await getAllRoles()

    return createSuccessResponse(
      { roles },
      'Roles retrieved successfully'
    )
  } catch (error) {
    console.error('Get roles error:', error)
    return createErrorResponse(
      'Internal server error while retrieving roles',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetRoles,
  corsMiddleware(),
  authMiddleware()
)
