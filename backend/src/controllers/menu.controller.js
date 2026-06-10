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

/**
 * Create a new menu item (Staff / Admin)
 * POST /api/menu
 */
export const createMenuItem = async (req, res, next) => {
  try {
    const { category_id, name, description, price, image_url, availability } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ error: 'Category ID, name, and price are required' });
    }

    const supabase = getAdminClient();
    const { data: newItem, error } = await supabase
      .from('menu_items')
      .insert({
        category_id,
        name: name.trim(),
        description: description ? description.trim() : null,
        price: parseFloat(price),
        image_url: image_url ? image_url.trim() : null,
        availability: availability !== undefined ? availability : true
      })
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      status: 'success',
      message: 'Menu item created successfully',
      data: {
        ...newItem,
        price: parseFloat(newItem.price)
      }
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    next(error);
  }
};

/**
 * Update a menu item (Staff / Admin)
 * PATCH /api/menu/:id
 */
export const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category_id, price, description, image_url, availability } = req.body;

    const supabase = getAdminClient();
    
    // Build update object dynamically based on what's passed
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category_id !== undefined) updateData.category_id = category_id;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (image_url !== undefined) updateData.image_url = image_url ? image_url.trim() : null;
    if (availability !== undefined) updateData.availability = availability;

    const { data: updatedItem, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Menu item updated successfully',
      data: {
        ...updatedItem,
        price: parseFloat(updatedItem.price)
      }
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    next(error);
  }
};
