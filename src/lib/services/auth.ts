import "server-only";

import {
  Prisma,
  type PasswordResetChannel,
  type VerificationChannel,
  type VerificationPurpose,
} from "@prisma/client";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logSecurityEvent } from "@/lib/security/logger";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/services/mail";
import { sendSms } from "@/lib/services/sms";
import { PASSWORD_RESET_TTL_MINUTES, SUPPORT_EMAIL, VERIFICATION_CODE_TTL_MINUTES } from "@/lib/constants";
import {
  generateSixDigitCode,
  normalizeEmail,
  normalizePhoneNumber,
  normalizeUsername,
} from "@/lib/utils";

const authUserSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  phoneNumber: true,
  role: true,
  passwordHash: true,
  emailVerified: true,
  phoneVerified: true,
  locationAccessGranted: true,
  locationLabel: true,
  locationLatitude: true,
  locationLongitude: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type AuthUser = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

export class AuthError extends Error {}

export class ConflictError extends Error {}

export async function findUserByLoginIdentifier(identifier: string) {
  const normalizedEmail = normalizeEmail(identifier);
  const normalizedUsername = normalizeUsername(identifier);

  return prisma.user.findFirst({
    where: {
      OR: [
        { emailNormalized: normalizedEmail },
        { usernameNormalized: normalizedUsername },
      ],
    },
    select: authUserSelect,
  });
}

export async function findUserByRecoveryIdentifier(identifier: string) {
  const normalizedEmail = normalizeEmail(identifier);
  const normalizedUsername = normalizeUsername(identifier);
  const normalizedPhone = normalizePhoneNumber(identifier);

  return prisma.user.findFirst({
    where: {
      OR: [
        { emailNormalized: normalizedEmail },
        { usernameNormalized: normalizedUsername },
        { phoneNumberNormalized: normalizedPhone },
      ],
    },
    select: authUserSelect,
  });
}

export async function registerClientUser(input: {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  locationAccessGranted: boolean;
  locationLabel?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
}) {
  try {
    const createdUser = await prisma.user.create({
      data: {
        fullName: input.fullName,
        username: input.username,
        usernameNormalized: normalizeUsername(input.username),
        email: input.email,
        emailNormalized: normalizeEmail(input.email),
        phoneNumber: input.phoneNumber,
        phoneNumberNormalized: normalizePhoneNumber(input.phoneNumber),
        passwordHash: await hashPassword(input.password),
        role: "CLIENT",
        locationAccessGranted: input.locationAccessGranted,
        locationLabel: input.locationLabel ?? null,
        locationLatitude: input.locationLatitude ?? null,
        locationLongitude: input.locationLongitude ?? null,
      },
      select: authUserSelect,
    });

    await logSecurityEvent({
      userId: createdUser.id,
      eventType: "registration.success",
      message: `New client registered: ${createdUser.email}`,
    });

    return createdUser;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("Username, email, or phone number is already in use.");
    }

    throw error;
  }
}

async function deliverVerificationCode(user: AuthUser, channel: VerificationChannel, code: string) {
  if (channel === "EMAIL") {
    await sendMail({
      to: user.email,
      subject: "Shopiza email verification code",
      html: `<p>Your Shopiza email verification code is <strong>${code}</strong>. It expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.</p>`,
      text: `Your Shopiza email verification code is ${code}. It expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.`,
    });
    return;
  }

  await sendSms({
    phoneNumber: user.phoneNumber,
    message: `Shopiza verification code: ${code}. Expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.`,
  });
}

async function deliverPasswordResetCode(
  user: AuthUser,
  channel: PasswordResetChannel,
  code: string,
) {
  if (channel === "EMAIL") {
    await sendMail({
      to: user.email,
      subject: "Shopiza password reset code",
      html: `<p>Your Shopiza password reset code is <strong>${code}</strong>. It expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.</p>`,
      text: `Your Shopiza password reset code is ${code}. It expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.`,
    });
    return;
  }

  await sendSms({
    phoneNumber: user.phoneNumber,
    message: `Shopiza password reset code: ${code}. Expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.`,
  });
}

export async function issueVerificationCodeForUser(
  user: AuthUser,
  channel: VerificationChannel,
) {
  const purpose: VerificationPurpose =
    channel === "EMAIL" ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";
  const code = generateSixDigitCode();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000,
  );

  await prisma.verificationCode.deleteMany({
    where: {
      userId: user.id,
      channel,
      purpose,
      consumedAt: null,
    },
  });

  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      channel,
      purpose,
      destination: channel === "EMAIL" ? user.email : user.phoneNumber,
      codeHash: await hashPassword(code),
      expiresAt,
    },
  });

  await deliverVerificationCode(user, channel, code);
}

export async function verifyUserCode(input: {
  userId: string;
  channel: VerificationChannel;
  code: string;
}) {
  const purpose: VerificationPurpose =
    input.channel === "EMAIL" ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";
  const record = await prisma.verificationCode.findFirst({
    where: {
      userId: input.userId,
      channel: input.channel,
      purpose,
      consumedAt: null,
      expiresAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record || !(await verifyPassword(input.code, record.codeHash))) {
    await prisma.verificationCode.updateMany({
      where: {
        id: record?.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new AuthError("Invalid verification code.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.verificationCode.update({
      where: {
        id: record.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    await transaction.user.update({
      where: {
        id: input.userId,
      },
      data:
        input.channel === "EMAIL"
          ? { emailVerified: true }
          : { phoneVerified: true },
    });
  });
}

export async function authenticateUser(identifier: string, password: string) {
  const user = await findUserByLoginIdentifier(identifier);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await logSecurityEvent({
      eventType: "login.failure",
      message: `Failed login attempt for ${identifier}`,
    });
    throw new AuthError("Invalid credentials.");
  }

  if (!user.emailVerified || !user.phoneVerified) {
    throw new AuthError("Verify your email and phone number before logging in.");
  }

  await logSecurityEvent({
    userId: user.id,
    eventType: "login.success",
    message: `User logged in: ${user.email}`,
  });

  return user;
}

export async function issuePasswordResetCode(identifier: string, channel: PasswordResetChannel) {
  const user = await findUserByRecoveryIdentifier(identifier);

  if (!user) {
    return;
  }

  const code = generateSixDigitCode();
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
  );

  await prisma.passwordResetCode.deleteMany({
    where: {
      userId: user.id,
      channel,
      consumedAt: null,
    },
  });

  await prisma.passwordResetCode.create({
    data: {
      userId: user.id,
      channel,
      destination: channel === "EMAIL" ? user.email : user.phoneNumber,
      codeHash: await hashPassword(code),
      expiresAt,
    },
  });

  await deliverPasswordResetCode(user, channel, code);

  await logSecurityEvent({
    userId: user.id,
    eventType: "password-reset.requested",
    message: `Password reset requested via ${channel}.`,
  });
}

export async function resetPasswordWithCode(input: {
  identifier: string;
  channel: PasswordResetChannel;
  code: string;
  newPassword: string;
}) {
  const user = await findUserByRecoveryIdentifier(input.identifier);

  if (!user) {
    throw new AuthError("Invalid password reset request.");
  }

  const record = await prisma.passwordResetCode.findFirst({
    where: {
      userId: user.id,
      channel: input.channel,
      consumedAt: null,
      expiresAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record || !(await verifyPassword(input.code, record.codeHash))) {
    throw new AuthError("Invalid password reset code.");
  }

  if (await verifyPassword(input.newPassword, user.passwordHash)) {
    throw new AuthError("The new password must be different from the old password.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: await hashPassword(input.newPassword),
      },
    });

    await transaction.passwordResetCode.update({
      where: {
        id: record.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });
  });

  await logSecurityEvent({
    userId: user.id,
    eventType: "password-reset.completed",
    message: `Password reset completed via ${input.channel}.`,
  });
}

export async function sendOrderNotificationEmail(input: {
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  destinationLocation: string;
  totalPriceText: string;
  orderDateText: string;
  lines: string[];
}) {
  const html = `
    <h1>New Shopiza order</h1>
    <p><strong>Order number:</strong> ${input.orderNumber}</p>
    <p><strong>Client:</strong> ${input.clientName}</p>
    <p><strong>Email:</strong> ${input.clientEmail}</p>
    <p><strong>Phone:</strong> ${input.clientPhoneNumber}</p>
    <p><strong>Destination:</strong> ${input.destinationLocation}</p>
    <p><strong>Order date:</strong> ${input.orderDateText}</p>
    <p><strong>Total:</strong> ${input.totalPriceText}</p>
    <ul>${input.lines.map((line) => `<li>${line}</li>`).join("")}</ul>
  `;

  const text = [
    `New Shopiza order`,
    `Order number: ${input.orderNumber}`,
    `Client: ${input.clientName}`,
    `Email: ${input.clientEmail}`,
    `Phone: ${input.clientPhoneNumber}`,
    `Destination: ${input.destinationLocation}`,
    `Order date: ${input.orderDateText}`,
    `Total: ${input.totalPriceText}`,
    ...input.lines.map((line) => `- ${line}`),
  ].join("\n");

  await sendMail({
    to: SUPPORT_EMAIL,
    subject: `New Shopiza order ${input.orderNumber}`,
    html,
    text,
  });
}
