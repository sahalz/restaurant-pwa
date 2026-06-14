import { getAdminClient } from '../config/supabase.js';
import { createNotification, createNotificationForAdmins } from './notification.controller.js';

const supabase = getAdminClient();

export const createTicket = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user?.id;
    const { subject, description } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          subject,
          description,
          user_id: userId,
          status: 'open'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Notify managers and staff of the new support ticket
    try {
      await createNotificationForAdmins(
        'New Support Ticket 💬',
        `Ticket #${data.id.slice(0, 8).toUpperCase()} - ${subject}`,
        'support',
        data.id
      );
    } catch (notifErr) {
      console.error('Failed to trigger admin support ticket notification:', notifErr.message);
    }

    return res.status(201).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('support_tickets')
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

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Trigger support ticket notification
    try {
      const statusMessages = {
        escalated: 'Your support ticket has been escalated to a manager for review.',
        resolved: 'Your support ticket has been marked as resolved. Thank you!',
        closed: 'Your support ticket has been closed.',
        refunded: 'Your refund request has been approved and processed.',
        compensated: 'A compensation coupon has been issued for your ticket.'
      };

      const message = statusMessages[status] || `Your support ticket status has been updated to ${status}.`;

      await createNotification(
        data.user_id,
        'Support Ticket Update 💬',
        message,
        'support',
        data.id
      );
    } catch (notifErr) {
      console.error('Failed to trigger support ticket notification:', notifErr.message);
    }

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const escalateTicket = async (req, res, next) => {
  req.body.status = 'escalated';
  return updateTicketStatus(req, res, next);
};

export const resolveTicket = async (req, res, next) => {
  req.body.status = 'resolved';
  return updateTicketStatus(req, res, next);
};

export const closeTicket = async (req, res, next) => {
  req.body.status = 'closed';
  return updateTicketStatus(req, res, next);
};

export const refundTicket = async (req, res, next) => {
  req.body.status = 'refunded';
  return updateTicketStatus(req, res, next);
};

export const compensateTicket = async (req, res, next) => {
  req.body.status = 'compensated';
  return updateTicketStatus(req, res, next);
};
