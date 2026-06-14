import { Router } from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, getPopularMenuItems } from '../controllers/menu.controller.js';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getMenuItems);
router.get('/popular', getPopularMenuItems);
router.post('/', authenticate, authorizeStaff, createMenuItem);
router.patch('/:id', authenticate, authorizeStaff, updateMenuItem);

export default router;
