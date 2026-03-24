import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getLaborRates = async (req, res) => {
  try {
    const rates = await prisma.laborRate.findMany({
      orderBy: { role: 'asc' }
    });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createLaborRate = async (req, res) => {
  try {
    const rate = await prisma.laborRate.create({
      data: req.body
    });
    res.status(201).json(rate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateLaborRate = async (req, res) => {
  try {
    const rate = await prisma.laborRate.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(rate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteLaborRate = async (req, res) => {
  try {
    await prisma.laborRate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
