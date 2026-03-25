import express from 'express';
import { PrismaClient } from '@prisma/client';
import { generateCashFlow, getDailyBurnSummary } from '../services/cashflow.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/generate', async (req, res) => {
  try {
    const { projectId, curve } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        quotes: {
          where: { status: 'ACCEPTED' },
          select: { total: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.startDate || !project.endDate) {
      return res.status(400).json({ error: 'Project start and end dates required' });
    }

    const grandTotal = project.quotes.reduce((sum, q) => sum + Number(q.total), 0);

    const weeks = generateCashFlow({
      grandTotalKsh: grandTotal,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      curve: curve || 'S_CURVE',
    });

    const summary = getDailyBurnSummary(weeks);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        cashFlow: weeks,
        dailyBurnKsh: summary.averageDailyBurnKsh,
        peakDailyBurnKsh: summary.peakDailyBurnKsh,
        cashFlowCurve: curve || 'S_CURVE',
      },
    });

    res.json({ weeks, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:projectId', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      select: {
        cashFlow: true,
        cashFlowCurve: true,
        dailyBurnKsh: true,
        peakDailyBurnKsh: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!project || !project.cashFlow) {
      return res.status(404).json({ error: 'Cash flow not generated' });
    }

    const weeks = project.cashFlow;
    const summary = getDailyBurnSummary(weeks);

    res.json({
      weeks,
      summary,
      curve: project.cashFlowCurve,
      startDate: project.startDate,
      endDate: project.endDate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:projectId/curve', async (req, res) => {
  try {
    const { curve } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        quotes: {
          where: { status: 'ACCEPTED' },
          select: { total: true },
        },
      },
    });

    if (!project || !project.startDate || !project.endDate) {
      return res.status(404).json({ error: 'Project not found or missing dates' });
    }

    const grandTotal = project.quotes.reduce((sum, q) => sum + Number(q.total), 0);

    const weeks = generateCashFlow({
      grandTotalKsh: grandTotal,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      curve: curve || 'S_CURVE',
    });

    const summary = getDailyBurnSummary(weeks);

    await prisma.project.update({
      where: { id: req.params.projectId },
      data: {
        cashFlow: weeks,
        cashFlowCurve: curve,
        dailyBurnKsh: summary.averageDailyBurnKsh,
        peakDailyBurnKsh: summary.peakDailyBurnKsh,
      },
    });

    res.json({ weeks, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;