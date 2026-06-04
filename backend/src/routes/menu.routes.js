import { Router } from 'express';
import { getMenuItems } from '../controllers/menu.controller.js';

const router = Router();

router.get('/', getMenuItems);

export default router;
