import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  updateComplaintStatus
} from '../controllers/complaint.controller.js';

const router = Router();

router.post('/', createComplaint);
router.get('/', getComplaints);
router.patch('/:id', updateComplaintStatus);

export default router;
