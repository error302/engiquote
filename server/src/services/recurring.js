import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateQuoteNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EQ-${dateStr}-${random}`;
};

export const processRecurringQuotes = async () => {
  const now = new Date();
  
  const dueRecurring = await prisma.recurringQuote.findMany({
    where: {
      active: true,
      nextRunDate: { lte: now },
    },
  });

  for (const recurring of dueRecurring) {
    try {
      const items = await prisma.quoteTemplateItem.findMany({
        where: { templateId: recurring.templateId },
      });

      const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.unitPrice));
      }, 0);

      const profitAmount = subtotal * (Number(recurring.profitMargin) / 100);
      const beforeTax = subtotal + profitAmount;
      const taxAmount = beforeTax * (Number(recurring.taxPercent) / 100);
      const total = beforeTax + taxAmount;

      const quote = await prisma.quote.create({
        data: {
          quoteNumber: generateQuoteNumber(),
          projectId: recurring.projectId,
          status: recurring.autoSend ? 'SENT' : 'DRAFT',
          subtotal,
          profitMarginPercent: recurring.profitMargin,
          profitAmount,
          taxPercent: recurring.taxPercent,
          taxAmount,
          total,
          currency: 'KES',
          validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          items: {
            create: items.map(item => ({
              category: item.category,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              total: Number(item.quantity) * Number(item.unitPrice),
            })),
          },
        },
      });

      let nextDate = new Date(recurring.nextRunDate);
      switch (recurring.frequency) {
        case 'WEEKLY':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'MONTHLY':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'YEARLY':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      await prisma.recurringQuote.update({
        where: { id: recurring.id },
        data: {
          lastRunDate: now,
          nextRunDate: nextDate,
        },
      });

      console.log(`Generated quote ${quote.quoteNumber} for recurring ${recurring.name}`);
    } catch (error) {
      console.error(`Failed to process recurring quote ${recurring.name}:`, error);
    }
  }
};

export const createRecurringQuote = async (data) => {
  const now = new Date();
  let nextRunDate = new Date(now);

  switch (data.frequency) {
    case 'WEEKLY':
      nextRunDate.setDate(nextRunDate.getDate() + 7);
      break;
    case 'MONTHLY':
      nextRunDate.setMonth(nextRunDate.getMonth() + 1);
      break;
    case 'QUARTERLY':
      nextRunDate.setMonth(nextRunDate.getMonth() + 3);
      break;
    case 'YEARLY':
      nextRunDate.setFullYear(nextRunDate.getFullYear() + 1);
      break;
  }

  return prisma.recurringQuote.create({
    data: {
      ...data,
      nextRunDate,
    },
  });
};

export const getRecurringQuotes = async () => {
  return prisma.recurringQuote.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateRecurringQuote = async (id, data) => {
  return prisma.recurringQuote.update({
    where: { id },
    data,
  });
};

export const deleteRecurringQuote = async (id) => {
  return prisma.recurringQuote.delete({ where: { id } });
};

export default { processRecurringQuotes, createRecurringQuote, getRecurringQuotes, updateRecurringQuote, deleteRecurringQuote };
