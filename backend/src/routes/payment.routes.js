import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect payment routes
router.use(authenticate);

// POST /payments/process
router.post('/process', async (req, res, next) => {
  try {
    const { order_id, payment_method, transaction_id } = req.body;
    if (!order_id || !payment_method || !transaction_id) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    // Stub response matching api_contract.md success response
    return res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        payment_id: 'p1o2i3u4-y5t6-r7e8-w9q0-m1n2b3v4c5x6',
        status: 'success',
        amount: 25.98 // Placeholder amount, dynamic in production
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
