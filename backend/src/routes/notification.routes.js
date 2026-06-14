import { Router } from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  setupNotificationSSEStream 
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// SSE Stream endpoint (uses query token auth)
router.get('/stream', setupNotificationSSEStream);

// Notification endpoints (protected)
router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.post('/read-all', authenticate, markAllAsRead);

export default router;
