import { supabase } from '../config/supabase.js';

export const assignRider = async (req, res, next) => {
  try {
    const { order_id, assigned_rider } = req.body;

    const { data, error } = await supabase
      .from('delivery_tracking')
      .insert({
        order_id,
        assigned_rider,
        delivery_status: 'assigned'
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

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { delivery_status } = req.body;

    const { data, error } = await supabase
      .from('delivery_tracking')
      .update({
        delivery_status,
        updated_at: new Date()
      })
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

export const getDeliveryByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabase
      .from('delivery_tracking')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getRiderDeliveries = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    const { data, error } = await supabase
      .from('delivery_tracking')
      .select('*')
      .eq('assigned_rider', riderId);

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};
