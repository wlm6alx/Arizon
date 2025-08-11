import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  withMiddleware,
  authMiddleware,
  AuthenticatedRequest,
  createErrorResponse,
  createSuccessResponse,
  validateRequestMiddleware,
} from '@/lib/middleware';
import { hasRole } from '@/lib/rbac';
import { RoleType, PaymentMethod, OrderStatus } from '@prisma/client';

const createOrderSchema = z.object({
  clientId: z.string(),
  warehouseId: z.string(), // Added warehouseId
  paymentMethod: z.nativeEnum(PaymentMethod),
  orderItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })).min(1),
});

async function postHandler(req: AuthenticatedRequest) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);

  const body = await req.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(validation.error.message, 400);
  }

  const { clientId, warehouseId, paymentMethod, orderItems } = validation.data;

  const canCreateOrder = await hasRole(user.userId, [RoleType.ADMIN, RoleType.BUSINESS, RoleType.COMMAND_MANAGER]);
  const isClientOwner = user.userId === clientId;

  if (!canCreateOrder && !isClientOwner) {
    return createErrorResponse('Forbidden: You cannot create orders for other clients.', 403);
  }

  try {
    const productIds = orderItems.map(item => item.productId);
    const stocks = await prisma.stock.findMany({
      where: {
        productId: { in: productIds },
        warehouseId: warehouseId,
      },
    });

    const stockMap = new Map(stocks.map(stock => [stock.productId, stock]));

    // Validate stock and calculate total amount
    let totalAmount = 0;
    for (const item of orderItems) {
      const stock = stockMap.get(item.productId);
      if (!stock) {
        return createErrorResponse(`Product ${item.productId} not found in warehouse ${warehouseId}`, 404);
      }
      if (stock.quantity.toNumber() < item.quantity) {
        return createErrorResponse(`Insufficient stock for product ${item.productId}. Available: ${stock.quantity}`, 400);
      }
      totalAmount += stock.unitPrice.toNumber() * item.quantity;
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          clientId,
          warehouseId,
          totalAmount,
          status: OrderStatus.PENDING,
          paymentMethod,
        },
      });

      // 2. Create order items and decrement stock
      for (const item of orderItems) {
        const stock = stockMap.get(item.productId)!;
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: stock.unitPrice,
          },
        });

        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return createSuccessResponse(order, 'Order created successfully', 201);
  } catch (error) {
    console.error('Order creation error:', error);
    return createErrorResponse('Failed to create order', 500);
  }
}

const getOrdersSchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
});

async function getHandler(req: AuthenticatedRequest) {
    const { user } = req;
    if (!user) return createErrorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const validation = getOrdersSchema.safeParse(Object.fromEntries(searchParams));

    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }
    
    const { page, limit } = validation.data;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const canViewAll = await hasRole(user.userId, [RoleType.ADMIN, RoleType.BUSINESS, RoleType.COMMAND_MANAGER]);
    const where = canViewAll ? {} : { clientId: user.userId };

    try {
        const orders = await prisma.order.findMany({
            where,
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
            include: {
                orderItems: true,
                client: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.order.count({ where });

        return createSuccessResponse({
            data: orders,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        return createErrorResponse('Failed to fetch orders', 500);
    }
}


export const POST = withMiddleware(postHandler, authMiddleware());
export const GET = withMiddleware(getHandler, authMiddleware());
