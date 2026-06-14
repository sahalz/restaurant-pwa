import { Router } from 'express';
import { rateOrderItems, getOrderRatings } from '../controllers/rating.controller.js';
import { getMenuItemRatings } from '../controllers/rating.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Order-level ratings (nested under /api/orders)
router.post('/:orderId/rate', authenticate, rateOrderItems);
router.get('/:orderId/rate', authenticate, getOrderRatings);

export default router;

export { getMenuItemRatings };
