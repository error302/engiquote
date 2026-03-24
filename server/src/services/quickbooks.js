import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const QUICKBOOKS_BASE_URL = 'https://quickbooks.api.intuit.com/v3';
const SANDBOX_URL = 'https://sandbox-quickbooks.api.intuit.com/v3';

const getBaseUrl = () => {
  return process.env.QUICKBOOKS_ENV === 'production' ? QUICKBOOKS_BASE_URL : SANDBOX_URL;
};

export const getAuthUrl = () => {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
  const scopes = 'com.intuit.quickbooks.accounting';
  
  return `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=1234`;
};

export const exchangeCodeForToken = async (code) => {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
  });

  const data = await response.json();
  return data;
};

export const syncInvoiceToQuickBooks = async (companyId, invoice) => {
  const integration = await prisma.integration.findFirst({
    where: { companyId, provider: 'QUICKBOOKS', active: true },
  });

  if (!integration) {
    throw new Error('QuickBooks integration not configured');
  }

  const response = await fetch(`${getBaseUrl()}/company/${integration.settings}/invoice`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      CustomerRef: { value: '1' },
      Line: [{
        Amount: Number(invoice.amount),
        DetailType: 'SalesItemLineDetail',
        Description: `Invoice #${invoice.invoiceNumber}`,
        SalesItemLineDetail: {
          ItemRef: { value: '1' },
        },
      }],
      DocNumber: invoice.invoiceNumber,
      TxnDate: invoice.issueDate,
      DueDate: invoice.dueDate,
    }),
  });

  return response.json();
};

export const syncPaymentToQuickBooks = async (companyId, payment) => {
  const integration = await prisma.integration.findFirst({
    where: { companyId, provider: 'QUICKBOOKS', active: true },
  });

  if (!integration) {
    throw new Error('QuickBooks integration not configured');
  }

  const response = await fetch(`${getBaseUrl()}/company/${integration.settings}/payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      TotalAmt: Number(payment.amount),
      TxnDate: payment.date,
      PaymentMethod: { value: payment.method === 'CARD' ? 'CreditCard' : 'Cash' },
      PrivateNote: payment.notes,
    }),
  });

  return response.json();
};

export const getQuickBooksCustomers = async (companyId) => {
  const integration = await prisma.integration.findFirst({
    where: { companyId, provider: 'QUICKBOOKS', active: true },
  });

  if (!integration) {
    throw new Error('QuickBooks integration not configured');
  }

  const response = await fetch(`${getBaseUrl()}/company/${integration.settings}/query?query=SELECT * FROM Customer`, {
    headers: {
      'Authorization': `Bearer ${integration.accessToken}`,
      'Accept': 'application/json',
    },
  });

  const data = await response.json();
  return data.QueryResponse?.Customer || [];
};

export const getQuickBooksInvoices = async (companyId) => {
  const integration = await prisma.integration.findFirst({
    where: { companyId, provider: 'QUICKBOOKS', active: true },
  });

  if (!integration) {
    throw new Error('QuickBooks integration not configured');
  }

  const response = await fetch(`${getBaseUrl()}/company/${integration.settings}/query?query=SELECT * FROM Invoice`, {
    headers: {
      'Authorization': `Bearer ${integration.accessToken}`,
      'Accept': 'application/json',
    },
  });

  const data = await response.json();
  return data.QueryResponse?.Invoice || [];
};

export const saveIntegration = async (companyId, provider, accessToken, refreshToken, settings) => {
  return prisma.integration.upsert({
    where: {
      companyId_provider: { companyId, provider },
    },
    update: {
      accessToken,
      refreshToken,
      settings: JSON.stringify(settings),
      active: true,
    },
    create: {
      companyId,
      provider,
      accessToken,
      refreshToken,
      settings: JSON.stringify(settings),
      active: true,
    },
  });
};

export const getIntegrations = async (companyId) => {
  return prisma.integration.findMany({
    where: { companyId },
  });
};

export const disconnectIntegration = async (companyId, provider) => {
  return prisma.integration.updateMany({
    where: { companyId, provider },
    data: { active: false },
  });
};

export default {
  getAuthUrl,
  exchangeCodeForToken,
  syncInvoiceToQuickBooks,
  syncPaymentToQuickBooks,
  getQuickBooksCustomers,
  getQuickBooksInvoices,
  saveIntegration,
  getIntegrations,
  disconnectIntegration,
};
