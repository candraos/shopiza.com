import "server-only";

import { type UserRole } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const currentUserSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  phoneNumber: true,
  role: true,
  emailVerified: true,
  phoneVerified: true,
  locationAccessGranted: true,
  locationLabel: true,
  locationLatitude: true,
  locationLongitude: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();

  if (!session?.userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: currentUserSelect,
  });
});

export async function requireCurrentUser(redirectTo = "/login") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireRole(role: UserRole, redirectTo = "/") {
  const user = await requireCurrentUser();

  if (user.role !== role) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}
