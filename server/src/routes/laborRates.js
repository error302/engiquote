import express from 'express';
import * as laborRatesController from '../controllers/laborRates.js';

const router = express.Router();

router.get('/', laborRatesController.getLaborRates);
router.post('/', laborRatesController.createLaborRate);
router.put('/:id', laborRatesController.updateLaborRate);
router.delete('/:id', laborRatesController.deleteLaborRate);

export default router;
