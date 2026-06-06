import { Router } from 'express';
import { createTicket, getTickets } from '../controllers/support.controller.js';

const router = Router();

router.post('/', createTicket);
router.get('/', getTickets);

export default router;
