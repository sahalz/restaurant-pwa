import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, supportAPI, menuAPI } from '../../services/api';
import { 
  FaClipboardList, FaHeadset, FaExclamationTriangle, 
  FaSignOutAlt, FaSync, FaPhone, FaEnvelope, FaUser 
} from 'react-icons/fa';
import './AdminDashboard.css';

export const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'support' | 'menu'
  const [orders, setOrders] = useState([]);
  
  // Support state
  const [supportTab, setSupportTab] = useState('tickets'); // 'tickets' | 'refunds'
  const [tickets, setTickets] = useState([]);
  const [refunds, setRefunds] = useState([]);

  // Menu state
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submittingItem, setSubmittingItem] = useState(false);
  const [itemError, setItemError] = useState('');
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image_url: '',
    availability: true
  });
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Orders filter status
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [ordersRes, ticketsRes, refundsRes, menuRes, categoriesRes] = await Promise.all([
        orderAPI.getOrders(),
        supportAPI.getSupportTickets(),
        supportAPI.getRefundRequests(),
        menuAPI.getMenu(),
        menuAPI.getCategories()
      ]);
      
      setOrders(ordersRes.data.data || []);
      setTickets(ticketsRes.data.data || []);
      setRefunds(refundsRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
      const cats = categoriesRes.data.data || [];
      setCategories(cats);

      if (cats.length > 0) {
        setNewMenuItem(prev => ({
          ...prev,
          category_id: prev.category_id || cats[0].id
        }));
      }
    } catch (error) {
      console.error('Failed to fetch staff dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    setActionLoadingId(orderId);
    
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready' || currentStatus === 'ready_for_pickup') nextStatus = 'out_for_delivery';
    else if (currentStatus === 'out_for_delivery' || currentStatus === 'in_transit') nextStatus = 'delivered';
    
    if (!nextStatus) {
      setActionLoadingId(null);
      return;
    }

    try {
      await orderAPI.updateOrderStatus(orderId, nextStatus);
      await fetchData(true);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Error updating order status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    setActionLoadingId(ticketId);
    try {
      await supportAPI.resolveSupportTicket(ticketId);
      await fetchData(true);
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      alert('Error resolving ticket');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEscalateTicket = async (ticketId) => {
    setActionLoadingId(ticketId);
    try {
      await supportAPI.escalateSupportTicket(ticketId);
      await fetchData(true);
    } catch (error) {
      console.error('Failed to escalate ticket:', error);
      alert('Error escalating ticket');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    setActionLoadingId(ticketId);
    try {
      await supportAPI.closeSupportTicket(ticketId);
      await fetchData(true);
    } catch (error) {
      console.error('Failed to close ticket:', error);
      alert('Error closing ticket');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleItemFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMenuItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMenuItem(prev => ({
          ...prev,
          image_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleAvailability = async (itemId, currentAvailability) => {
    setActionLoadingId(itemId);
    try {
      const res = await menuAPI.updateMenuItem(itemId, {
        availability: !currentAvailability
      });
      if (res.data.status === 'success') {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, availability: !currentAvailability } : item
        ));
      } else {
        alert(res.data.error || 'Failed to update stock status.');
      }
    } catch (err) {
      console.error('Failed to toggle stock status:', err);
      alert('Failed to update stock status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setItemError('');

    if (!newMenuItem.name.trim()) {
      setItemError('Name is required');
      return;
    }
    if (!newMenuItem.category_id) {
      setItemError('Category is required');
      return;
    }
    if (newMenuItem.price === '' || isNaN(parseFloat(newMenuItem.price)) || parseFloat(newMenuItem.price) < 0) {
      setItemError('Price must be a valid positive number');
      return;
    }

    setSubmittingItem(true);
    try {
      const res = await menuAPI.createMenuItem({
        name: newMenuItem.name.trim(),
        category_id: newMenuItem.category_id,
        price: parseFloat(newMenuItem.price),
        description: (newMenuItem.description || '').trim() || null,
        image_url: (newMenuItem.image_url || '').trim() || null,
        availability: true
      });

      if (res.data.status === 'success') {
        alert('Menu item added successfully.');
        setShowAddForm(false);
        setNewMenuItem({
          name: '',
          category_id: categories[0]?.id || '',
          price: '',
          description: '',
          image_url: '',
          availability: true
        });
        await fetchData(true);
      } else {
        setItemError(res.data.error || 'Failed to add menu item.');
      }
    } catch (err) {
      console.error('Failed to add menu item:', err);
      setItemError(err.response?.data?.error || 'Failed to add menu item. Please try again.');
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setNewMenuItem({
      name: item.name,
      category_id: item.category_id,
      price: item.price.toString(),
      description: item.description || '',
      image_url: item.image_url || '',
      availability: item.availability
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEditMenuItem = async (e) => {
    e.preventDefault();
    setItemError('');

    if (!newMenuItem.name.trim()) {
      setItemError('Name is required');
      return;
    }
    if (!newMenuItem.category_id) {
      setItemError('Category is required');
      return;
    }
    if (newMenuItem.price === '' || isNaN(parseFloat(newMenuItem.price)) || parseFloat(newMenuItem.price) < 0) {
      setItemError('Price must be a valid positive number');
      return;
    }

    setSubmittingItem(true);
    try {
      const res = await menuAPI.updateMenuItem(editingItem.id, {
        name: newMenuItem.name.trim(),
        category_id: newMenuItem.category_id,
        price: parseFloat(newMenuItem.price),
        description: (newMenuItem.description || '').trim() || null,
        image_url: (newMenuItem.image_url || '').trim() || null,
        availability: newMenuItem.availability
      });

      if (res.data.status === 'success') {
        alert('Menu item updated successfully.');
        setShowAddForm(false);
        setEditingItem(null);
        setNewMenuItem({
          name: '',
          category_id: categories[0]?.id || '',
          price: '',
          description: '',
          image_url: '',
          availability: true
        });
        await fetchData(true);
      } else {
        setItemError(res.data.error || 'Failed to update menu item.');
      }
    } catch (err) {
      console.error('Failed to update menu item:', err);
      setItemError(err.response?.data?.error || 'Failed to update menu item. Please try again.');
    } finally {
      setSubmittingItem(false);
    }
  };

  const getFilteredOrders = () => {
    if (orderFilter === 'all') {
      return orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    }
    return orders.filter(o => o.status === orderFilter);
  };

  const filteredOrders = getFilteredOrders();

  // Metrics calculation
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const activeTicketsCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="admin-dashboard staff-theme">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <h1>🍽️ DirectDine <span>Staff Portal</span></h1>
        </div>
        <div className="admin-user-controls">
          <div className="admin-welcome-text">
            Logged in as: <strong>{user?.name || 'Staff User'}</strong> (<span style={{textTransform:'capitalize'}}>{user?.role}</span>)
          </div>
          <button 
            className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer', 
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
            title="Refresh dashboard data"
          >
            <FaSync />
          </button>
          <button className="admin-logout-btn" onClick={logout}>
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="admin-container">
        
        {/* Metrics Grid */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box orders">
              <FaClipboardList />
            </div>
            <div className="metric-info">
              <h4>Pending Orders</h4>
              <div className="metric-number">{pendingOrdersCount}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-box preparing-box" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <FaClipboardList />
            </div>
            <div className="metric-info">
              <h4>Preparing</h4>
              <div className="metric-number">{preparingOrdersCount}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-box tickets">
              <FaHeadset />
            </div>
            <div className="metric-info">
              <h4>Open Tickets</h4>
              <div className="metric-number">{activeTicketsCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Active Orders ({orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Manage Menu ({menuItems.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            Support ({tickets.filter(t => t.status === 'open').length + refunds.filter(r => r.status === 'Pending').length})
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Orders Panel */}
            {activeTab === 'orders' && (
              <div className="orders-panel">
                <div className="panel-header">
                  <h2>Order Management</h2>
                  <div className="orders-filter-bar">
                    {['all', 'pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map(f => (
                      <button 
                        key={f}
                        className={`order-filter-btn ${orderFilter === f ? 'active' : ''}`}
                        onClick={() => setOrderFilter(f)}
                      >
                        {f === 'all' ? 'Active' : f.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="orders-grid">
                    {filteredOrders.map(order => {
                      const dateObj = new Date(order.created_at);
                      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + dateObj.toLocaleDateString();
                      const paymentMethodStr = order.payments?.[0]?.payment_method || 'CoD';
                      const cust = order.users || {};

                      return (
                        <div key={order.id} className="admin-order-card">
                          <div className="order-card-header">
                            <div className="order-id-section">
                              <h3>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                              <span className="order-time">{formattedTime}</span>
                            </div>
                            <span className={`status-badge ${order.status}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="order-card-body">
                            <div className="customer-detail-box">
                              <h4>Customer Information</h4>
                              <p><FaUser size={12} /> {cust.name || 'Anonymous User'}</p>
                              {cust.phone && <p><FaPhone size={12} /> {cust.phone}</p>}
                              {cust.email && <p><FaEnvelope size={12} /> {cust.email}</p>}
                            </div>

                            <div className="order-items-summary">
                              <h4>Items Ordered</h4>
                              {(order.order_items || []).map(item => (
                                <div key={item.id} className="order-item-row">
                                  <span>
                                    <span className="order-item-qty">{item.quantity}x</span>
                                    {item.menu_items?.name || 'Menu Item'}
                                  </span>
                                  <span>₹{parseFloat(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Notes & Instructions */}
                            {(order.restaurant_note || (order.delivery_instructions && (order.delivery_instructions.voiceUrl || order.delivery_instructions.imageUrl || Object.values(order.delivery_instructions.options || {}).some(Boolean)))) && (
                              <div className="order-instructions-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginTop: '12px', fontSize: '0.85rem' }}>
                                {order.restaurant_note && (
                                  <div style={{ marginBottom: order.delivery_instructions ? '8px' : '0' }}>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.85rem', color: '#475569' }}>📌 Note for Restaurant</h4>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#1e293b' }}>"{order.restaurant_note}"</p>
                                  </div>
                                )}
                                {order.delivery_instructions && (order.delivery_instructions.voiceUrl || order.delivery_instructions.imageUrl || Object.values(order.delivery_instructions.options || {}).some(Boolean)) && (
                                  <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#475569' }}>🛵 Delivery Instructions</h4>
                                    {Object.values(order.delivery_instructions.options || {}).some(Boolean) && (
                                      <ul style={{ margin: '0 0 6px 0', paddingLeft: '16px', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {Object.entries(order.delivery_instructions.options || {}).map(([key, val]) => {
                                          if (!val) return null;
                                          const labels = {
                                            leaveAtDoor: '🚪 Leave at door',
                                            leaveWithGuard: '👮 Leave with guard',
                                            avoidCalling: '🔇 Avoid calling',
                                            dontRingBell: '🔕 Don\'t ring the bell',
                                            petAtHome: '🐕 Pet at home'
                                          };
                                          return <li key={key}>{labels[key]}</li>;
                                        })}
                                      </ul>
                                    )}
                                    {order.delivery_instructions.voiceUrl && (
                                      <div style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.8rem' }}>
                                        🎙️ Voice Note
                                        <button type="button" style={{ background: '#475569', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.6rem' }} onClick={() => alert('Simulated playing voice note...')}>▶</button>
                                      </div>
                                    )}
                                    {order.delivery_instructions.imageUrl && (
                                      <div style={{ marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Location Image:</span>
                                        <img src={order.delivery_instructions.imageUrl} alt="Location" style={{ maxWidth: '100%', maxHeight: '80px', borderRadius: '4px', objectFit: 'cover' }} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="order-card-footer">
                            <div className="order-total-amount">
                              <label>Total Amount ({paymentMethodStr.toUpperCase()})</label>
                              ₹{parseFloat(order.total_amount).toFixed(2)}
                            </div>
                            
                            <div className="status-actions-container">
                              {order.status === 'pending' && (
                                <button 
                                  className="action-btn"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Accept & Prepare'}
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button 
                                  className="action-btn"
                                  style={{ backgroundColor: '#7c3aed' }}
                                  onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Mark Ready'}
                                </button>
                              )}
                              {(order.status === 'ready' || order.status === 'ready_for_pickup') && (
                                <button 
                                  className="action-btn"
                                  style={{ backgroundColor: '#0d9488' }}
                                  onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Dispatch Order'}
                                </button>
                              )}
                              {(order.status === 'out_for_delivery' || order.status === 'in_transit') && (
                                <button 
                                  className="action-btn"
                                  style={{ backgroundColor: '#16a34a' }}
                                  onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Mark Delivered'}
                                </button>
                              )}
                              {order.status === 'delivered' && (
                                <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                  ✓ Order Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-state-icon">📦</span>
                    <h3>No orders found</h3>
                    <p>There are no active orders matching this status filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* Menu Panel */}
            {activeTab === 'menu' && (
              <div className="menu-panel">
                <div className="panel-header">
                  <h2>Menu Management</h2>
                  <button 
                    className="add-item-toggle-btn"
                    onClick={() => {
                      if (showAddForm) {
                        setShowAddForm(false);
                        setEditingItem(null);
                        setNewMenuItem({
                          name: '',
                          category_id: categories[0]?.id || '',
                          price: '',
                          description: '',
                          image_url: '',
                          availability: true
                        });
                      } else {
                        setShowAddForm(true);
                        setEditingItem(null);
                        setNewMenuItem({
                          name: '',
                          category_id: categories[0]?.id || '',
                          price: '',
                          description: '',
                          image_url: '',
                          availability: true
                        });
                      }
                    }}
                  >
                    {showAddForm ? 'Cancel' : '+ Add Menu Item'}
                  </button>
                </div>

                {showAddForm && (
                  <form onSubmit={editingItem ? handleSaveEditMenuItem : handleAddMenuItem} className="add-menu-item-form">
                    <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                    {itemError && <div className="form-error-msg">{itemError}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="item-name">Item Name *</label>
                        <input
                          type="text"
                          id="item-name"
                          name="name"
                          value={newMenuItem.name}
                          onChange={handleItemFormChange}
                          placeholder="e.g. Garlic Bread"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="item-price">Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          id="item-price"
                          name="price"
                          value={newMenuItem.price}
                          onChange={handleItemFormChange}
                          placeholder="e.g. 299"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="item-category">Category *</label>
                        <select
                          id="item-category"
                          name="category_id"
                          value={newMenuItem.category_id}
                          onChange={handleItemFormChange}
                          required
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group image-upload-group">
                        <label>Image Selection</label>
                        <div className="image-input-container">
                          <label className="file-select-btn file-input-wrapper" style={{ cursor: 'pointer' }}>
                            Choose Image File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUploadChange}
                              className="hidden-file-input"
                              style={{ display: 'none' }}
                            />
                          </label>
                          <span className="or-divider">OR</span>
                          <input
                            type="text"
                            name="image_url"
                            value={newMenuItem.image_url?.startsWith('data:') ? '' : newMenuItem.image_url || ''}
                            onChange={handleItemFormChange}
                            placeholder="Paste image URL here"
                          />
                        </div>
                      </div>
                    </div>

                    {newMenuItem.image_url && (
                      <div className="image-preview-wrapper">
                        <img src={newMenuItem.image_url} alt="Food Preview" className="uploaded-image-preview" />
                        <button 
                          type="button" 
                          className="remove-preview-btn"
                          onClick={() => setNewMenuItem(prev => ({ ...prev, image_url: '' }))}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="item-desc">Description</label>
                      <textarea
                        id="item-desc"
                        name="description"
                        value={newMenuItem.description}
                        onChange={handleItemFormChange}
                        placeholder="Provide details about ingredients, allergen notes, portion size..."
                        rows={3}
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="cancel-form-btn" 
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingItem(null);
                          setNewMenuItem({
                            name: '',
                            category_id: categories[0]?.id || '',
                            price: '',
                            description: '',
                            image_url: '',
                            availability: true
                          });
                        }}
                        disabled={submittingItem}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="submit-form-btn"
                        disabled={submittingItem}
                      >
                        {submittingItem ? 'Saving...' : editingItem ? 'Update Food Item' : 'Save Food Item'}
                      </button>
                    </div>
                  </form>
                )}

                {menuItems.length > 0 ? (
                  <div className="menu-categories-grouped-list">
                    {categories.map(category => {
                      const itemsInCategory = menuItems.filter(item => item.category_id === category.id);
                      if (itemsInCategory.length === 0) return null;
                      
                      return (
                        <div key={category.id} className="menu-category-group">
                          <h3 className="category-section-title">{category.name}</h3>
                          <div className="menu-items-grid">
                            {itemsInCategory.map(item => (
                              <div key={item.id} className="admin-menu-card">
                                <div className="menu-card-header">
                                  <div className="menu-card-title-box">
                                    <h3>{item.name}</h3>
                                  </div>
                                </div>
                                
                                {item.image_url && (
                                  <div className="menu-card-img-container">
                                    <img src={item.image_url} alt={item.name} className="menu-card-img" />
                                  </div>
                                )}

                                <div className="menu-card-body">
                                  {item.description && <p className="menu-card-desc">{item.description}</p>}
                                  <div className="menu-card-info-row">
                                    <span className="menu-card-price">₹{parseFloat(item.price).toFixed(2)}</span>
                                    <button 
                                      type="button"
                                      className="edit-item-btn"
                                      onClick={() => handleEditClick(item)}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                  
                                  <div className="menu-card-stock-control">
                                    <span className="stock-control-label">Available:</span>
                                    <label className="switch">
                                      <input 
                                        type="checkbox" 
                                        checked={item.availability} 
                                        onChange={() => handleToggleAvailability(item.id, item.availability)}
                                        disabled={actionLoadingId === item.id}
                                      />
                                      <span className="slider round"></span>
                                    </label>
                                    <span className={`stock-text ${item.availability ? 'in' : 'out'}`}>
                                      {item.availability ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-state-icon">🍔</span>
                    <h3>No items in menu</h3>
                    <p>There are no food items created yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Support Panel */}
            {activeTab === 'support' && (
              <div className="support-panel">
                <div className="support-subtabs">
                  <button 
                    className={`support-subtab-btn ${supportTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => setSupportTab('tickets')}
                  >
                    Support Tickets ({tickets.length})
                  </button>
                  <button 
                    className={`support-subtab-btn ${supportTab === 'refunds' ? 'active' : ''}`}
                    onClick={() => setSupportTab('refunds')}
                  >
                    Refund Requests ({refunds.length})
                  </button>
                </div>

                <div className="support-items-list" style={{ marginTop: '20px' }}>
                  {supportTab === 'tickets' && (
                    tickets.length > 0 ? (
                      tickets.map(ticket => (
                        <div key={ticket.id} className="support-item-card">
                          <div className="support-item-header">
                            <div className="support-item-title">
                              <h3>{ticket.subject}</h3>
                              <div className="support-item-meta">
                                <span>Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}</span>
                                <span>Customer: {ticket.users?.name || 'Customer User'}</span>
                                {ticket.users?.email && <span>Email: {ticket.users?.email}</span>}
                              </div>
                            </div>
                            <span className={`support-badge ${ticket.status}`}>
                              {ticket.status}
                            </span>
                          </div>
                          
                          <p className="support-description">{ticket.description}</p>
                          
                          {ticket.status === 'open' && (
                            <div className="support-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#16a34a' }}
                                onClick={() => handleResolveTicket(ticket.id)}
                                disabled={actionLoadingId === ticket.id}
                              >
                                {actionLoadingId === ticket.id ? 'Processing...' : '✓ Resolve Basic Issue'}
                              </button>
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#ef4444' }}
                                onClick={() => handleEscalateTicket(ticket.id)}
                                disabled={actionLoadingId === ticket.id}
                              >
                                {actionLoadingId === ticket.id ? 'Processing...' : '⚠️ Escalate to Manager'}
                              </button>
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#4b5563' }}
                                onClick={() => handleCloseTicket(ticket.id)}
                                disabled={actionLoadingId === ticket.id}
                              >
                                {actionLoadingId === ticket.id ? 'Processing...' : 'Close Ticket'}
                              </button>
                            </div>
                          )}
                          {ticket.status === 'resolved' && (
                            <div className="support-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#4b5563' }}
                                onClick={() => handleCloseTicket(ticket.id)}
                                disabled={actionLoadingId === ticket.id}
                              >
                                {actionLoadingId === ticket.id ? 'Processing...' : 'Close Ticket'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="empty-state-icon">🎫</span>
                        <h3>No Support Tickets</h3>
                        <p>There are no customer support tickets filed currently.</p>
                      </div>
                    )
                  )}

                  {supportTab === 'refunds' && (
                    <>
                      <div style={{ background: '#eff6ff', color: '#1e40af', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #bfdbfe', fontSize: '0.875rem', fontWeight: '500', marginBottom: '12px' }}>
                        ℹ️ Standard staff members can only view refund requests. Manager privileges are required to approve or reject them.
                      </div>
                      {refunds.length > 0 ? (
                        refunds.map(refund => (
                          <div key={refund.id} className="support-item-card" style={{ borderLeft: refund.status === 'Pending' ? '4px solid #f59e0b' : '4px solid #cbd5e1' }}>
                            <div className="support-item-header">
                              <div className="support-item-title">
                                <h3>Refund Request: ₹{parseFloat(refund.amount || 0).toFixed(2)}</h3>
                                <div className="support-item-meta">
                                  <span>Request ID: {refund.id.slice(0, 8).toUpperCase()}</span>
                                  <span>Order ID: {refund.order_id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
                                  <span>Customer ID: {refund.user_id?.slice(0, 8) || 'N/A'}</span>
                                </div>
                              </div>
                              <span 
                                className="support-badge" 
                                style={{ 
                                  backgroundColor: refund.status === 'Approved' ? 'rgba(22, 163, 74, 0.1)' : refund.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)', 
                                  color: refund.status === 'Approved' ? '#16a34a' : refund.status === 'Pending' ? '#f59e0b' : '#6b7280',
                                  border: `1.5px solid ${refund.status === 'Approved' ? '#16a34a' : refund.status === 'Pending' ? '#f59e0b' : '#cbd5e1'}`,
                                  fontWeight: 'bold',
                                  borderRadius: '8px',
                                  padding: '4px 8px',
                                  fontSize: '0.8rem'
                                }}
                              >
                                {refund.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <p className="support-description"><strong>Reason:</strong> {refund.reason || 'No reason specified'}</p>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <span className="empty-state-icon">💸</span>
                          <h3>No Refund Requests</h3>
                          <p>There are no refund requests currently.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
