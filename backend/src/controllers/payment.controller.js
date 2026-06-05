import { supabase } from '../config/supabase.js';

/**
 * Process a payment for an order
 * POST /api/payments/process
 */
export const processPayment = async (req, res, next) => {
  try {
    const { order_id, payment_method, transaction_id } = req.body;

    if (!order_id || !payment_method || !transaction_id) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    // 1. Fetch the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Order has already been paid' });
    }

    // 2. Log payment transaction in the database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id,
        payment_method,
        transaction_id,
        amount: order.total_amount,
        status: 'success'
      })
      .select('*')
      .single();

    if (paymentError) throw paymentError;

    // 3. Update the Order payment status and general status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'preparing' // Update order status to preparing upon receipt of payment
      })
      .eq('id', order_id);

    if (updateError) {
      console.warn('Warning: Failed to update order status after logging payment:', updateError);
    }

    // 4. Return response matching docs/api_contract.md
    return res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        payment_id: payment.id,
        status: payment.status,
        amount: parseFloat(payment.amount)
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    next(error);
  }
};
