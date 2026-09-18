import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // Transporter creation with fallback for development
  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development console fallback logger
    console.log(`[TicketHarbor Email Mock] Sending email to ${options.email}`);
    console.log(`[TicketHarbor Email Mock] Subject: ${options.subject}`);
    console.log(`[TicketHarbor Email Mock] Body: ${options.message || options.html}`);
    return { messageId: 'mock-email-id-dev-mode' };
  }

  const message = {
    from: `"${process.env.FROM_NAME || 'TicketHarbor'}" <${process.env.FROM_EMAIL || 'noreply@ticketharbor.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments || [],
  };

  const info = await transporter.sendMail(message);
  console.log(`[TicketHarbor Email] Message sent: %s`, info.messageId);
  return info;
};
