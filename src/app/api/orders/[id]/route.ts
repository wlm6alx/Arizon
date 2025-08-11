// This route handles individual order operations
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
import { RoleType, OrderStatus, DeliveryStatus } from '@prisma/client';

async function getHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);
  const orderId = params.id;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
        client: true,
        delivery: true,
      },
    });

    if (!order) {
      return createErrorResponse('Order not found', 404);
    }

    const isOwner = order.clientId === user.userId;
    const isDriver = order.delivery?.driverId === user.userId;
    const canViewAll = await hasRole(user.userId, [RoleType.ADMIN, RoleType.BUSINESS, RoleType.COMMAND_MANAGER]);

    if (!isOwner && !isDriver && !canViewAll) {
      return createErrorResponse('Forbidden', 403);
    }

    return createSuccessResponse(order);
  } catch (error) {
    return createErrorResponse('Failed to fetch order', 500);
  }
}

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

async function putHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);
  
  const orderId = params.id;
  const body = await req.json();
  const validation = updateOrderSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(validation.error.message, 400);
  }

  const { status } = validation.data;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return createErrorResponse('Order not found', 404);
    }

    if (status === 'CANCELLED') {
      if (order.clientId !== user.userId || order.status !== 'PENDING') {
        return createErrorResponse('Order can only be cancelled by the client while it is pending', 403);
      }
    } else {
      const canUpdate = await hasRole(user.userId, [RoleType.COMMAND_MANAGER]);
      if (!canUpdate) {
        return createErrorResponse('Forbidden', 403);
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      if (status === 'SHIPPED' && order.status !== 'SHIPPED') {
        await tx.delivery.create({
          data: {
            orderId: orderId,
            status: DeliveryStatus.ASSIGNED,
          },
        });
      }
      return newOrder;
    });

    return createSuccessResponse(updatedOrder, 'Order updated successfully');
  } catch (error) {
    return createErrorResponse('Failed to update order', 500);
  }
}

async function deleteHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
    const { user } = req;
    if (!user) return createErrorResponse('Unauthorized', 401);

    const canDelete = await hasRole(user.userId, [RoleType.ADMIN, RoleType.BUSINESS]);
    if (!canDelete) {
        return createErrorResponse('Forbidden', 403);
    }

    try {
        await prisma.order.delete({ where: { id: params.id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return createErrorResponse('Failed to delete order', 500);
    }
}

export const GET = withMiddleware(getHandler, authMiddleware());
export const PUT = withMiddleware(putHandler, authMiddleware());
export const DELETE = withMiddleware(deleteHandler, authMiddleware());
