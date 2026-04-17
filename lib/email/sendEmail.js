import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("📧 Resend response:", response);

    if (response.error) {
      console.error("❌ Resend error:", response.error);
      throw new Error(response.error.message);
    }

    return response;
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw err; // for BullMQ retry
  }
}