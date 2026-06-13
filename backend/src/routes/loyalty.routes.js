import express from 'express';
import { getLoyaltyProfile, getLoyaltySettings, updateLoyaltySettings } from '../controllers/loyalty.controller.js';
import { authenticate, authorizeManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// All loyalty endpoints require authentication
router.use(authenticate);

router.get('/profile', getLoyaltyProfile);
router.get('/settings', getLoyaltySettings);
router.put('/settings', authorizeManager, updateLoyaltySettings);

export default router;
