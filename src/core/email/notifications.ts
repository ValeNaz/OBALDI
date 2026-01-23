import { getAdminNotificationEmails } from "@/src/core/config";
import { sendEmail } from "@/src/core/email/sender";

export const notifyAdmins = async (params: {
  subject: string;
  html: string;
  text?: string;
}) => {
  const recipients = getAdminNotificationEmails();
  if (recipients.length === 0) return;

  try {
    await sendEmail({
      to: recipients.join(","),
      subject: params.subject,
      html: params.html,
      text: params.text
    });
  } catch {
    // Best-effort notification; ignore delivery failures.
  }
};
