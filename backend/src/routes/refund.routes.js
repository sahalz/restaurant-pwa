import { Router } from 'express';
import {
  createRefundRequest,
  getRefundRequests,
  updateRefundStatus
} from '../controllers/refund.controller.js';
import { authenticate, authorizeManager } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createRefundRequest);
router.get('/', getRefundRequests);
router.patch('/:id', authorizeManager, updateRefundStatus);

export default router;
