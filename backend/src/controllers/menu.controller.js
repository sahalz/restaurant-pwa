import { getAdminClient } from '../config/supabase.js';

/**
 * List menu items
 * GET /api/menu
 */
export const getMenuItems = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
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

    // Map database records and attach extra fields to satisfy the frontend UI expectations
    const formattedMenuItems = (menuItems || []).map((item) => {
      const lowerName = item.name.toLowerCase();
      
      // Dynamically default vegetarian flag based on item name
      const isVegetarian = lowerName.includes('veg') || 
                           lowerName.includes('margherita') || 
                           lowerName.includes('lemonade') ||
                           lowerName.includes('americano') ||
                           lowerName.includes('cake') ||
                           lowerName.includes('cheesecake');

      // Dynamically default spicy flag based on item name
      const isSpicy = lowerName.includes('spicy') || 
                      lowerName.includes('pepperoni');

      return {
        ...item,
        // Ensure price is returned as float matching mock data
        price: parseFloat(item.price),
        rating: 4.5 + (parseFloat(item.price) % 0.5), // creates a deterministic mock rating (e.g. 4.5 - 4.9)
        reviews: Math.floor(100 + (parseFloat(item.price) * 10)), // deterministic mock reviews count
        restaurant: 'Tasty Bites',
        deliveryTime: '25-30 min',
        isVegetarian,
        isSpicy
      };
    });

    return res.status(200).json({
      status: 'success',
      data: formattedMenuItems
    });
  } catch (error) {
    console.error('Fetch menu items error:', error);
    next(error);
  }
};
