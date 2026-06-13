import { getAdminClient } from '../config/supabase.js';

/**
 * Helper function to find or create a user's cart
 */
const findOrCreateCart = async (supabase, userId) => {
  // 1. Try to find the cart
  const { data: cart, error: findError } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) throw findError;
  if (cart) return cart;

  // 2. If no cart exists, create a new one
  const { data: newCart, error: createError } = await supabase
    .from('cart')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (createError) throw createError;
  return newCart;
};

/**
 * Get current user's cart
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const userId = req.user.id;

    // 1. Get or create the cart
    const cart = await findOrCreateCart(supabase, userId);

    // 2. Fetch all cart items joined with menu_items
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        menu_item_id,
        menu_items (
          name,
          price,
          image_url
        )
      `)
      .eq('cart_id', cart.id);

    if (itemsError) {
      throw itemsError;
    }

    // 3. Format items array matching docs/api_contract.md
    const formattedItems = (cartItems || []).map((item) => ({
      cart_item_id: item.id,
      menu_item_id: item.menu_item_id,
      name: item.menu_items?.name || 'Unknown Item',
      price: item.menu_items?.price ? parseFloat(item.menu_items.price) : 0.00,
      quantity: item.quantity,
      image_url: item.menu_items?.image_url || null
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        cart_id: cart.id,
        items: formattedItems
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    next(error);
  }
};

/**
 * Add or update an item in the cart
 * POST /api/cart/items
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const userId = req.user.id;
    const { menu_item_id, quantity } = req.body;

    if (!menu_item_id || quantity === undefined) {
      return res.status(400).json({ error: 'menu_item_id and quantity are required' });
    }

    // 1. Get or create the cart
    const cart = await findOrCreateCart(supabase, userId);

    if (quantity <= 0) {
      // 2. Delete item if quantity is 0 or less
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
        .eq('menu_item_id', menu_item_id);

      if (deleteError) throw deleteError;
    } else {
      // 3. Check if the item already exists in the cart (to work around missing/differently named UNIQUE database constraints)
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('cart_id', cart.id)
        .eq('menu_item_id', menu_item_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        // Update the existing item's quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new cart item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            menu_item_id,
            quantity
          });

        if (insertError) throw insertError;
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    next(error);
  }
};
