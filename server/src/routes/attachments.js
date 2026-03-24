import express from 'express';
import * as attachmentsController from '../controllers/attachments.js';

const router = express.Router();

router.post('/upload', attachmentsController.uploadMiddleware, attachmentsController.uploadAttachment);
router.get('/', attachmentsController.getAttachments);
router.get('/:id', attachmentsController.getAttachment);
router.delete('/:id', attachmentsController.deleteAttachment);

export default router;
