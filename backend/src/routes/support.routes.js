import { Router } from 'express';
import {
  createTicket,
  getTickets,
  updateTicketStatus,
  escalateTicket,
  resolveTicket,
  closeTicket,
  refundTicket,
  compensateTicket
} from '../controllers/support.controller.js';
import { authenticate, authorizeStaff, authorizeManager } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', authorizeStaff, updateTicketStatus);
router.patch('/:id/escalate', authorizeStaff, escalateTicket);
router.patch('/:id/resolve', authorizeStaff, resolveTicket);
router.patch('/:id/close', authorizeStaff, closeTicket);
router.patch('/:id/refund', authorizeManager, refundTicket);
router.patch('/:id/compensate', authorizeManager, compensateTicket);

export default router;
