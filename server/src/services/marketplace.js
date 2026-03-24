import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMarketplaceTemplate = async (data) => {
  return prisma.marketplaceTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      projectType: data.projectType,
      price: data.price || 0,
      createdBy: data.createdBy,
      items: {
        create: data.items.map(item => ({
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
};

export const getMarketplaceTemplates = async (filters = {}) => {
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.projectType) where.projectType = filters.projectType;

  return prisma.marketplaceTemplate.findMany({
    where,
    include: { items: true },
    orderBy: { downloads: 'desc' },
  });
};

export const getMarketplaceTemplate = async (id) => {
  return prisma.marketplaceTemplate.findUnique({
    where: { id },
    include: { items: true },
  });
};

export const downloadTemplate = async (id, userId) => {
  const template = await prisma.marketplaceTemplate.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  await prisma.quoteTemplate.create({
    data: {
      name: template.name,
      description: template.description,
      projectType: template.projectType,
      items: {
        create: template.items.map(item => ({
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
      },
    },
  });

  return template;
};

export const rateMarketplaceTemplate = async (id, rating) => {
  return prisma.marketplaceTemplate.update({
    where: { id },
    data: { rating },
  });
};

export const createMarketplaceRate = async (data) => {
  return prisma.marketplaceRate.create({
    data,
  });
};

export const getMarketplaceRates = async (filters = {}) => {
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.region) where.region = filters.region;
  if (filters.year) where.year = filters.year;

  return prisma.marketplaceRate.findMany({
    where,
    orderBy: { category: 'asc' },
  });
};

export const getRateCategories = async () => {
  const rates = await prisma.marketplaceRate.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  return rates.map(r => r.category);
};

export const updateMarketplaceRate = async (id, data) => {
  return prisma.marketplaceRate.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
};

export const bulkUpdateRates = async (rates) => {
  const updates = rates.map(rate => 
    prisma.marketplaceRate.upsert({
      where: { id: rate.id || 'new' },
      update: {
        avgPrice: rate.avgPrice,
        minPrice: rate.minPrice,
        maxPrice: rate.maxPrice,
        updatedAt: new Date(),
      },
      create: rate,
    })
  );

  return Promise.all(updates);
};

export default {
  createMarketplaceTemplate,
  getMarketplaceTemplates,
  getMarketplaceTemplate,
  downloadTemplate,
  rateMarketplaceTemplate,
  createMarketplaceRate,
  getMarketplaceRates,
  getRateCategories,
  updateMarketplaceRate,
  bulkUpdateRates,
};
