import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendSlackNotification = async (webhookUrl, message) => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    return response.ok;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return false;
  }
};

export const sendTeamsNotification = async (webhookUrl, title, message) => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        summary: title,
        themeColor: '1E40AF',
        title,
        text: message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Teams notification failed:', error);
    return false;
  }
};

export const notifyQuoteCreated = async (companyId, quote) => {
  const settings = await prisma.companySettings.findUnique({
    where: { companyId },
  });

  const message = `New quote created: ${quote.quoteNumber}\nClient: ${quote.project?.client?.name}\nAmount: KSh ${Number(quote.total).toLocaleString()}`;

  if (settings?.slackWebhook) {
    await sendSlackNotification(settings.slackWebhook, message);
  }
  if (settings?.teamsWebhook) {
    await sendTeamsNotification(settings.teamsWebhook, 'Quote Created', message);
  }
};

export const notifyQuoteAccepted = async (companyId, quote) => {
  const settings = await prisma.companySettings.findUnique({
    where: { companyId },
  });

  const message = `Quote accepted: ${quote.quoteNumber}\nClient: ${quote.project?.client?.name}\nAmount: KSh ${Number(quote.total).toLocaleString()}`;

  if (settings?.slackWebhook) {
    await sendSlackNotification(settings.slackWebhook, message);
  }
  if (settings?.teamsWebhook) {
    await sendTeamsNotification(settings.teamsWebhook, 'Quote Accepted', message);
  }
};

export const notifyQuoteRejected = async (companyId, quote) => {
  const settings = await prisma.companySettings.findUnique({
    where: { companyId },
  });

  const message = `Quote rejected: ${quote.quoteNumber}\nClient: ${quote.project?.client?.name}\nAmount: KSh ${Number(quote.total).toLocaleString()}`;

  if (settings?.slackWebhook) {
    await sendSlackNotification(settings.slackWebhook, message);
  }
  if (settings?.teamsWebhook) {
    await sendTeamsNotification(settings.teamsWebhook, 'Quote Rejected', message);
  }
};

export const notifyInvoicePaid = async (companyId, invoice) => {
  const settings = await prisma.companySettings.findUnique({
    where: { companyId },
  });

  const message = `Invoice paid: ${invoice.invoiceNumber}\nClient: ${invoice.client?.name}\nAmount: KSh ${Number(invoice.amount).toLocaleString()}`;

  if (settings?.slackWebhook) {
    await sendSlackNotification(settings.slackWebhook, message);
  }
  if (settings?.teamsWebhook) {
    await sendTeamsNotification(settings.teamsWebhook, 'Invoice Paid', message);
  }
};

export default {
  sendSlackNotification,
  sendTeamsNotification,
  notifyQuoteCreated,
  notifyQuoteAccepted,
  notifyQuoteRejected,
  notifyInvoicePaid,
};
