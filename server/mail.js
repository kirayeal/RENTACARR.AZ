import nodemailer from "nodemailer";
export function mailConfigured() {
  return Boolean(
    (process.env.RESEND_API_KEY && process.env.MAIL_FROM) ||
    (process.env.SMTP_USER && process.env.SMTP_PASSWORD),
  );
}
export async function sendCode(email, code, purpose) {
  const subject =
    purpose === "reset"
      ? "RENTACARR — şifrənin bərpası"
      : "RENTACARR — e-poçtun təsdiqi";
  const text = `Təsdiq kodunuz: ${code}\n\nKod 10 dəqiqə etibarlıdır. Bu sorğunu siz etməmisinizsə, məktubu nəzərə almayın. Şifrənizi heç kimlə paylaşmayın.`;
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [email],
        subject,
        text,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Email delivery failed");
    return;
  }
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    const transport = nodemailer.createTransport({
      service: "gmail",
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    await transport.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      text,
    });
    return;
  }
  throw new Error("Email is not configured");
}
