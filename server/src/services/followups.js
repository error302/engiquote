import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendFollowUpEmail = async (quote, type = 'follow_up') => {
  const client = quote.project?.client;
  if (!client?.email) return false;

  const templates = {
    follow_up: {
      subject: `Follow-up: Quote ${quote.quoteNumber} is still pending`,
      body: `Hi ${client.name},\n\nWe wanted to follow up on the quote we sent you (${quote.quoteNumber}) for ${quote.project?.name}.\n\nTotal Amount: KSh ${Number(quote.total).toLocaleString()}\nValid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}\n\nIf you have any questions or would like to proceed, please don't hesitate to contact us.\n\nBest regards,\nEngiQuote KE Team`,
    },
    reminder: {
      subject: `Reminder: Quote ${quote.quoteNumber} expires soon`,
      body: `Hi ${client.name},\n\nThis is a reminder that your quote ${quote.quoteNumber} for ${quote.project?.name} will expire soon.\n\nTotal Amount: KSh ${Number(quote.total).toLocaleString()}\nValid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}\n\nPlease let us know if you'd like to proceed.\n\nBest regards,\nEngiQuote KE Team`,
    },
    thanks: {
      subject: `Thank you for accepting quote ${quote.quoteNumber}`,
      body: `Hi ${client.name},\n\nThank you for accepting our quote ${quote.quoteNumber} for ${quote.project?.name}.\n\nWe will begin working on your project shortly.\n\nBest regards,\nEngiQuote KE Team`,
    },
  };

  const template = templates[type] || templates.follow_up;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@engiquote.com',
      to: client.email,
      subject: template.subject,
      text: template.body,
    });

    await prisma.followUp.create({
      data: {
        quoteId: quote.id,
        type,
        email: client.email,
        subject: template.subject,
        status: 'SENT',
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to send follow-up email:', error);
    await prisma.followUp.create({
      data: {
        quoteId: quote.id,
        type,
        email: client.email,
        subject: template.subject,
        status: 'FAILED',
      },
    });
    return false;
  }
};

export const processFollowUpQueue = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const pendingQuotes = await prisma.quote.findMany({
    where: {
      status: 'SENT',
      project: { client: { email: { not: null } } },
    },
    include: {
      project: { include: { client: true } },
      followUps: { orderBy: { sentAt: 'desc' }, take: 1 },
    },
  });

  for (const quote of pendingQuotes) {
    const lastFollowUp = quote.followUps[0];
    const quoteAge = new Date() - new Date(quote.createdAt);

    if (!lastFollowUp && quoteAge > 3 * 24 * 60 * 60 * 1000) {
      await sendFollowUpEmail(quote, 'follow_up');
    } else if (lastFollowUp && lastFollowUp.type === 'follow_up' && quoteAge > 7 * 24 * 60 * 60 * 1000) {
      await sendFollowUpEmail(quote, 'reminder');
    } else if (lastFollowUp && lastFollowUp.type === 'reminder' && quoteAge > 14 * 24 * 60 * 60 * 1000) {
      await sendFollowUpEmail(quote, 'follow_up');
    }
  }
};

export const getFollowUps = async (quoteId) => {
  return prisma.followUp.findMany({
    where: { quoteId },
    orderBy: { sentAt: 'desc' },
  });
};

export default { sendFollowUpEmail, processFollowUpQueue, getFollowUps };
