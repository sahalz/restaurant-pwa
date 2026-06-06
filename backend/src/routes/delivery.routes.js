import { Router } from 'express';
import {
  assignRider,
  updateDeliveryStatus,
  getDeliveryByOrder,
  getRiderDeliveries
} from '../controllers/delivery.controller.js';

const router = Router();

router.post('/assign', assignRider);
router.patch('/:id/status', updateDeliveryStatus);
router.get('/order/:orderId', getDeliveryByOrder);
router.get('/rider/:riderId', getRiderDeliveries);

export default router;
