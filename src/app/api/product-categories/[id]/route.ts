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

// Validation schema for updating product categories
const updateProductCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long').optional(),
  description: z.string().optional()
})

export type UpdateProductCategoryData = z.infer<typeof updateProductCategorySchema>

async function handleGetProductCategory(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
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

    const categoryId = params.id

    // Get the product category
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            unit: true,
            imageUrl: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return createErrorResponse(
        'Product category not found',
        404,
        'CATEGORY_NOT_FOUND'
      )
    }

    return createSuccessResponse(
      category,
      'Product category retrieved successfully'
    )
  } catch (error) {
    console.error('Get product category error:', error)
    return createErrorResponse(
      'Internal server error while retrieving category',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleUpdateProductCategory(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['PUT'])
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
        'Insufficient permissions to update product categories',
        403,
        'FORBIDDEN'
      )
    }

    const categoryId = params.id

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return createErrorResponse(
        'Product category not found',
        404,
        'CATEGORY_NOT_FOUND'
      )
    }

    // Get pre-validated body from middleware
    const body = getValidatedData<UpdateProductCategoryData>(request)

    // Check if new name conflicts with existing category (if name is being updated)
    if (body.name && body.name !== existingCategory.name) {
      const nameConflict = await prisma.productCategory.findUnique({
        where: { name: body.name }
      })

      if (nameConflict) {
        return createErrorResponse(
          'A category with this name already exists',
          409,
          'CATEGORY_EXISTS'
        )
      }
    }

    // Update the product category
    const updatedCategory = await prisma.productCategory.update({
      where: { id: categoryId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description })
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
      updatedCategory,
      'Product category updated successfully'
    )
  } catch (error) {
    console.error('Update product category error:', error)
    return createErrorResponse(
      'Internal server error while updating category',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

async function handleDeleteProductCategory(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  // Validate HTTP method
  const methodError = validateMethod(request, ['DELETE'])
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

    // Check if user has admin role (only admins can delete categories)
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        role: true
      }
    })

    const hasPermission = userRoles.some(ur => ur.role.type === 'ADMIN')

    if (!hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to delete product categories',
        403,
        'FORBIDDEN'
      )
    }

    const categoryId = params.id

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!existingCategory) {
      return createErrorResponse(
        'Product category not found',
        404,
        'CATEGORY_NOT_FOUND'
      )
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return createErrorResponse(
        'Cannot delete category that contains products',
        409,
        'CATEGORY_HAS_PRODUCTS'
      )
    }

    // Delete the product category
    await prisma.productCategory.delete({
      where: { id: categoryId }
    })

    return createSuccessResponse(
      null,
      'Product category deleted successfully'
    )
  } catch (error) {
    console.error('Delete product category error:', error)
    return createErrorResponse(
      'Internal server error while deleting category',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  handleGetProductCategory,
  corsMiddleware(),
  authMiddleware()
)

export const PUT = withMiddleware(
  handleUpdateProductCategory,
  corsMiddleware(),
  authMiddleware(),
  validateRequestMiddleware(updateProductCategorySchema)
)

export const DELETE = withMiddleware(
  handleDeleteProductCategory,
  corsMiddleware(),
  authMiddleware()
)
