import { supabase } from '../config/supabase.js';

/**
 * Get current user's cart
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12';

    // Mock response matching docs/api_contract.md
    return res.status(200).json({
      status: 'success',
      data: {
        cart_id: 'd1c2b3a4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        items: [
          {
            cart_item_id: 'f1e2d3c4-5b6a-7f8e-9d0c-1b2a3f4e5d6c',
            menu_item_id: 'e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89',
            name: 'Margherita Pizza',
            price: 12.99,
            quantity: 2
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or update an item in the cart
 * POST /api/cart/items
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { menu_item_id, quantity } = req.body;

    if (!menu_item_id || quantity === undefined) {
      return res.status(400).json({ error: 'menu_item_id and quantity are required' });
    }

    // Mock successful update response
    return res.status(200).json({
      status: 'success',
      message: 'Cart updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
