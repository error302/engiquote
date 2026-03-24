import express from 'express';
import * as templatesController from '../controllers/templates.js';

const router = express.Router();

router.get('/', templatesController.getTemplates);
router.get('/:id', templatesController.getTemplate);
router.post('/', templatesController.createTemplate);
router.put('/:id', templatesController.updateTemplate);
router.delete('/:id', templatesController.deleteTemplate);

export default router;
