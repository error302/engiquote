import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const generateQuoteNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EQ-${dateStr}-${random}`;
};

const calculateQuote = (items, profitPercent, taxPercent) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.unitPrice));
  }, 0);
  
  const profitAmount = subtotal * (Number(profitPercent) / 100);
  const beforeTax = subtotal + profitAmount;
  const taxAmount = beforeTax * (Number(taxPercent) / 100);
  const total = beforeTax + taxAmount;
  
  return {
    subtotal,
    profitAmount,
    taxAmount,
    total
  };
};

export const getQuotes = async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: { project: { include: { client: true } }, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuote = async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client: true } }, items: true }
    });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createQuote = async (req, res) => {
  try {
    const { projectId, items, profitMarginPercent, taxPercent, validUntil, notes, status, currency } = req.body;
    
    const calculations = calculateQuote(items || [], profitMarginPercent || 10, taxPercent || 16);
    
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        projectId,
        status: status || 'DRAFT',
        subtotal: calculations.subtotal,
        profitMarginPercent: profitMarginPercent || 10,
        profitAmount: calculations.profitAmount,
        taxPercent: taxPercent || 16,
        taxAmount: calculations.taxAmount,
        total: calculations.total,
        currency: currency || 'KES',
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        items: {
          create: items?.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: Number(item.quantity) * Number(item.unitPrice)
          })) || []
        }
      },
      include: { items: true, project: { include: { client: true } } }
    });
    
    res.status(201).json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const duplicateQuote = async (req, res) => {
  try {
    const original = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    
    if (!original) return res.status(404).json({ error: 'Quote not found' });
    
    const calculations = calculateQuote(original.items, original.profitMarginPercent, original.taxPercent);
    
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        projectId: original.projectId,
        status: 'DRAFT',
        subtotal: calculations.subtotal,
        profitMarginPercent: original.profitMarginPercent,
        profitAmount: calculations.profitAmount,
        taxPercent: original.taxPercent,
        taxAmount: calculations.taxAmount,
        total: calculations.total,
        currency: original.currency,
        items: {
          create: original.items.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      include: { items: true, project: { include: { client: true } } }
    });
    
    res.status(201).json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const { status, validUntil, notes, projectId } = req.body;
    
    let data = {};
    if (projectId) data.projectId = projectId;
    if (status) data.status = status;
    if (validUntil !== undefined) data.validUntil = validUntil ? new Date(validUntil) : null;
    if (notes !== undefined) data.notes = notes;
    
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data,
      include: { items: true, project: { include: { client: true } } }
    });
    
    res.json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    await prisma.quote.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};