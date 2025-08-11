import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  withMiddleware,
  authMiddleware,
  AuthenticatedRequest,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware';
import { hasRole } from '@/lib/rbac';
import { RoleType } from '@prisma/client';

const getStocksSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  warehouseId: z.string().optional(),
  productId: z.string().optional(),
});

async function getHandler(req: AuthenticatedRequest) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);

  const canViewStocks = await hasRole(user.userId, [
    RoleType.ADMIN,
    RoleType.BUSINESS,
    RoleType.STOCK_MANAGER,
  ]);

  if (!canViewStocks) {
    return createErrorResponse('Forbidden', 403);
  }

  const { searchParams } = new URL(req.url);
  const validation = getStocksSchema.safeParse(Object.fromEntries(searchParams));

  if (!validation.success) {
    return createErrorResponse(validation.error.message, 400);
  }

  const { page, limit, warehouseId, productId } = validation.data;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const where = {
    ...(warehouseId && { warehouseId }),
    ...(productId && { productId }),
  };

  try {
    const stocks = await prisma.stock.findMany({
      where,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      include: {
        product: true,
        warehouse: true,
      },
    });

    const total = await prisma.stock.count({ where });

    return createSuccessResponse({
      data: stocks,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return createErrorResponse('Failed to fetch stocks', 500);
  }
}

export const GET = withMiddleware(getHandler, authMiddleware());
