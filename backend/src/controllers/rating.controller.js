import { supabase } from '../config/supabase.js';

/**
 * POST /api/orders/:orderId/rate
 * Customer submits ratings (1-5) for each item in a delivered order
 * Body: { ratings: [{menu_item_id, rating, review?}] }
 */
export const rateOrderItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { ratings } = req.body;

    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ error: 'ratings array is required' });
    }

    // Verify order belongs to user and is delivered
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== userId) return res.status(403).json({ error: 'Access denied' });
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'You can only rate items from delivered orders' });
    }

    // Validate and prepare insert rows
    const rowsToInsert = [];
    for (const r of ratings) {
      if (!r.menu_item_id) continue;
      const rating = parseInt(r.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: `Invalid rating ${r.rating} — must be 1 to 5` });
      }
      rowsToInsert.push({
        user_id: userId,
        order_id: orderId,
        menu_item_id: r.menu_item_id,
        rating,
        review: r.review ? r.review.trim() : null
      });
    }

    if (rowsToInsert.length === 0) {
      return res.status(400).json({ error: 'No valid ratings provided' });
    }

    // Upsert — update if already rated same order+item
    const { data: inserted, error: insertError } = await supabase
      .from('item_ratings')
      .upsert(rowsToInsert, { onConflict: 'user_id,order_id,menu_item_id' })
      .select('*');

    if (insertError) {
      if (insertError.code === 'PGRST116' || insertError.code === '42P01') {
        return res.status(503).json({ error: 'Ratings table not found. Please run the offers_and_ratings.sql migration.' });
      }
      throw insertError;
    }

    return res.status(200).json({
      status: 'success',
      message: 'Ratings submitted successfully',
      data: inserted
    });
  } catch (error) {
    console.error('Rate order items error:', error);
    next(error);
  }
};

/**
 * GET /api/orders/:orderId/rate
 * Check if customer has already rated an order
 */
export const getOrderRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const { data: ratings, error } = await supabase
      .from('item_ratings')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return res.status(200).json({ status: 'success', data: [] });
      }
      throw error;
    }

    return res.status(200).json({ status: 'success', data: ratings || [] });
  } catch (error) {
    console.error('Get order ratings error:', error);
    next(error);
  }
};

/**
 * GET /api/menu/:itemId/ratings
 * Get average rating and review count for a menu item
 */
export const getMenuItemRatings = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const { data: ratings, error } = await supabase
      .from('item_ratings')
      .select('rating')
      .eq('menu_item_id', itemId);

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return res.status(200).json({ status: 'success', data: { average: 0, count: 0 } });
      }
      throw error;
    }

    const count = ratings ? ratings.length : 0;
    const average = count > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

    return res.status(200).json({
      status: 'success',
      data: { average: parseFloat(average.toFixed(1)), count }
    });
  } catch (error) {
    console.error('Get menu item ratings error:', error);
    next(error);
  }
};
