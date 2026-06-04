import { Router } from 'express';
import { createOrder } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all order routes
router.use(authenticate);

router.post('/', createOrder);

export default router;
