import express from 'express';
import { createApprovalWorkflow, getApprovalWorkflows, checkQuoteApproval, approveQuote, rejectQuote, getPendingApprovals } from '../services/approvals.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const workflow = await createApprovalWorkflow(req.body);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const workflows = await getApprovalWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending/:userId', async (req, res) => {
  try {
    const pending = await getPendingApprovals(req.params.userId);
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/quote/:quoteId', async (req, res) => {
  try {
    const approval = await checkQuoteApproval(req.params.quoteId);
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quote/:quoteId/approve', async (req, res) => {
  try {
    const { approverId, comments } = req.body;
    const result = await approveQuote(req.params.quoteId, approverId, comments);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quote/:quoteId/reject', async (req, res) => {
  try {
    const { approverId, comments } = req.body;
    const result = await rejectQuote(req.params.quoteId, approverId, comments);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
