import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const company = await prisma.company.create({
      data: {
        ...req.body,
        settings: {
          create: req.body.settings || {},
        },
      },
      include: { settings: true },
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { settings: true },
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { settings: true, users: { include: { user: true } } },
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body,
      include: { settings: true },
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/settings', async (req, res) => {
  try {
    const settings = await prisma.companySettings.upsert({
      where: { companyId: req.params.id },
      update: req.body,
      create: { companyId: req.params.id, ...req.body },
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/users', async (req, res) => {
  try {
    const { userId, role } = req.body;
    const companyUser = await prisma.companyUser.create({
      data: {
        companyId: req.params.id,
        userId,
        role,
      },
      include: { user: true },
    });
    res.status(201).json(companyUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/users/:userId', async (req, res) => {
  try {
    await prisma.companyUser.deleteMany({
      where: {
        companyId: req.params.id,
        userId: req.params.userId,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
