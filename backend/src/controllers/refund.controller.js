import { supabase } from '../config/supabase.js';

/**
 * Create a new refund request
 * POST /api/refunds
 */
export const createRefundRequest = async (req, res, next) => {
  try {
    const { user_id, order_id, reason, amount } = req.body;

    if (!user_id || !order_id) {
      return res.status(400).json({ error: 'user_id and order_id are required' });
    }

    const { data, error } = await supabase
      .from('refund_requests')
      .insert({
        user_id,
        order_id,
        reason,
        amount,
        status: 'Pending'
      })
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all refund requests
 * GET /api/refunds
 */
export const getRefundRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('refund_requests')
      .select('*');

    if (userRole === 'customer') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update refund status
 * PATCH /api/refunds/:id
 */
export const updateRefundStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const { data, error } = await supabase
      .from('refund_requests')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};
