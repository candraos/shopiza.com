import "server-only";

import {
  calculateDiscountedPriceCents,
  getNextAvailableSlug,
  slugify,
} from "@/lib/utils";
import { prisma } from "@/lib/prisma";

async function resolveProductSlug(name: string, productId?: string) {
  const baseSlug = slugify(name);
  const existingProducts = await prisma.product.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      ...(productId
        ? {
            NOT: {
              id: productId,
            },
          }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  return getNextAvailableSlug(
    baseSlug,
    existingProducts.map((product) => product.slug),
  );
}

export async function createSection(input: {
  name: string;
  description: string;
}) {
  return prisma.section.create({
    data: {
      name: input.name,
      description: input.description,
      slug: slugify(input.name),
    },
  });
}

export async function updateSection(
  id: string,
  input: {
    name: string;
    description: string;
  },
) {
  return prisma.section.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      description: input.description,
      slug: slugify(input.name),
    },
  });
}

export async function deleteSection(id: string) {
  return prisma.$transaction(async (transaction) => {
    await transaction.product.updateMany({
      where: {
        sectionId: id,
      },
      data: {
        sectionId: null,
        archived: true,
      },
    });

    await transaction.section.delete({
      where: {
        id,
      },
    });
  });
}

export async function upsertProduct(input: {
  id?: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  archived: boolean;
  sectionId?: string | null;
  images: Array<{
    imageUrl: string;
    altText?: string;
    isMain: boolean;
    sortOrder: number;
  }>;
}) {
  const slug = await resolveProductSlug(input.name, input.id);

  if (input.id) {
    return prisma.product.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        slug,
        description: input.description,
        priceCents: input.priceCents,
        stock: input.stock,
        archived: input.archived || !input.sectionId,
        sectionId: input.sectionId ?? null,
        images: {
          deleteMany: {},
          create: input.images,
        },
      },
      include: {
        images: true,
      },
    });
  }

  return prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      priceCents: input.priceCents,
      stock: input.stock,
      archived: input.archived || !input.sectionId,
      sectionId: input.sectionId ?? null,
      images: {
        create: input.images,
      },
    },
    include: {
      images: true,
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: {
      id,
    },
  });
}

export async function upsertDiscount(input: {
  id?: string;
  productId: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
}) {
  const product = await prisma.product.findUniqueOrThrow({
    where: {
      id: input.productId,
    },
    select: {
      priceCents: true,
    },
  });

  const discountedPriceCents = calculateDiscountedPriceCents(
    product.priceCents,
    input.type,
    input.type === "FIXED_AMOUNT" ? input.value : input.value,
  );

  if (input.id) {
    return prisma.discount.update({
      where: {
        id: input.id,
      },
      data: {
        productId: input.productId,
        type: input.type,
        value: input.value,
        discountedPriceCents,
        startAt: input.startAt,
        endAt: input.endAt,
        isActive: input.isActive,
      },
    });
  }

  return prisma.discount.create({
    data: {
      productId: input.productId,
      type: input.type,
      value: input.value,
      discountedPriceCents,
      startAt: input.startAt,
      endAt: input.endAt,
      isActive: input.isActive,
    },
  });
}

export async function deleteDiscount(id: string) {
  return prisma.discount.delete({
    where: {
      id,
    },
  });
}

export async function getAdminDiscounts() {
  return prisma.discount.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          priceCents: true,
          slug: true,
        },
      },
    },
  });
}

export async function getAdminSections() {
  return prisma.section.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getAdminUsersSnapshot() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      phoneNumber: true,
      role: true,
      createdAt: true,
    },
  });
}
