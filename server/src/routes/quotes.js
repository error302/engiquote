import express from 'express';
import * as quoteController from '../controllers/quotes.js';

const router = express.Router();

router.get('/', quoteController.getQuotes);
router.get('/:id', quoteController.getQuote);
router.post('/', quoteController.createQuote);
router.post('/:id/duplicate', quoteController.duplicateQuote);
router.put('/:id', quoteController.updateQuote);
router.delete('/:id', quoteController.deleteQuote);

export default router;