import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/share', async (req, res) => {
  try {
    const { projectId, clientName, clientEmail } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        quotes: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const share = await prisma.quoteShare.create({
      data: {
        projectId,
        clientName,
        clientEmail,
        status: 'PENDING',
        expiresAt,
      },
    });

    res.status(201).json({
      shareId: share.id,
      token: share.token,
      url: `/portal/shared/${share.token}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/token/:token', async (req, res) => {
  try {
    const share = await prisma.quoteShare.findUnique({
      where: { token: req.params.token },
      include: {
        project: {
          include: {
            client: true,
            quotes: {
              include: { items: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!share) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).json({ error: 'This quote has expired' });
    }

    if (!share.viewedAt) {
      await prisma.quoteShare.update({
        where: { id: share.id },
        data: { viewedAt: new Date(), status: 'VIEWED' },
      });
    }

    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/token/:token/approve', async (req, res) => {
  try {
    const share = await prisma.quoteShare.findUnique({
      where: { token: req.params.token },
    });

    if (!share) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const updated = await prisma.quoteShare.update({
      where: { id: share.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/token/:token/revision', async (req, res) => {
  try {
    const { comments } = req.body;

    const share = await prisma.quoteShare.findUnique({
      where: { token: req.params.token },
    });

    if (!share) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const updated = await prisma.quoteShare.update({
      where: { id: share.id },
      data: {
        status: 'REVISION_REQUESTED',
        comments,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-projects', async (req, res) => {
  try {
    const shares = await prisma.quoteShare.findMany({
      include: {
        project: {
          include: { client: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(shares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;