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

// Validation schema for creating/updating product categories
const productCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  description: z.string().optional()
})

export type ProductCategoryData = z.infer<typeof productCategorySchema>

async function handleGetProductCategories(request: NextRequest) {
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

    // Check if user has permission to view product categories
    // All authenticated users can view categories for browsing
    const categories = await prisma.productCategory.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return createSuccessResponse(
      categories,
      'Product categories retrieved successfully'
    )
  } catch (error) {
    console.error('Get product categories error:', error)
    return createErrorResponse(
      'Internal server error while retrieving categories',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleCreateProductCategory(request: NextRequest) {
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

    // Check if user has admin or business role
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
        'Insufficient permissions to create product categories',
        403,
        'FORBIDDEN'
      )
    }

    // Get pre-validated body from middleware
    const body = getValidatedData<ProductCategoryData>(request)

    // Check if category name already exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { name: body.name }
    })

    if (existingCategory) {
      return createErrorResponse(
        'A category with this name already exists',
        409,
        'CATEGORY_EXISTS'
      )
    }

    // Create the product category
    const category = await prisma.productCategory.create({
      data: {
        name: body.name,
        description: body.description
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return createSuccessResponse(
      category,
      'Product category created successfully',
      201
    )
  } catch (error) {
    console.error('Create product category error:', error)
    return createErrorResponse(
      'Internal server error while creating category',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetProductCategories,
  corsMiddleware(),
  authMiddleware()
)

export const POST = withMiddleware(
  handleCreateProductCategory,
  corsMiddleware(),
  authMiddleware(),
  validateRequestMiddleware(productCategorySchema)
)
