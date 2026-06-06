import { Router } from 'express';
import {
  createTicket,
  getTickets,
  updateTicketStatus
} from '../controllers/support.controller.js';

const router = Router();

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', updateTicketStatus);

export default router;
