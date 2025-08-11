import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  withMiddleware,
  authMiddleware,
  AuthenticatedRequest,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/middleware';
import { hasRole } from '@/lib/rbac';
import { RoleType, DeliveryStatus } from '@prisma/client';

async function getHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: { order: { select: { clientId: true } } },
    });

    if (!delivery) {
      return createErrorResponse('Delivery not found', 404);
    }

    const canManage = await hasRole(user.userId, [RoleType.ADMIN, RoleType.BUSINESS, RoleType.COMMAND_MANAGER]);
    const isOwner = delivery.order.clientId === user.userId;
    const isDriver = delivery.driverId === user.userId;

    if (!canManage && !isOwner && !isDriver) {
      return createErrorResponse('Forbidden', 403);
    }

    return createSuccessResponse(delivery, 'Delivery fetched successfully');
  } catch (error) {
    return createErrorResponse('Failed to fetch delivery', 500);
  }
}

const updateDeliverySchema = z.object({
  driverId: z.string().optional(),
  status: z.nativeEnum(DeliveryStatus).optional(),
});

async function putHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);

  const body = await req.json();
  const validation = updateDeliverySchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(validation.error.message, 400);
  }

  const { driverId, status } = validation.data;

  if (!driverId && !status) {
    return createErrorResponse('Request body must contain driverId or status', 400);
  }

  try {
    const delivery = await prisma.delivery.findUnique({ where: { id: params.id } });

    if (!delivery) {
      return createErrorResponse('Delivery not found', 404);
    }

    const isCommandManager = await hasRole(user.userId, [RoleType.COMMAND_MANAGER]);
    const isAssignedDriver = delivery.driverId === user.userId;

    // Authorization for changing driverId
    if (driverId && driverId !== delivery.driverId) {
      if (!isCommandManager) {
        return createErrorResponse('Only command managers can assign drivers', 403);
      }
    }

    // Authorization for changing status
    if (status && status !== delivery.status) {
      if (!isAssignedDriver && !isCommandManager) {
        return createErrorResponse('Only the assigned driver or a command manager can update status', 403);
      }
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: params.id },
      data: { driverId, status },
    });

    return createSuccessResponse(updatedDelivery, 'Delivery updated successfully');
  } catch (error) {
    return createErrorResponse('Failed to update delivery', 500);
  }
}

export const GET = withMiddleware(getHandler, authMiddleware());
export const PUT = withMiddleware(putHandler, authMiddleware());
