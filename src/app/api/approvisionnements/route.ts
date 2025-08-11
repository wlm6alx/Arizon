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
import { ApprovisionnementStatus } from '@prisma/client'

// Validation schema for creating approvisionnements
const approvisionnementSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  proposedPrice: z.number().min(0, 'Proposed price must be non-negative'),
  deliveryDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid delivery date')
})

// Validation schema for updating approvisionnement status
const updateApprovisionnementSchema = z.object({
  status: z.nativeEnum(ApprovisionnementStatus),
  businessDeveloperId: z.string().optional(),
  stockManagerId: z.string().optional()
})

export type ApprovisionnementData = z.infer<typeof approvisionnementSchema>
export type UpdateApprovisionnementData = z.infer<typeof updateApprovisionnementSchema>

async function handleGetApprovisionnements(request: NextRequest) {
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

    // Get user roles
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

    // Build where clause based on user role
    let where: any = {}

    if (roleTypes.includes('SUPPLIER')) {
      // Suppliers can only see their own approvisionnements
      where.supplierId = user.id
    } else if (roleTypes.includes('BUSINESS')) {
      // Business developers can see pending and approved approvisionnements
      where.status = {
        in: ['PENDING', 'APPROVED']
      }
    } else if (roleTypes.includes('STOCK_MANAGER')) {
      // Stock managers can see approved approvisionnements
      where.status = 'APPROVED'
    } else if (!roleTypes.includes('ADMIN')) {
      // Other roles cannot access approvisionnements
      return createErrorResponse(
        'Insufficient permissions to view approvisionnements',
        403,
        'FORBIDDEN'
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const warehouseId = searchParams.get('warehouseId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Apply additional filters
    if (status && Object.values(ApprovisionnementStatus).includes(status as ApprovisionnementStatus)) {
      where.status = status
    }
    if (warehouseId) {
      where.warehouseId = warehouseId
    }

    // Get approvisionnements with pagination
    const [approvisionnements, total] = await Promise.all([
      prisma.approvisionnement.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              unit: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          businessDeveloper: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          stockManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.approvisionnement.count({ where })
    ])

    return createSuccessResponse(
      {
        approvisionnements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      'Approvisionnements retrieved successfully'
    )
  } catch (error) {
    console.error('Get approvisionnements error:', error)
    return createErrorResponse(
      'Internal server error while retrieving approvisionnements',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleCreateApprovisionnement(request: NextRequest) {
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

    // Check if user has supplier role
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
      ur.role.type === 'SUPPLIER' || ur.role.type === 'ADMIN'
    )

    if (!hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to create approvisionnements',
        403,
        'FORBIDDEN'
      )
    }

    // Get pre-validated body from middleware
    const body = getValidatedData<ApprovisionnementData>(request)

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: body.productId }
    })

    if (!product) {
      return createErrorResponse(
        'Product not found',
        404,
        'PRODUCT_NOT_FOUND'
      )
    }

    // Validate warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: body.warehouseId }
    })

    if (!warehouse) {
      return createErrorResponse(
        'Warehouse not found',
        404,
        'WAREHOUSE_NOT_FOUND'
      )
    }

    // Create the approvisionnement
    const approvisionnement = await prisma.approvisionnement.create({
      data: {
        supplierId: user.id,
        productId: body.productId,
        warehouseId: body.warehouseId,
        quantity: body.quantity,
        proposedPrice: body.proposedPrice,
        deliveryDate: new Date(body.deliveryDate),
        status: 'PENDING'
      },
      include: {
        supplier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            unit: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    })

    return createSuccessResponse(
      approvisionnement,
      'Approvisionnement created successfully',
      201
    )
  } catch (error) {
    console.error('Create approvisionnement error:', error)
    return createErrorResponse(
      'Internal server error while creating approvisionnement',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetApprovisionnements,
  corsMiddleware(),
  authMiddleware()
)

export const POST = withMiddleware(
  handleCreateApprovisionnement,
  corsMiddleware(),
  authMiddleware(),
  validateRequestMiddleware(approvisionnementSchema)
)
