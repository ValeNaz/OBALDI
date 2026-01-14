import nodemailer from "nodemailer";
import { getRequiredEnv } from "@/src/core/config";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    const host = getRequiredEnv("SMTP_HOST");
    const port = Number(getRequiredEnv("SMTP_PORT"));
    const user = getRequiredEnv("SMTP_USER");
    const pass = getRequiredEnv("SMTP_PASS");
    const secure = process.env.SMTP_SECURE === "true";

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  return transporter;
};

export const sendEmail = async (params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  const from = getRequiredEnv("SMTP_FROM");
  const client = getTransporter();

  await client.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text
  });
};
