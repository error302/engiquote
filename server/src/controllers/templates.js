import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTemplates = async (req, res) => {
  try {
    const templates = await prisma.quoteTemplate.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const template = await prisma.quoteTemplate.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, description, projectType, items } = req.body;
    const template = await prisma.quoteTemplate.create({
      data: {
        name,
        description,
        projectType,
        items: {
          create: items?.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity || 1,
            unit: item.unit,
            unitPrice: item.unitPrice
          })) || []
        }
      },
      include: { items: true }
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { name, description, projectType, items } = req.body;
    
    await prisma.quoteTemplateItem.deleteMany({
      where: { templateId: req.params.id }
    });

    const template = await prisma.quoteTemplate.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        projectType,
        items: {
          create: items?.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity || 1,
            unit: item.unit,
            unitPrice: item.unitPrice
          })) || []
        }
      },
      include: { items: true }
    });
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    await prisma.quoteTemplate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
