import express from 'express';
import * as invoicesController from '../controllers/invoices.js';

const router = express.Router();

router.get('/', invoicesController.getInvoices);
router.get('/:id', invoicesController.getInvoice);
router.post('/', invoicesController.createInvoice);
router.post('/from-quote', invoicesController.createFromQuote);
router.put('/:id', invoicesController.updateInvoice);
router.post('/:id/payments', invoicesController.addPayment);
router.delete('/:id', invoicesController.deleteInvoice);

export default router;
