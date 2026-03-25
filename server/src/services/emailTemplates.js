import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromEmail = process.env.SMTP_FROM || 'noreply@engiquote.com';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const emailTemplates = {
  welcome: {
    subject: 'Welcome to EngiQuote KE',
    body: (data) => `
Dear ${data.name},

Welcome to EngiQuote KE - Professional Engineering Estimates!

Your account has been created successfully.

Login to start creating estimates:
${clientUrl}/login

Quick start guide:
1. Add your first client
2. Create a project
3. Generate your first quote

Best regards,
EngiQuote KE Team
    `.trim(),
  },

  quoteCreated: {
    subject: 'New Quote Created - {{quoteNumber}}',
    body: (data) => `
Dear ${data.clientName},

A new quote has been created for your project: ${data.projectName}

Quote Number: ${data.quoteNumber}
Total Amount: KSh ${Number(data.total).toLocaleString()}
Valid Until: ${data.validUntil}

View and approve:
${clientUrl}/portal/shared/${data.token}

Best regards,
EngiQuote KE Team
    `.trim(),
  },

  quoteApproved: {
    subject: 'Quote Approved - {{quoteNumber}}',
    body: (data) => `
Dear ${data.contractorName},

Great news! Your quote has been approved.

Quote: ${data.quoteNumber}
Project: ${data.projectName}
Amount: KSh ${Number(data.total).toLocaleString()}

The client has approved this quote. You can now proceed with the next steps.

Best regards,
EngiQuote KE Team
    `.trim(),
  },

  quoteRejected: {
    subject: 'Quote Requires Revision - {{quoteNumber}}',
    body: (data) => `
Dear ${data.contractorName},

The client has requested revisions for your quote.

Quote: ${data.quoteNumber}
Comments: ${data.comments}

Please review and update the quote.

Best regards,
EngiQuote KE Team
    `.trim(),
  },

  invoicePaid: {
    subject: 'Payment Received - Invoice {{invoiceNumber}}',
    body: (data) => `
Dear ${data.clientName},

Payment has been received for your invoice.

Invoice: ${data.invoiceNumber}
Amount Paid: KSh ${Number(data.amount).toLocaleString()}
Remaining: KSh ${Number(data.remaining).toLocaleString()}

Thank you for your payment!

Best regards,
EngiQuote KE Team
    `.trim(),
  },

  invoiceOverdue: {
    subject: 'Invoice Overdue - {{invoiceNumber}}',
    body: (data) => `
Dear ${data.clientName},

This is a reminder that your invoice is overdue.

Invoice: ${data.invoiceNumber}
Amount: KSh ${Number(data.amount).toLocaleString()}
Due Date: ${data.dueDate}

Please arrange payment at your earliest convenience.

Best regards,
EngiQuote KE Team
    `.trim(),
  },

  subscriptionExpiring: {
    subject: 'Subscription Expiring Soon',
    body: (data) => `
Dear ${data.name},

Your EngiQuote KE subscription will expire on ${data.expiresAt}.

To continue using premium features, please renew your subscription.

Renew now:
${clientUrl}/settings

Best regards,
EngiQuote KE Team
    `.trim(),
  },

  passwordReset: {
    subject: 'Reset Your Password',
    body: (data) => `
Dear ${data.name},

You requested to reset your password.

Click the link below to create a new password:
${clientUrl}/reset-password?token=${data.token}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
EngiQuote KE Team
    `.trim(),
  },
};

export const sendEmail = async (to, templateName, data) => {
  const template = emailTemplates[templateName];
  
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  const subject = template.subject
    .replace('{{quoteNumber}}', data.quoteNumber || '')
    .replace('{{invoiceNumber}}', data.invoiceNumber || '');

  const body = template.body(data);

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text: body,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkEmail = async (recipients, templateName, data) => {
  const results = await Promise.allSettled(
    recipients.map(email => sendEmail(email, templateName, data))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed, total: recipients.length };
};

export const logEmail = async (type, to, subject, status) => {
  try {
    await prisma.followUp.create({
      data: {
        quoteId: '',
        type,
        email: to,
        subject,
        status,
      },
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
};

export default {
  sendEmail,
  sendBulkEmail,
  logEmail,
  templates: emailTemplates,
};