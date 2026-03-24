import express from 'express';
import { createMarketplaceTemplate, getMarketplaceTemplates, getMarketplaceTemplate, downloadTemplate, rateMarketplaceTemplate, createMarketplaceRate, getMarketplaceRates, getRateCategories } from '../services/marketplace.js';

const router = express.Router();

router.post('/templates', async (req, res) => {
  try {
    const template = await createMarketplaceTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const templates = await getMarketplaceTemplates(req.query);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const template = await getMarketplaceTemplate(req.params.id);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/templates/:id/download', async (req, res) => {
  try {
    const template = await downloadTemplate(req.params.id, req.body.userId);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/templates/:id/rate', async (req, res) => {
  try {
    const template = await rateMarketplaceTemplate(req.params.id, req.body.rating);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rates', async (req, res) => {
  try {
    const rate = await createMarketplaceRate(req.body);
    res.status(201).json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rates', async (req, res) => {
  try {
    const rates = await getMarketplaceRates(req.query);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rates/categories', async (req, res) => {
  try {
    const categories = await getRateCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
