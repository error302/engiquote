import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const generateInvoiceNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${random}`;
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { 
        client: true, 
        quote: true,
        payments: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { 
        client: true, 
        quote: { include: { items: true, project: { include: { client: true } } } },
        payments: true 
      }
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { quoteId, clientId, amount, dueDate, notes } = req.body;
    
    let invoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      clientId,
      amount: amount || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes
    };
    
    if (quoteId) {
      const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
      if (quote) {
        invoiceData.quoteId = quoteId;
        invoiceData.amount = quote.total;
      }
    }
    
    const invoice = await prisma.invoice.create({
      data: invoiceData,
      include: { client: true, quote: true }
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createFromQuote = async (req, res) => {
  try {
    const { quoteId, dueDate } = req.body;
    
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { project: true }
    });
    
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        quoteId,
        clientId: quote.project.clientId,
        amount: quote.total,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING'
      },
      include: { client: true, quote: true }
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { status, dueDate, notes } = req.body;
    
    let data = {};
    if (status) data.status = status;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) data.notes = notes;
    
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data,
      include: { client: true, quote: true, payments: true }
    });
    
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { amount, date, method, reference, notes } = req.body;
    
    const payment = await prisma.payment.create({
      data: {
        invoiceId: req.params.id,
        amount,
        date: date ? new Date(date) : new Date(),
        method,
        reference,
        notes
      }
    });
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { payments: true }
    });
    
    const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount);
    
    let status = 'PENDING';
    if (totalPaid >= Number(invoice.amount)) {
      status = 'PAID';
    } else if (totalPaid > 0) {
      status = 'PARTIAL';
    }
    
    await prisma.invoice.update({
      where: { id: req.params.id },
      data: { 
        paidAmount: totalPaid,
        status
      }
    });
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
