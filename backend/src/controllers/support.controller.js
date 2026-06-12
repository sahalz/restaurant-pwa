import { getAdminClient } from '../config/supabase.js';

const supabase = getAdminClient();

export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, user_id } = req.body;

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          subject,
          description,
          user_id,
          status: 'open'
        }
      ])
      .select()
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
