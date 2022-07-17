import sendgrid from "@sendgrid/mail";

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail({ to, subject, text, html }: SendMailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('No SendGrid API Key specified');
  }

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

  return sendgrid.send({
    to,
    from: 'admin@betterlox.com',
    subject,
    text,
    html
  });
}