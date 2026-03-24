import express from 'express';
import { createAuditLog, getAuditLogs, getAuditLogsForEntity, getAuditStats } from '../services/audit.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const logs = await getAuditLogs(req.query);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/entity/:type/:id', async (req, res) => {
  try {
    const logs = await getAuditLogsForEntity(req.params.type, req.params.id);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;
    const stats = await getAuditStats(companyId, new Date(startDate), new Date(endDate));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
