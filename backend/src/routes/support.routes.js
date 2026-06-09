import { Router } from 'express';
import {
  createTicket,
  getTickets,
  updateTicketStatus
} from '../controllers/support.controller.js';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', authorizeStaff, updateTicketStatus);

export default router;
