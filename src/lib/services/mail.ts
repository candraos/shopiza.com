import "server-only";

import nodemailer from "nodemailer";

import { env } from "@/lib/env";

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password,
    },
  });
}

export async function sendMail(input: MailInput) {
  const transporter = getTransporter();

  if (!transporter) {
    console.info(`[mail:dev] to=${input.to} subject=${input.subject}\n${input.text}`);
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
