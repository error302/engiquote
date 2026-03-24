import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createStripeCheckout, handleStripeWebhook, initiateMpesaPayment, handleMpesaCallback } from '../services/payment.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/stripe/create-checkout', async (req, res) => {
  try {
    const { invoiceId } = req.body;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true },
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const session = await createStripeCheckout(invoice);
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    await handleStripeWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/mpesa/stkpush', async (req, res) => {
  try {
    const { invoiceId, phoneNumber } = req.body;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const result = await initiateMpesaPayment(invoice, phoneNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mpesa/callback', async (req, res) => {
  try {
    await handleMpesaCallback(req.body);
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:invoiceId', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoiceId: req.params.invoiceId },
      orderBy: { date: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
