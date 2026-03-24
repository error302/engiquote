import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  companyName: 'Engineering Company',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  defaultTaxRate: '16',
  defaultProfitMargin: '10',
  quoteValidityDays: '30'
};

export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsObj = { ...DEFAULT_SETTINGS };
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    const settings = await prisma.setting.findMany();
    const settingsObj = { ...DEFAULT_SETTINGS };
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
