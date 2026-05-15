import "server-only";

import { type OrderStatus } from "@prisma/client";

import { formatCurrency, formatDateTime, generateOrderNumber } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { sendOrderNotificationEmail } from "@/lib/services/auth";

export async function createOrderFromReservation(input: {
  sessionId: string;
  userId: string;
  destinationLocation: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  destinationPlaceId?: string | null;
}) {
  const order = await prisma.$transaction(async (transaction) => {
    const reservation = await transaction.cartReservation.findUnique({
      where: {
        sessionId: input.sessionId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!reservation || reservation.items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const user = await transaction.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const totalPriceCents = reservation.items.reduce(
      (sum, item) => sum + item.unitPriceSnapshotCents * item.quantity,
      0,
    );

    const createdOrder = await transaction.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        clientName: user.fullName,
        clientEmail: user.email,
        clientPhoneNumber: user.phoneNumber,
        totalPriceCents,
        destinationLocation: input.destinationLocation,
        destinationLatitude: input.destinationLatitude ?? null,
        destinationLongitude: input.destinationLongitude ?? null,
        destinationPlaceId: input.destinationPlaceId ?? null,
        items: {
          create: reservation.items.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.product.name,
            quantity: item.quantity,
            unitPriceSnapshotCents: item.unitPriceSnapshotCents,
            totalPriceSnapshotCents: item.unitPriceSnapshotCents * item.quantity,
            mainImageSnapshot:
              item.product.images.find((image) => image.isMain)?.imageUrl ??
              item.product.images[0]?.imageUrl ??
              null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await transaction.cartReservationItem.deleteMany({
      where: {
        reservationId: reservation.id,
      },
    });

    await transaction.cartReservation.delete({
      where: {
        id: reservation.id,
      },
    });

    return createdOrder;
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: input.userId,
    },
  });

  await sendOrderNotificationEmail({
    orderNumber: order.orderNumber,
    clientName: user.fullName,
    clientEmail: user.email,
    clientPhoneNumber: user.phoneNumber,
    destinationLocation: input.destinationLocation,
    totalPriceText: formatCurrency(order.totalPriceCents),
    orderDateText: formatDateTime(order.createdAt),
    lines: order.items.map(
      (item) =>
        `${item.productNameSnapshot} x${item.quantity} - ${formatCurrency(
          item.totalPriceSnapshotCents,
        )}`,
    ),
  });

  return order;
}

export async function getOrdersByUserId(input: {
  userId: string;
  page: number;
  pageSize: number;
}) {
  const skip = (input.page - 1) * input.pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId: input.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: input.pageSize,
      include: {
        items: true,
      },
    }),
    prisma.order.count({
      where: {
        userId: input.userId,
      },
    }),
  ]);

  return {
    orders,
    total,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
  };
}

export async function getAdminOrders(input?: {
  query?: string;
  status?: OrderStatus;
}) {
  return prisma.order.findMany({
    where: {
      status: input?.status,
      OR: input?.query
        ? [
            { orderNumber: { contains: input.query } },
            { clientName: { contains: input.query } },
            { clientEmail: { contains: input.query } },
          ]
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
  });
}
