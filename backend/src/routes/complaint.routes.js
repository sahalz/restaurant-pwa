import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  updateComplaintStatus
} from '../controllers/complaint.controller.js';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createComplaint);
router.get('/', getComplaints);
router.patch('/:id', authorizeStaff, updateComplaintStatus);

export default router;
