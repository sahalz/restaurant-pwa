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
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*');

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
