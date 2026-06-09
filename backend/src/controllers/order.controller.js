import { supabase } from '../config/supabase.js';

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address_id } = req.body;

    if (!address_id) {
      return res.status(400).json({ error: 'address_id is required to place an order' });
    }

    // 1. Get the user's cart
    const { data: cart, error: cartError } = await supabase
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError) throw cartError;
    if (!cart) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 2. Fetch the cart items along with menu_items details
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        menu_item_id,
        menu_items (
          price
        )
      `)
      .eq('cart_id', cart.id);

    if (itemsError) throw itemsError;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'No items in cart to check out' });
    }

    // 3. Calculate total amount
    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of cartItems) {
      const price = item.menu_items?.price ? parseFloat(item.menu_items.price) : 0;
      totalAmount += price * item.quantity;
      orderItemsToInsert.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: price
      });
    }

    // 4. Create the main Order record
    const { data: newOrder, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'unpaid'
      })
      .select('*')
      .single();

    if (orderInsertError) throw orderInsertError;

    // 5. Create OrderItems records mapping to the newly created order
    const orderItemsPayload = orderItemsToInsert.map(item => ({
      ...item,
      order_id: newOrder.id
    }));

    const { error: itemsInsertError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsInsertError) {
      // Cleanup created order if items fail to insert (manual transaction roll back)
      await supabase.from('orders').delete().eq('id', newOrder.id);
      throw itemsInsertError;
    }

    // 6. Clear all items from the user's cart
    const { error: cartCleanupError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (cartCleanupError) {
      console.warn('Warning: Failed to clear cart items after checkout:', cartCleanupError);
    }

    // 7. Return response matching docs/api_contract.md
    return res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order_id: newOrder.id,
        total_amount: parseFloat(newOrder.total_amount),
        status: newOrder.status,
        payment_status: newOrder.payment_status,
        created_at: newOrder.created_at
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
  }
};

/**
 * Get all orders for the authenticated user
 * GET /api/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        payment_status,
        created_at,
        users (
          name,
          email,
          phone
        ),
        order_items (
          id,
          quantity,
          price,
          menu_item_id,
          menu_items (
            name,
            image_url
          )
        ),
        payments (
          payment_method
        )
      `);

    if (userRole === 'customer') {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data: orders || []
    });
  } catch (error) {
    console.error('Get orders error:', error);
    next(error);
  }
};

/**
 * Get a single order by ID for the authenticated user
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        payment_status,
        created_at,
        order_items (
          id,
          quantity,
          price,
          menu_item_id,
          menu_items (
            name,
            image_url
          )
        ),
        payments (
          payment_method
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    next(error);
  }
};

/**
 * Update order status (Staff / Admin)
 * PATCH /api/orders/:id
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: updatedOrder, error: orderError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (orderError) throw orderError;

    // Check if delivery tracking entry exists
    const { data: existingTracking, error: selectError } = await supabase
      .from('delivery_tracking')
      .select('id')
      .eq('order_id', id)
      .maybeSingle();

    if (selectError) throw selectError;

    // Map order status to delivery tracking status
    let deliveryStatus = 'assigned';
    if (status === 'preparing') deliveryStatus = 'preparing';
    else if (status === 'ready' || status === 'ready_for_pickup') deliveryStatus = 'ready';
    else if (status === 'rider_assigned') deliveryStatus = 'rider_assigned';
    else if (status === 'out_for_delivery' || status === 'in_transit') deliveryStatus = 'out_for_delivery';
    else if (status === 'delivered') deliveryStatus = 'delivered';

    if (existingTracking) {
      const { error: updateError } = await supabase
        .from('delivery_tracking')
        .update({
          delivery_status: deliveryStatus,
          updated_at: new Date()
        })
        .eq('id', existingTracking.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('delivery_tracking')
        .insert({
          order_id: id,
          delivery_status: deliveryStatus,
          updated_at: new Date()
        });

      if (insertError) throw insertError;
    }

    return res.status(200).json({
      status: 'success',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    next(error);
  }
};


