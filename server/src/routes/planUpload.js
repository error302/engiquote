import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { extractFromManualInput, extractFromPDFInput } from '../services/planParser.js';

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/extract', upload.single('file'), async (req, res) => {
  try {
    const { projectId, inputType } = req.body;
    const file = req.file;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    let extracted;

    if (inputType === 'MANUAL' && req.body.dimensions) {
      const dims = JSON.parse(req.body.dimensions);
      extracted = extractFromManualInput({
        floorAreaSqm: dims.floorArea,
        wallPerimeterLm: dims.wallPerimeter,
        openingsCount: dims.openings,
        storeys: dims.storeys || 1,
      });
    } else if (inputType === 'PDF' && req.body.dimensions) {
      const dims = JSON.parse(req.body.dimensions);
      extracted = extractFromPDFInput({
        dimensions: dims,
        floors: dims.floors || 1,
        openings: { doors: dims.doors || 0, windows: dims.windows || 0 },
      });
    } else if (inputType === 'DXF' && file) {
      const content = file.buffer.toString('utf-8');
      const { parseDXFContent } = await import('../services/planParser.js');
      extracted = parseDXFContent(content);
    } else {
      return res.status(400).json({ error: 'Invalid input type or missing data' });
    }

    const planUpload = await prisma.planUpload.upsert({
      where: { projectId },
      update: {
        fileType: inputType,
        extracted,
        confidence: extracted.confidence,
        warnings: extracted.warnings,
      },
      create: {
        projectId,
        fileType: inputType,
        fileUrl: '',
        extracted,
        confidence: extracted.confidence,
        warnings: extracted.warnings,
      },
    });

    res.json({
      planUpload,
      extracted,
      prefill: {
        floorAreaSqm: extracted.totalFloorArea,
        wallPerimeterLm: extracted.wallPerimeter,
        openingsCount: extracted.openings,
        storeys: extracted.storeys,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:projectId', async (req, res) => {
  try {
    const planUpload = await prisma.planUpload.findUnique({
      where: { projectId: req.params.projectId },
    });
    res.json(planUpload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:projectId/confirm', async (req, res) => {
  try {
    const { confirmed } = req.body;
    const planUpload = await prisma.planUpload.update({
      where: { projectId: req.params.projectId },
      data: { confirmed },
    });
    res.json(planUpload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;