import { useState, useEffect } from 'react';
import { OrderCard } from '../../components/order/OrderCard';
import { orderAPI, addressesAPI } from '../../services/api';
import './OrdersPage.css';

export const OrdersPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, addressesRes] = await Promise.all([
          orderAPI.getOrders(),
          addressesAPI.getAddresses()
        ]);
        setOrders(ordersRes.data.data || []);
        setAddresses(addressesRes.data.data || []);
        setError('');
      } catch (err) {
        console.error('Failed to fetch orders or addresses:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMappedOrders = () => {
    const defaultAddressStr = addresses.length > 0
      ? `${addresses[0].address}, ${addresses[0].city}`
      : 'Delivery Address';

    return orders.map(order => {
      const pm = order.payments?.[0]?.payment_method || 'Paid';
      const paymentMethod = pm === 'card' ? 'Credit Card' : pm === 'paypal' ? 'PayPal' : pm === 'cash' ? 'Cash on Delivery' : pm;

      return {
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_amount: parseFloat(order.total_amount),
        paymentMethod,
        deliveryAddress: defaultAddressStr,
        items: (order.order_items || []).map(item => ({
          id: item.id,
          name: item.menu_items?.name || 'Menu Item',
          image_url: item.menu_items?.image_url || '🍔',
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      };
    });
  };

  const mappedOrders = getMappedOrders();

  const filteredOrders = filterStatus === 'all' 
    ? mappedOrders 
    : mappedOrders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-loading">
            <div className="orders-spinner" />
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-error">
            <h2>Error</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        <div className="orders-filter">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filterStatus === 'preparing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('preparing')}
          >
            Preparing
          </button>
          <button
            className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilterStatus('delivered')}
          >
            Delivered
          </button>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <span className="no-orders-icon">📦</span>
            <h2>No orders found</h2>
            <p>
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${filterStatus} orders found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
