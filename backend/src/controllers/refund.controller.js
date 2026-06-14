import { supabase } from '../config/supabase.js';
import { createNotification, createNotificationForAdmins } from './notification.controller.js';

/**
 * Create a new refund request
 * POST /api/refunds
 */
export const createRefundRequest = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user?.id;
    const { order_id, reason, amount } = req.body;

    if (!userId || !order_id) {
      return res.status(400).json({ error: 'user_id and order_id are required' });
    }

    const { data, error } = await supabase
      .from('refund_requests')
      .insert({
        user_id: userId,
        order_id,
        reason,
        amount,
        status: 'Pending'
      })
      .select('*')
      .single();

    if (error) throw error;

    // Notify managers and staff of the new refund request
    try {
      await createNotificationForAdmins(
        'New Refund Request 💸',
        `Refund requested for Order #${order_id.slice(0, 8).toUpperCase()} of ₹${parseFloat(amount || 0).toFixed(2)}`,
        'support',
        order_id
      );
    } catch (notifErr) {
      console.error('Failed to trigger admin refund request notification:', notifErr.message);
    }

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

    // Notify customer about refund status update
    try {
      await createNotification(
        data.user_id,
        'Refund Status Update 💸',
        `Your refund request for Order #${data.order_id?.slice(0, 8).toUpperCase()} has been ${status.toLowerCase()}.`,
        'support',
        data.order_id
      );
    } catch (notifErr) {
      console.error('Failed to trigger customer refund status notification:', notifErr.message);
    }

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};
