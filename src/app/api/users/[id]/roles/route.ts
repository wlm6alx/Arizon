import { NextRequest } from 'next/server'
import { assignRole, removeRole, hasPermission, isAdmin, getUserWithRoles } from '@/lib/rbac'
import { RoleType } from '@prisma/client'
import { 
  withMiddleware, 
  corsMiddleware, 
  authMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod,
  validateContentType
} from '@/lib/middleware'

async function handleGetUserRoles(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user from middleware
    const currentUser = (request as any).user

    if (!currentUser?.id) {
      return createErrorResponse(
        'User not authenticated',
        401,
        'UNAUTHORIZED'
      )
    }

    const userId = params.id

    // Check permission - users can view their own roles, admins can view any user's roles
    const canManageRoles = await hasPermission(currentUser.id, 'roles', 'manage') || await isAdmin(currentUser.id)
    const isOwnProfile = currentUser.id === userId

    if (!canManageRoles && !isOwnProfile) {
      return createErrorResponse(
        'Insufficient permissions to view user roles',
        403,
        'FORBIDDEN'
      )
    }

    // Get user with roles
    const userWithRoles = await getUserWithRoles(userId)

    if (!userWithRoles) {
      return createErrorResponse(
        'User not found',
        404,
        'USER_NOT_FOUND'
      )
    }

    return createSuccessResponse(
      { 
        userId: userWithRoles.id,
        roles: userWithRoles.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          type: ur.role.type,
          assignedAt: ur.assignedAt,
          expiresAt: ur.expiresAt,
          isActive: ur.isActive && ur.role.isActive
        }))
      },
      'User roles retrieved successfully'
    )
  } catch (error) {
    console.error('Get user roles error:', error)
    return createErrorResponse(
      'Internal server error while retrieving user roles',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleAssignRole(request: NextRequest, { params }: { params: { id: string } }) {
  // Validate content type
  const contentTypeError = validateContentType(request)
  if (contentTypeError) return contentTypeError

  try {
    // Get user from middleware
    const currentUser = (request as any).user

    if (!currentUser?.id) {
      return createErrorResponse(
        'User not authenticated',
        401,
        'UNAUTHORIZED'
      )
    }

    const userId = params.id

    // Check permission - only admins or users with role management permission
    const canManageRoles = await hasPermission(currentUser.id, 'roles', 'manage') || await isAdmin(currentUser.id)

    if (!canManageRoles) {
      return createErrorResponse(
        'Insufficient permissions to assign roles',
        403,
        'FORBIDDEN'
      )
    }

    // Get request body
    const body = await request.json()
    const { roleType, expiresAt } = body

    if (!roleType || !Object.values(RoleType).includes(roleType)) {
      return createErrorResponse(
        'Invalid role type provided',
        400,
        'INVALID_ROLE_TYPE'
      )
    }

    // Parse expiration date if provided
    let expirationDate: Date | undefined
    if (expiresAt) {
      expirationDate = new Date(expiresAt)
      if (isNaN(expirationDate.getTime())) {
        return createErrorResponse(
          'Invalid expiration date format',
          400,
          'INVALID_DATE_FORMAT'
        )
      }
    }

    // Assign role
    const success = await assignRole(userId, roleType, currentUser.id, expirationDate)

    if (!success) {
      return createErrorResponse(
        'Failed to assign role',
        400,
        'ROLE_ASSIGNMENT_FAILED'
      )
    }

    // Get updated user roles
    const userWithRoles = await getUserWithRoles(userId)

    return createSuccessResponse(
      { 
        userId,
        roles: userWithRoles?.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          type: ur.role.type,
          assignedAt: ur.assignedAt,
          expiresAt: ur.expiresAt,
          isActive: ur.isActive && ur.role.isActive
        })) || []
      },
      'Role assigned successfully'
    )
  } catch (error) {
    console.error('Assign role error:', error)
    return createErrorResponse(
      'Internal server error while assigning role',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleRemoveRole(request: NextRequest, { params }: { params: { id: string } }) {
  // Validate content type
  const contentTypeError = validateContentType(request)
  if (contentTypeError) return contentTypeError

  try {
    // Get user from middleware
    const currentUser = (request as any).user

    if (!currentUser?.id) {
      return createErrorResponse(
        'User not authenticated',
        401,
        'UNAUTHORIZED'
      )
    }

    const userId = params.id

    // Check permission - only admins or users with role management permission
    const canManageRoles = await hasPermission(currentUser.id, 'roles', 'manage') || await isAdmin(currentUser.id)

    if (!canManageRoles) {
      return createErrorResponse(
        'Insufficient permissions to remove roles',
        403,
        'FORBIDDEN'
      )
    }

    // Get request body
    const body = await request.json()
    const { roleType } = body

    if (!roleType || !Object.values(RoleType).includes(roleType)) {
      return createErrorResponse(
        'Invalid role type provided',
        400,
        'INVALID_ROLE_TYPE'
      )
    }

    // Remove role
    const success = await removeRole(userId, roleType)

    if (!success) {
      return createErrorResponse(
        'Failed to remove role',
        400,
        'ROLE_REMOVAL_FAILED'
      )
    }

    // Get updated user roles
    const userWithRoles = await getUserWithRoles(userId)

    return createSuccessResponse(
      { 
        userId,
        roles: userWithRoles?.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          type: ur.role.type,
          assignedAt: ur.assignedAt,
          expiresAt: ur.expiresAt,
          isActive: ur.isActive && ur.role.isActive
        })) || []
      },
      'Role removed successfully'
    )
  } catch (error) {
    console.error('Remove role error:', error)
    return createErrorResponse(
      'Internal server error while removing role',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware - wrap to match Next.js signature
export const GET = async (request: NextRequest, context: { params: { id: string } }) => {
  const wrappedHandler = withMiddleware(
    (req: NextRequest) => handleGetUserRoles(req, context),
    corsMiddleware(),
    authMiddleware()
  )
  return wrappedHandler(request)
}

export const POST = async (request: NextRequest, context: { params: { id: string } }) => {
  const wrappedHandler = withMiddleware(
    (req: NextRequest) => handleAssignRole(req, context),
    corsMiddleware(),
    authMiddleware()
  )
  return wrappedHandler(request)
}

export const DELETE = async (request: NextRequest, context: { params: { id: string } }) => {
  const wrappedHandler = withMiddleware(
    (req: NextRequest) => handleRemoveRole(req, context),
    corsMiddleware(),
    authMiddleware()
  )
  return wrappedHandler(request)
}
