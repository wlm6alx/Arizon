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
import { RoleType, ApprovisionnementStatus } from '@prisma/client';

// GET handler
async function getHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);

  try {
    const approvisionnement = await prisma.approvisionnement.findUnique({
      where: { id: params.id },
      include: {
        supplier: true,
        product: true,
        warehouse: true,
        businessDeveloper: true,
        stockManager: true,
      },
    });

    if (!approvisionnement) {
      return createErrorResponse('Approvisionnement not found', 404);
    }

    const canView = await hasRole(user.userId, [RoleType.ADMIN, RoleType.BUSINESS, RoleType.STOCK_MANAGER]);
    const isOwner = approvisionnement.supplierId === user.userId;

    if (!canView && !isOwner) {
      return createErrorResponse('Forbidden', 403);
    }

    return createSuccessResponse(approvisionnement, 'Approvisionnement retrieved successfully');
  } catch (error) {
    return createErrorResponse('Failed to retrieve approvisionnement', 500);
  }
}

// PUT handler
const updateSchema = z.object({
  status: z.nativeEnum(ApprovisionnementStatus),
});

async function putHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const { user } = req;
  if (!user) return createErrorResponse('Unauthorized', 401);

  const body = await req.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(validation.error.message, 400);
  }

  const { status } = validation.data;

  try {
    const approvisionnement = await prisma.approvisionnement.findUnique({ where: { id: params.id } });
    if (!approvisionnement) {
      return createErrorResponse('Approvisionnement not found', 404);
    }

    let canUpdate = false;
    const updateData: any = { status };

    const isAdmin = await hasRole(user.userId, [RoleType.ADMIN]);

    if (status === 'APPROVED' && approvisionnement.status === 'PENDING') {
      const canApprove = await hasRole(user.userId, [RoleType.BUSINESS]);
      if (isAdmin || canApprove) {
        updateData.businessDeveloperId = user.userId;
        canUpdate = true;
      }
    } else if (status === 'RECEIVED' && approvisionnement.status === 'APPROVED') {
      const canReceive = await hasRole(user.userId, [RoleType.STOCK_MANAGER]);
      if (isAdmin || canReceive) {
        updateData.stockManagerId = user.userId;
        canUpdate = true;
      }
    } else if (status === 'CANCELLED' && approvisionnement.status === 'PENDING') {
      const isOwner = approvisionnement.supplierId === user.userId;
      if (isAdmin || isOwner) {
        canUpdate = true;
      }
    } else if (status === 'REJECTED' && approvisionnement.status === 'PENDING') {
        const canReject = await hasRole(user.userId, [RoleType.BUSINESS]);
        if (isAdmin || canReject) {
            canUpdate = true;
        }
    }

    if (!canUpdate) {
      return createErrorResponse('Invalid status transition or insufficient permissions', 403);
    }

    const updatedApprovisionnement = await prisma.$transaction(async (tx) => {
      const updated = await tx.approvisionnement.update({
        where: { id: params.id },
        data: updateData,
      });

      if (status === 'RECEIVED') {
        await tx.stock.upsert({
          where: { productId_warehouseId: { productId: updated.productId, warehouseId: updated.warehouseId } },
          update: { quantity: { increment: updated.quantity } },
          create: {
            productId: updated.productId,
            warehouseId: updated.warehouseId,
            quantity: updated.quantity,
            unitPrice: updated.proposedPrice,
            approvisionnementId: updated.id,
          },
        });
      }
      return updated;
    });

    return createSuccessResponse(updatedApprovisionnement, 'Approvisionnement updated successfully');
  } catch (error) {
    return createErrorResponse('Failed to update approvisionnement', 500);
  }
}

export const GET = withMiddleware(getHandler, authMiddleware());
export const PUT = withMiddleware(putHandler, authMiddleware());
