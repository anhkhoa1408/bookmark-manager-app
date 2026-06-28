type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.IMPORT_EMAIL_FROM;

  if (!apiKey || !from) {
    console.info("Skipping email because RESEND_API_KEY or IMPORT_EMAIL_FROM is not configured.", {
      to,
      subject,
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not send email: ${response.status}`);
  }
}
