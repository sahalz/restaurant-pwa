import { Router } from 'express';
import { getCart, updateCartItem } from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all cart routes
router.use(authenticate);

router.get('/', getCart);
router.post('/items', updateCartItem);

export default router;
