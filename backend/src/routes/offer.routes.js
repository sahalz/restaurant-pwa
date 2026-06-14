import { Router } from 'express';
import {
  getOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  calculateOfferDiscount
} from '../controllers/offer.controller.js';
import { authenticate, authorizeManager } from '../middleware/auth.middleware.js';

const router = Router();

// Public — customers see today's active offers
router.get('/', getOffers);

// Authenticated — calculate applicable discount for a cart
router.post('/calculate', authenticate, calculateOfferDiscount);

// Manager-only CRUD
router.post('/', authenticate, authorizeManager, createOffer);
router.put('/:id', authenticate, authorizeManager, updateOffer);
router.patch('/:id/status', authenticate, authorizeManager, toggleOfferStatus);
router.delete('/:id', authenticate, authorizeManager, deleteOffer);

export default router;
