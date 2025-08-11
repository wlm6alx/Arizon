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

const getDeliveriesSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.nativeEnum(DeliveryStatus).optional(),
  driverId: z.string().optional(),
});

async function getHandler(req: AuthenticatedRequest) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);

  const authorizedRoles = [RoleType.ADMIN, RoleType.BUSINESS, RoleType.COMMAND_MANAGER, RoleType.DELIVERY_DRIVER];
  const isAuthorized = await hasRole(user.userId, authorizedRoles);
  if (!isAuthorized) {
    return createErrorResponse('Forbidden', 403);
  }

  const { searchParams } = new URL(req.url);
  const validation = getDeliveriesSchema.safeParse(Object.fromEntries(searchParams));

  if (!validation.success) {
    return createErrorResponse(validation.error.message, 400);
  }

  const { page, limit, status, driverId } = validation.data;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  let where: any = {
    ...(status && { status }),
  };

  const isDriver = await hasRole(user.userId, [RoleType.DELIVERY_DRIVER]);
  if (isDriver) {
    where.driverId = user.userId;
  } else if (driverId) {
    where.driverId = driverId;
  }

  try {
    const deliveries = await prisma.delivery.findMany({
      where,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      include: {
        order: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.delivery.count({ where });

    return createSuccessResponse(
      {
        data: deliveries,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
      'Deliveries fetched successfully'
    );
  } catch (error) {
    return createErrorResponse('Failed to fetch deliveries', 500);
  }
}

export const GET = withMiddleware(getHandler, authMiddleware());
