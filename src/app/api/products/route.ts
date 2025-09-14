import { NextRequest } from 'next/server'
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

// Validation schema for creating/updating products
const productSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit too long'),
  imageUrl: z.string().url('Invalid image URL').optional()
})

export type ProductData = z.infer<typeof productSchema>

async function handleGetProducts(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const category = searchParams.get('category') // Filter by category name
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (category) {
      // Filter by category name - need to join with ProductCategory table
      where.category = {
        name: {
          contains: category,
          mode: 'insensitive'
        }
      }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              stocks: true,
              orderItems: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return createSuccessResponse(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      'Products retrieved successfully'
    )
  } catch (error) {
    console.error('Get products error:', error)
    return createErrorResponse(
      'Internal server error while retrieving products',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleCreateProduct(request: NextRequest) {
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

    // Check if user has admin, business, or supplier role
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
      ur.role.type === 'ADMIN' || 
      ur.role.type === 'BUSINESS' || 
      ur.role.type === 'SUPPLIER'
    )

    if (!hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to create products',
        403,
        'FORBIDDEN'
      )
    }

    // Get pre-validated body from middleware
    const body = getValidatedData<ProductData>(request)

    // Validate category exists if provided
    if (body.categoryId) {
      const categoryExists = await prisma.productCategory.findUnique({
        where: { id: body.categoryId }
      })

      if (!categoryExists) {
        return createErrorResponse(
          'Product category not found',
          404,
          'CATEGORY_NOT_FOUND'
        )
      }
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        categoryId: body.categoryId,
        name: body.name,
        description: body.description,
        unit: body.unit,
        imageUrl: body.imageUrl
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return createSuccessResponse(
      product,
      'Product created successfully',
      201
    )
  } catch (error) {
    console.error('Create product error:', error)
    return createErrorResponse(
      'Internal server error while creating product',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetProducts,
  corsMiddleware(),
  authMiddleware()
)

export const POST = withMiddleware(
  handleCreateProduct,
  corsMiddleware(),
  authMiddleware(),
  validateRequestMiddleware(productSchema)
)
