import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission, isAdmin, getUserWithRoles } from '@/lib/rbac'
import { 
  withMiddleware, 
  corsMiddleware, 
  authMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod,
  validateContentType
} from '@/lib/middleware'

async function handleGetUser(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check permission - users can view their own profile, admins can view any user
    const canReadUsers = await hasPermission(currentUser.id, 'users', 'read') || await isAdmin(currentUser.id)
    const isOwnProfile = currentUser.id === userId

    if (!canReadUsers && !isOwnProfile) {
      return createErrorResponse(
        'Insufficient permissions to view this user',
        403,
        'FORBIDDEN'
      )
    }

    // Get user with roles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: isOwnProfile || canReadUsers ? true : false,
        bio: true,
        address: isOwnProfile || canReadUsers ? true : false,
        city: isOwnProfile || canReadUsers ? true : false,
        country: isOwnProfile || canReadUsers ? true : false,
        timezone: isOwnProfile || canReadUsers ? true : false,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: canReadUsers ? true : false,
        userRoles: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          select: {
            id: true,
            assignedAt: true,
            expiresAt: true,
            assignedBy: canReadUsers ? true : false,
            role: {
              select: {
                id: true,
                name: true,
                type: true,
                description: true,
                color: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return createErrorResponse(
        'User not found',
        404,
        'USER_NOT_FOUND'
      )
    }

    return createSuccessResponse(
      { user },
      'User retrieved successfully'
    )
  } catch (error) {
    console.error('Get user error:', error)
    return createErrorResponse(
      'Internal server error while retrieving user',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleUpdateUser(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check permission - users can update their own profile, admins can update any user
    const canUpdateUsers = await hasPermission(currentUser.id, 'users', 'update') || await isAdmin(currentUser.id)
    const isOwnProfile = currentUser.id === userId

    if (!canUpdateUsers && !isOwnProfile) {
      return createErrorResponse(
        'Insufficient permissions to update this user',
        403,
        'FORBIDDEN'
      )
    }

    // Get request body
    const body = await request.json()

    // Prepare update data - restrict what regular users can update
    const updateData: any = {}

    if (isOwnProfile || canUpdateUsers) {
      if (body.firstName !== undefined) updateData.firstName = body.firstName
      if (body.lastName !== undefined) updateData.lastName = body.lastName
      if (body.username !== undefined) updateData.username = body.username
      if (body.avatar !== undefined) updateData.avatar = body.avatar
      if (body.bio !== undefined) updateData.bio = body.bio
    }

    if (isOwnProfile || canUpdateUsers) {
      if (body.phone !== undefined) updateData.phone = body.phone
      if (body.address !== undefined) updateData.address = body.address
      if (body.city !== undefined) updateData.city = body.city
      if (body.country !== undefined) updateData.country = body.country
      if (body.timezone !== undefined) updateData.timezone = body.timezone
    }

    // Only admins can update these fields
    if (canUpdateUsers && !isOwnProfile) {
      if (body.isActive !== undefined) updateData.isActive = body.isActive
      if (body.emailVerified !== undefined) updateData.emailVerified = body.emailVerified ? new Date() : null
    }

    updateData.updatedAt = new Date()

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        bio: true,
        address: true,
        city: true,
        country: true,
        timezone: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    return createSuccessResponse(
      { user: updatedUser },
      'User updated successfully'
    )
  } catch (error) {
    console.error('Update user error:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return createErrorResponse(
        'Username or email already exists',
        409,
        'CONFLICT'
      )
    }

    return createErrorResponse(
      'Internal server error while updating user',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleDeleteUser(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check permission - only admins can delete users
    const canDeleteUsers = await hasPermission(currentUser.id, 'users', 'delete') || await isAdmin(currentUser.id)

    if (!canDeleteUsers) {
      return createErrorResponse(
        'Insufficient permissions to delete users',
        403,
        'FORBIDDEN'
      )
    }

    // Prevent self-deletion
    if (currentUser.id === userId) {
      return createErrorResponse(
        'Cannot delete your own account',
        400,
        'SELF_DELETE_NOT_ALLOWED'
      )
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userToDelete) {
      return createErrorResponse(
        'User not found',
        404,
        'USER_NOT_FOUND'
      )
    }

    // Soft delete - deactivate user instead of hard delete
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    // Also deactivate all user roles
    await prisma.userRole.updateMany({
      where: { userId },
      data: { isActive: false }
    })

    return createSuccessResponse(
      null,
      'User deactivated successfully'
    )
  } catch (error) {
    console.error('Delete user error:', error)
    return createErrorResponse(
      'Internal server error while deleting user',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware - wrap to match Next.js signature
export const GET = async (request: NextRequest, context: { params: { id: string } }) => {
  const wrappedHandler = withMiddleware(
    (req: NextRequest) => handleGetUser(req, context),
    corsMiddleware(),
    authMiddleware()
  )
  return wrappedHandler(request)
}

export const PUT = async (request: NextRequest, context: { params: { id: string } }) => {
  const wrappedHandler = withMiddleware(
    (req: NextRequest) => handleUpdateUser(req, context),
    corsMiddleware(),
    authMiddleware()
  )
  return wrappedHandler(request)
}

export const DELETE = async (request: NextRequest, context: { params: { id: string } }) => {
  const wrappedHandler = withMiddleware(
    (req: NextRequest) => handleDeleteUser(req, context),
    corsMiddleware(),
    authMiddleware()
  )
  return wrappedHandler(request)
}
