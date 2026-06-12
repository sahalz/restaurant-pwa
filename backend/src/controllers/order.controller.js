import { supabase } from '../config/supabase.js';

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address_id, restaurant_note, delivery_instructions } = req.body;

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
    let newOrder;
    const insertPayload = {
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'unpaid'
    };

    const { data: tryOrder, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        ...insertPayload,
        restaurant_note: restaurant_note || null,
        delivery_instructions: delivery_instructions || null
      })
      .select('*')
      .single();

    if (orderInsertError) {
      if (orderInsertError.code === '42703') {
        console.warn('Warning: restaurant_note or delivery_instructions column missing in orders table. Retrying insert without them.');
        const { data: fallbackOrder, error: fallbackError } = await supabase
          .from('orders')
          .insert(insertPayload)
          .select('*')
          .single();

        if (fallbackError) throw fallbackError;
        newOrder = fallbackOrder;
      } else {
        throw orderInsertError;
      }
    } else {
      newOrder = tryOrder;
    }

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

    const selectFields = `
      id,
      total_amount,
      status,
      payment_status,
      restaurant_note,
      delivery_instructions,
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
    `;

    let query = supabase
      .from('orders')
      .select(selectFields);

    if (userRole === 'customer') {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42703') {
        console.warn('Warning: restaurant_note or delivery_instructions column missing in orders table. Fetching without them.');
        const fallbackSelect = `
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
        `;
        let fallbackQuery = supabase
          .from('orders')
          .select(fallbackSelect);

        if (userRole === 'customer') {
          fallbackQuery = fallbackQuery.eq('user_id', userId);
        }

        const { data: fallbackOrders, error: fallbackError } = await fallbackQuery.order('created_at', { ascending: false });
        if (fallbackError) throw fallbackError;

        return res.status(200).json({
          status: 'success',
          data: fallbackOrders || []
        });
      }
      throw error;
    }

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

    const selectFields = `
      id,
      total_amount,
      status,
      payment_status,
      restaurant_note,
      delivery_instructions,
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
    `;

    const { data: order, error } = await supabase
      .from('orders')
      .select(selectFields)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === '42703') {
        console.warn('Warning: restaurant_note or delivery_instructions column missing in orders table. Fetching single order without them.');
        const fallbackSelect = `
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
        `;
        const { data: fallbackOrder, error: fallbackError } = await supabase
          .from('orders')
          .select(fallbackSelect)
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (fallbackError) throw fallbackError;
        if (!fallbackOrder) {
          return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json({
          status: 'success',
          data: fallbackOrder
        });
      }
      throw error;
    }

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

/**
 * Cancel an order (Customer)
 * PATCH /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Fetch order details to verify owner and current status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 2. Only allow cancellation if order status is 'pending'
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    // 3. Update order status to 'cancelled'
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    next(error);
  }
};


