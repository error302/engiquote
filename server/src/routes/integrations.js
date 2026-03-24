import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getAuthUrl, exchangeCodeForToken, syncInvoiceToQuickBooks, syncPaymentToQuickBooks, getQuickBooksCustomers, getQuickBooksInvoices, saveIntegration, getIntegrations, disconnectIntegration } from '../services/quickbooks.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/quickbooks/auth', (req, res) => {
  const authUrl = getAuthUrl();
  res.json({ url: authUrl });
});

router.post('/quickbooks/callback', async (req, res) => {
  try {
    const { code, companyId } = req.body;
    const tokenData = await exchangeCodeForToken(code);
    
    await saveIntegration(
      companyId,
      'QUICKBOOKS',
      tokenData.access_token,
      tokenData.refresh_token,
      { realmId: req.body.realmId }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/quickbooks/customers/:companyId', async (req, res) => {
  try {
    const customers = await getQuickBooksCustomers(req.params.companyId);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/quickbooks/invoices/:companyId', async (req, res) => {
  try {
    const invoices = await getQuickBooksInvoices(req.params.companyId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quickbooks/sync-invoice', async (req, res) => {
  try {
    const { companyId, invoiceId } = req.body;
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    const result = await syncInvoiceToQuickBooks(companyId, invoice);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quickbooks/sync-payment', async (req, res) => {
  try {
    const { companyId, paymentId } = req.body;
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    const result = await syncPaymentToQuickBooks(companyId, payment);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:companyId', async (req, res) => {
  try {
    const integrations = await getIntegrations(req.params.companyId);
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/disconnect/:provider', async (req, res) => {
  try {
    await disconnectIntegration(req.params.companyId, req.params.provider);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
