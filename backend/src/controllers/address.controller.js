import { supabase } from '../config/supabase.js';

/**
 * Save a new user address
 * POST /api/addresses
 */
export const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address, city, state, pincode } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Street address is required' });
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        address,
        city,
        state,
        pincode
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
 * Get all saved addresses for the authenticated user
 * GET /api/addresses
 */
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);

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
 * Delete a user address
 * DELETE /api/addresses/:id
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Address not found or unauthorized' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};
