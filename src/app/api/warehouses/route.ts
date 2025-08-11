import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
import { z } from 'zod'

// Validation schema for creating/updating warehouses
const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(100, 'Warehouse name too long'),
  address: z.string().min(1, 'Address is required')
})

export type WarehouseData = z.infer<typeof warehouseSchema>

async function handleGetWarehouses(request: NextRequest) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['GET'])
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

    // Check user role for warehouse access
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        role: true
      }
    })

    const roleTypes = userRoles.map(ur => ur.role.type)
    
    // Only admin, business, stock_manager, and command_manager can view warehouses
    const hasPermission = roleTypes.some(type => 
      ['ADMIN', 'BUSINESS', 'STOCK_MANAGER', 'COMMAND_MANAGER'].includes(type)
    )

    if (!hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to view warehouses',
        403,
        'FORBIDDEN'
      )
    }

    // Get warehouses with stock and order counts
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: {
            stocks: true,
            orders: true,
            approvisionnements: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return createSuccessResponse(
      warehouses,
      'Warehouses retrieved successfully'
    )
  } catch (error) {
    console.error('Get warehouses error:', error)
    return createErrorResponse(
      'Internal server error while retrieving warehouses',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleCreateWarehouse(request: NextRequest) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  // Validate content type
  const contentTypeError = validateContentType(request)
  if (contentTypeError) return contentTypeError

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

    // Check if user has admin or business role (only they can create warehouses)
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        role: true
      }
    })

    const hasPermission = userRoles.some(ur => 
      ur.role.type === 'ADMIN' || ur.role.type === 'BUSINESS'
    )

    if (!hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to create warehouses',
        403,
        'FORBIDDEN'
      )
    }

    // Get pre-validated body from middleware
    const body = getValidatedData<WarehouseData>(request)

    // Check if warehouse name already exists
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: { name: body.name }
    })

    if (existingWarehouse) {
      return createErrorResponse(
        'A warehouse with this name already exists',
        409,
        'WAREHOUSE_EXISTS'
      )
    }

    // Create the warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        name: body.name,
        address: body.address
      }
    })

    return createSuccessResponse(
      warehouse,
      'Warehouse created successfully',
      201
    )
  } catch (error) {
    console.error('Create warehouse error:', error)
    return createErrorResponse(
      'Internal server error while creating warehouse',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetWarehouses,
  corsMiddleware(),
  authMiddleware()
)

export const POST = withMiddleware(
  handleCreateWarehouse,
  corsMiddleware(),
  authMiddleware(),
  validateRequestMiddleware(warehouseSchema)
)
