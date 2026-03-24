import express from 'express';
import * as materialsController from '../controllers/materials.js';

const router = express.Router();

router.get('/', materialsController.getMaterials);
router.post('/', materialsController.createMaterial);
router.put('/:id', materialsController.updateMaterial);
router.delete('/:id', materialsController.deleteMaterial);

export default router;
