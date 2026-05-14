import "server-only";

import { Prisma } from "@prisma/client";

import { CART_RESERVATION_WINDOW_MINUTES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { decorateProduct } from "@/lib/services/catalog";

const cartArgs = Prisma.validator<Prisma.CartReservationDefaultArgs>()({
  include: {
    items: {
      include: {
        product: {
          include: {
            section: true,
            images: true,
            discounts: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    },
  },
});

type TransactionClient = Prisma.TransactionClient;
type CartRecord = Prisma.CartReservationGetPayload<typeof cartArgs>;

function reservationExpiry() {
  return new Date(Date.now() + CART_RESERVATION_WINDOW_MINUTES * 60 * 1000);
}

async function cleanupExpiredReservations(transaction: TransactionClient) {
  const expiredReservations = await transaction.cartReservation.findMany({
    where: {
      convertedAt: null,
      expiresAt: {
        lt: new Date(),
      },
    },
    include: {
      items: true,
    },
  });

  for (const reservation of expiredReservations) {
    for (const item of reservation.items) {
      await transaction.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  if (expiredReservations.length > 0) {
    await transaction.cartReservationItem.deleteMany({
      where: {
        reservationId: {
          in: expiredReservations.map((reservation) => reservation.id),
        },
      },
    });

    await transaction.cartReservation.deleteMany({
      where: {
        id: {
          in: expiredReservations.map((reservation) => reservation.id),
        },
      },
    });
  }
}

async function getOrCreateReservation(
  transaction: TransactionClient,
  sessionId: string,
  userId?: string,
) {
  const existing = await transaction.cartReservation.findUnique({
    where: {
      sessionId,
    },
  });

  if (existing) {
    return transaction.cartReservation.update({
      where: {
        id: existing.id,
      },
      data: {
        userId: userId ?? existing.userId,
        expiresAt: reservationExpiry(),
      },
    });
  }

  return transaction.cartReservation.create({
    data: {
      sessionId,
      userId: userId ?? null,
      expiresAt: reservationExpiry(),
    },
  });
}

async function readCart(transaction: TransactionClient, sessionId: string) {
  const reservation = await transaction.cartReservation.findUnique({
    where: {
      sessionId,
    },
    ...cartArgs,
  });

  return formatCart(reservation);
}

function formatCart(reservation: CartRecord | null) {
  if (!reservation) {
    return {
      sessionId: null,
      expiresAt: null,
      itemCount: 0,
      subtotalCents: 0,
      items: [],
    };
  }

  const items = reservation.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceSnapshotCents,
    totalPriceCents: item.unitPriceSnapshotCents * item.quantity,
    product: decorateProduct(item.product),
  }));

  return {
    sessionId: reservation.sessionId,
    expiresAt: reservation.expiresAt,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.totalPriceCents, 0),
    items,
  };
}

async function currentUnitPriceCents(transaction: TransactionClient, productId: string) {
  const product = await transaction.product.findUnique({
    where: { id: productId },
    include: {
      section: true,
      images: true,
      discounts: true,
    },
  });

  if (!product || product.archived) {
    throw new Error("Product is not available.");
  }

  return decorateProduct(product).effectivePriceCents;
}

export async function getCartBySessionId(sessionId: string) {
  return prisma.$transaction(async (transaction) => {
    await cleanupExpiredReservations(transaction);
    return readCart(transaction, sessionId);
  });
}

export async function addToCart(input: {
  sessionId: string;
  productId: string;
  quantity: number;
  userId?: string;
}) {
  return prisma.$transaction(async (transaction) => {
    await cleanupExpiredReservations(transaction);

    const reservation = await getOrCreateReservation(
      transaction,
      input.sessionId,
      input.userId,
    );
    const existingItem = await transaction.cartReservationItem.findUnique({
      where: {
        reservationId_productId: {
          reservationId: reservation.id,
          productId: input.productId,
        },
      },
    });

    const stockUpdate = await transaction.product.updateMany({
      where: {
        id: input.productId,
        archived: false,
        stock: {
          gte: input.quantity,
        },
      },
      data: {
        stock: {
          decrement: input.quantity,
        },
      },
    });

    if (stockUpdate.count === 0) {
      throw new Error("Not enough stock available.");
    }

    const price = await currentUnitPriceCents(transaction, input.productId);

    if (existingItem) {
      await transaction.cartReservationItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: {
            increment: input.quantity,
          },
          unitPriceSnapshotCents: price,
        },
      });
    } else {
      await transaction.cartReservationItem.create({
        data: {
          reservationId: reservation.id,
          productId: input.productId,
          quantity: input.quantity,
          unitPriceSnapshotCents: price,
        },
      });
    }

    return readCart(transaction, input.sessionId);
  });
}

export async function setCartItemQuantity(input: {
  sessionId: string;
  productId: string;
  quantity: number;
}) {
  return prisma.$transaction(async (transaction) => {
    await cleanupExpiredReservations(transaction);

    const reservation = await transaction.cartReservation.findUnique({
      where: {
        sessionId: input.sessionId,
      },
    });

    if (!reservation) {
      return formatCart(null);
    }

    const item = await transaction.cartReservationItem.findUnique({
      where: {
        reservationId_productId: {
          reservationId: reservation.id,
          productId: input.productId,
        },
      },
    });

    if (!item) {
      return readCart(transaction, input.sessionId);
    }

    const delta = input.quantity - item.quantity;

    if (input.quantity <= 0) {
      await transaction.product.update({
        where: { id: input.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });

      await transaction.cartReservationItem.delete({
        where: {
          id: item.id,
        },
      });

      return readCart(transaction, input.sessionId);
    }

    if (delta > 0) {
      const stockUpdate = await transaction.product.updateMany({
        where: {
          id: input.productId,
          archived: false,
          stock: {
            gte: delta,
          },
        },
        data: {
          stock: {
            decrement: delta,
          },
        },
      });

      if (stockUpdate.count === 0) {
        throw new Error("Not enough stock available.");
      }
    } else if (delta < 0) {
      await transaction.product.update({
        where: {
          id: input.productId,
        },
        data: {
          stock: {
            increment: Math.abs(delta),
          },
        },
      });
    }

    await transaction.cartReservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        expiresAt: reservationExpiry(),
      },
    });

    await transaction.cartReservationItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity: input.quantity,
        unitPriceSnapshotCents: await currentUnitPriceCents(
          transaction,
          input.productId,
        ),
      },
    });

    return readCart(transaction, input.sessionId);
  });
}

export async function clearCart(sessionId: string) {
  return prisma.$transaction(async (transaction) => {
    await cleanupExpiredReservations(transaction);

    const reservation = await transaction.cartReservation.findUnique({
      where: {
        sessionId,
      },
      include: {
        items: true,
      },
    });

    if (!reservation) {
      return formatCart(null);
    }

    for (const item of reservation.items) {
      await transaction.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

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

    return formatCart(null);
  });
}
