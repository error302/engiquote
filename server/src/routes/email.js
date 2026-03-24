import express from 'express';
import * as emailController from '../controllers/email.js';

const router = express.Router();

router.post('/send-quote', emailController.sendQuote);

export default router;
