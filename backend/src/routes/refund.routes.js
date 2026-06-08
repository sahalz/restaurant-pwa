import { Router } from 'express';
import {
  createRefundRequest,
  getRefundRequests,
  updateRefundStatus
} from '../controllers/refund.controller.js';

const router = Router();

router.post('/', createRefundRequest);
router.get('/', getRefundRequests);
router.patch('/:id', updateRefundStatus);

export default router;
