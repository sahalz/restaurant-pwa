import { Router } from 'express';
import {
  assignRider,
  updateDeliveryStatus,
  getDeliveryByOrder,
  getRiderDeliveries
} from '../controllers/delivery.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/assign', assignRider);
router.patch('/:id/status', updateDeliveryStatus);
router.get('/order/:orderId', getDeliveryByOrder);
router.get('/rider/:riderId', getRiderDeliveries);

export default router;
