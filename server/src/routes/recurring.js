import express from 'express';
import { createRecurringQuote, getRecurringQuotes, updateRecurringQuote, deleteRecurringQuote, processRecurringQuotes } from '../services/recurring.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const recurring = await createRecurringQuote(req.body);
    res.status(201).json(recurring);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const recurring = await getRecurringQuotes();
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const recurring = await updateRecurringQuote(req.params.id, req.body);
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteRecurringQuote(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/process', async (req, res) => {
  try {
    await processRecurringQuotes();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
