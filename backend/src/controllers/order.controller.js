import { supabase } from '../config/supabase.js';

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const { address_id } = req.body;

    if (!address_id) {
      return res.status(400).json({ error: 'address_id is required to place an order' });
    }

    // Mock successful order placement response (matching docs/api_contract.md)
    return res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order_id: 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        total_amount: 25.98,
        status: 'pending',
        payment_status: 'unpaid',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};
