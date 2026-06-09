import { supabase } from '../config/supabase.js';

export const createComplaint = async (req, res, next) => {
  try {
    const { user_id, order_id, issue_type, description } = req.body;

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        user_id,
        order_id,
        issue_type,
        description,
        status: 'open'
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
