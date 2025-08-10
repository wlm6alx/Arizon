import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission, isAdmin } from '@/lib/rbac'
import { 
  withMiddleware, 
  corsMiddleware, 
  authMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateMethod
} from '@/lib/middleware'

async function handleGetUsers(request: NextRequest) {
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

    // Check permission - only admins or users with read users permission
    const canReadUsers = await hasPermission(user.id, 'users', 'read') || await isAdmin(user.id)
    if (!canReadUsers) {
      return createErrorResponse(
        'Insufficient permissions to view users',
        403,
        'FORBIDDEN'
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const search = url.searchParams.get('search') || ''
    const role = url.searchParams.get('role') || ''
    const status = url.searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (role) {
      where.userRoles = {
        some: {
          isActive: true,
          role: {
            type: role.toUpperCase()
          }
        }
      }
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
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
                  color: true
                }
              }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return createSuccessResponse(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      'Users retrieved successfully'
    )
  } catch (error) {
    console.error('Get users error:', error)
    return createErrorResponse(
      'Internal server error while retrieving users',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetUsers,
  corsMiddleware(),
  authMiddleware()
)
