import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { processPayment } from '../controllers/payment.controller.js';

const router = Router();

// Protect all payment routes
router.use(authenticate);

// POST /payments/process
router.post('/process', processPayment);

export default router;
