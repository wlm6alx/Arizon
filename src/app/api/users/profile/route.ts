import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserWithRoles, hasPermission } from '@/lib/rbac'
import { 
  withMiddleware, 
  corsMiddleware, 
  authMiddleware,
  validateRequestMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod,
  validateContentType,
  getValidatedData
} from '@/lib/middleware'
import { profileUpdateSchema, type ProfileUpdateData } from '@/lib/validations'

async function handleGetProfile(request: NextRequest) {
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

    // Check permission
    const canReadProfile = await hasPermission(user.id, 'profile', 'read')
    if (!canReadProfile) {
      return createErrorResponse(
        'Insufficient permissions to read profile',
        403,
        'FORBIDDEN'
      )
    }

    // Get user profile with roles
    const userProfile = await getUserWithRoles(user.id)

    if (!userProfile) {
      return createErrorResponse(
        'User profile not found',
        404,
        'USER_NOT_FOUND'
      )
    }

    // Get full user data
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
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
        lastLoginAt: true,
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

    return createSuccessResponse(
      { user: fullUser },
      'Profile retrieved successfully'
    )
  } catch (error) {
    console.error('Get profile error:', error)
    return createErrorResponse(
      'Internal server error while retrieving profile',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleUpdateProfile(request: NextRequest) {
  // Validate content type
  const contentTypeError = validateContentType(request)
  if (contentTypeError) return contentTypeError

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

    // Check permission
    const canUpdateProfile = await hasPermission(user.id, 'profile', 'update')
    if (!canUpdateProfile) {
      return createErrorResponse(
        'Insufficient permissions to update profile',
        403,
        'FORBIDDEN'
      )
    }

    // Get pre-validated body from middleware using central utility
    const body = getValidatedData<ProfileUpdateData>(request)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        username: body.username,
        avatar: body.avatar,
        phone: body.phone,
        bio: body.bio,
        address: body.address,
        city: body.city,
        country: body.country,
        timezone: body.timezone,
        updatedAt: new Date()
      },
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
      'Profile updated successfully'
    )
  } catch (error) {
    console.error('Update profile error:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return createErrorResponse(
        'Username already exists',
        409,
        'USERNAME_EXISTS'
      )
    }

    return createErrorResponse(
      'Internal server error while updating profile',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetProfile,
  corsMiddleware(),
  authMiddleware()
)

export const PUT = withMiddleware(
  handleUpdateProfile,
  corsMiddleware(),
  authMiddleware(),
  validateRequestMiddleware(profileUpdateSchema)
)
