import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createAddress,
  getAddresses,
  deleteAddress
} from '../controllers/address.controller.js';

const router = Router();

// Protect all address routes
router.use(authenticate);

router.post('/', createAddress);
router.get('/', getAddresses);
router.delete('/:id', deleteAddress);

export default router;
