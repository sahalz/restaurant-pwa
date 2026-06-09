import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all order routes
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id', authorizeStaff, updateOrderStatus);

export default router;
