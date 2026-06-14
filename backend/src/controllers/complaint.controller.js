import { supabase } from '../config/supabase.js';
import { createNotificationForAdmins } from './notification.controller.js';

export const createComplaint = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user?.id;
    const { order_id, issue_type, description } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        user_id: userId,
        order_id,
        issue_type,
        description,
        status: 'open'
      })
      .select('*')
      .single();

    if (error) throw error;

    // Notify managers and staff of the new complaint
    try {
      await createNotificationForAdmins(
        'New Complaint Filed ⚠️',
        `Complaint filed for Order #${order_id.slice(0, 8).toUpperCase()} - Issue: ${issue_type}`,
        'support',
        order_id
      );
    } catch (notifErr) {
      console.error('Failed to trigger admin complaint notification:', notifErr.message);
    }

    return res.status(201).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('complaints')
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

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('complaints')
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
