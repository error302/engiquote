import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_xxx');

export const createStripeCheckout = async (invoice) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: invoice.currency?.toLowerCase() || 'usd',
        product_data: {
          name: `Invoice #${invoice.invoiceNumber}`,
          description: `Payment for invoice #${invoice.invoiceNumber}`,
        },
        unit_amount: Math.round(Number(invoice.amount) * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/invoices/${invoice.id}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/invoices/${invoice.id}?payment=cancelled`,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    },
  });

  return session;
};

export const handleStripeWebhook = async (payload, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { invoiceId } = session.metadata;
    
    await prisma.payment.create({
      data: {
        invoiceId,
        amount: session.amount_total / 100,
        method: 'CARD',
        reference: session.payment_intent,
        status: 'COMPLETED',
      },
    });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    const newPaidAmount = Number(invoice.paidAmount) + (session.amount_total / 100);
    const newStatus = newPaidAmount >= Number(invoice.amount) ? 'PAID' : 'PARTIAL';
    
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    });
  }

  return { received: true };
};

export const initiateMpesaPayment = async (invoice, phoneNumber) => {
  const amount = Math.round(Number(invoice.amount));
  const accountNumber = invoice.invoiceNumber;
  
  const mpesaData = {
    BusinessShortCode: process.env.MPESA_SHORTCODE || '174379',
    Password: Buffer.from(
      (process.env.MPESA_SHORTCODE || '174379') + 
      (process.env.MPESA_PASSKEY || 'bfb279f9aa9b250cf06cf6730122ecca') + 
      new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')
    ).toString('base64'),
    Timestamp: new Date().toISOString().slice(0, 19).replace(/[-T:]/g, ''),
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: process.env.MPESA_SHORTCODE || '174379',
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payments/mpesa/callback',
    AccountReference: accountNumber,
    TransactionDesc: `Payment for ${accountNumber}`,
  };

  const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MPESA_ACCESS_TOKEN || 'token'}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mpesaData),
  });

  return response.json();
};

export const handleMpesaCallback = async (callbackData) => {
  const { Body } = callbackData;
  
  if (Body.stkCallback.ResultCode === 0) {
    const metadata = Body.stkCallback.CallbackMetadata?.Item;
    const amount = metadata?.find(i => i.Name === 'Amount')?.Value;
    const mpesaReceipt = metadata?.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const phone = metadata?.find(i => i.Name === 'PhoneNumber')?.Value;
    const accountRef = metadata?.find(i => i.Name === 'AccountReference')?.Value;

    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNumber: accountRef },
    });

    if (invoice) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount,
          method: 'MPESA',
          reference: mpesaReceipt,
          notes: `Phone: ${phone}`,
        },
      });

      const newPaidAmount = Number(invoice.paidAmount) + amount;
      const newStatus = newPaidAmount >= Number(invoice.amount) ? 'PAID' : 'PARTIAL';
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { paidAmount: newPaidAmount, status: newStatus },
      });
    }
  }
};

export default { createStripeCheckout, handleStripeWebhook, initiateMpesaPayment, handleMpesaCallback };
