import express from 'express';
import * as authController from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);

// Admin routes
router.get('/users', authenticate, authController.getUsers);
router.put('/users/:id/toggle', authenticate, authController.toggleUserStatus);

export default router;
