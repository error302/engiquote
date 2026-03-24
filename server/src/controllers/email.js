import { PrismaClient } from '@prisma/client';
import { sendQuoteEmail } from '../services/email.js';

const prisma = new PrismaClient();

export const sendQuote = async (req, res) => {
  try {
    const { quoteId, to } = req.body;

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { 
        project: { 
          include: { client: true } 
        },
        items: true 
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const settings = await prisma.setting.findMany();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });

    const result = await sendQuoteEmail({
      to: to || quote.project.client.email,
      quote,
      client: quote.project.client,
      project: quote.project,
      companySettings: settingsObj
    });

    if (result.success) {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'SENT' }
      });
      res.json({ success: true, message: 'Quote sent successfully' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
