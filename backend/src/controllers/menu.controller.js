import { supabase } from '../config/supabase.js';

/**
 * List menu items
 * GET /api/menu
 */
export const getMenuItems = async (req, res, next) => {
  try {
    const { category_id } = req.query;

    // If Supabase is fully configured, try fetching from the database
    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_project_url') {
      let query = supabase.from('MenuItems').select('*');
      if (category_id) {
        query = query.eq('category_id', category_id);
      }
      const { data, error } = await query;
      if (!error && data) {
        return res.status(200).json({ status: 'success', data });
      }
    }

    // Fallback Mock Menu Items
    const mockMenuItems = [
      {
        id: 'e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89',
        category_id: category_id || 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, basil, and organic tomato sauce.',
        price: 12.99,
        image_url: 'https://images.restaurantpwa.com/pizza.jpg',
        availability: true
      },
      {
        id: 'f5d8e9b0-3cg4-58b3-0g4b-8g7e2d3b1c90',
        category_id: category_id || 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        name: 'Veg Burger',
        description: 'Crispy patty, lettuce, tomato, and chef secret sauce.',
        price: 8.49,
        image_url: 'https://images.restaurantpwa.com/burger.jpg',
        availability: true
      }
    ];

    return res.status(200).json({
      status: 'success',
      data: mockMenuItems
    });
  } catch (error) {
    next(error);
  }
};
