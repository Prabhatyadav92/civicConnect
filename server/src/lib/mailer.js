import { config } from '../config.js';

// Sends the password reset email.
// - With SMTP_HOST set (and `npm install nodemailer`), a real email is sent.
// - Without it, in development the link is printed in the server terminal.
export async function sendResetEmail(to, link) {
  const { smtp } = config;

  if (!smtp.host) {
    if (config.env === 'production') {
      console.error('Password reset requested but SMTP is not configured. No email was sent.');
      return;
    }
    console.log(`\n[CivicConnect] Password reset link for ${to}:\n${link}\n(Valid for 30 minutes. Set SMTP_HOST in .env to send real emails.)\n`);
    return;
  }

  const { default: nodemailer } = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
  });

  await transport.sendMail({
    from: smtp.from,
    to,
    subject: 'Reset your CivicConnect password',
    text: `We received a request to reset your CivicConnect password.\n\nOpen this link within 30 minutes to choose a new one:\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    html: `<p>We received a request to reset your CivicConnect password.</p><p><a href="${link}">Choose a new password</a> (valid for 30 minutes).</p><p>If you did not ask for this, you can ignore this email.</p>`,
  });
}