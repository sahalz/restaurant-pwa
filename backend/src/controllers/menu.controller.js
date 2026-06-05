import { supabase } from '../config/supabase.js';

/**
 * List menu items
 * GET /api/menu
 */
export const getMenuItems = async (req, res, next) => {
  try {
    const { category_id } = req.query;

    let query = supabase
      .from('menu_items')
      .select('*')
      .order('name');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data: menuItems, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: menuItems || []
    });
  } catch (error) {
    console.error('Fetch menu items error:', error);
    next(error);
  }
};
