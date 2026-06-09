// Dummy order data for order management - Aligned with backend schema
export const orderData = [
  {
    id: 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    user_id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
    total_amount: 30.97,
    status: 'delivered',
    payment_status: 'paid',
    created_at: '2024-01-15T12:30:00Z',
    items: [
      { 
        id: 'f1e2d3c4-5b6a-7f8e-9d0c-1b2a3f4e5d6c',
        menu_item_id: 'e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89',
        name: 'Classic Cheeseburger', 
        price: 12.99, 
        quantity: 2, 
        image_url: '🍔' 
      },
      { 
        id: 'g2h3i4j5-6c7d-8e9f-0a1b-2c3d4e5f6a7b',
        menu_item_id: 'o4n7m8k9-2lp3-47k2-9p3k-7p6n1l2m0k89',
        name: 'French Fries', 
        price: 4.99, 
        quantity: 1, 
        image_url: '🍟' 
      },
    ],
    deliveryAddress: '123 Main St, City, State 12345',
    paymentMethod: 'card',
    estimatedDelivery: '25-30 min',
    actualDelivery: '28 min',
  },
  {
    id: 'c2d3e4f5-6g7h-8i9j-0k1l-2m3n4o5p6q7r',
    user_id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
    total_amount: 25.98,
    status: 'preparing',
    payment_status: 'paid',
    created_at: '2024-01-14T19:45:00Z',
    items: [
      { 
        id: 'h3i4j5k6-7d8e-9f0a-1b2c-3d4e5f6a7b8c',
        menu_item_id: 'f5e8d9b0-3cg4-58b3-0g4b-8g7e2d3b1c90',
        name: 'Margherita Pizza', 
        price: 15.99, 
        quantity: 1, 
        image_url: '🍕' 
      },
      { 
        id: 'i4j5k6l7-8e9f-0a1b-2c3d-4e5f6a7b8c9d',
        menu_item_id: 'h7g0f1d2-5ei6-70d5-2i6d-0i9g4f5d3e12',
        name: 'Caesar Salad', 
        price: 9.99, 
        quantity: 1, 
        image_url: '🥗' 
      },
    ],
    deliveryAddress: '456 Oak Ave, City, State 12345',
    paymentMethod: 'paypal',
    estimatedDelivery: '30-35 min',
    actualDelivery: null,
  },
  {
    id: 'd3e4f5g6-7h8i-9j0k-1l2m-3n4o5p6q7r8s',
    user_id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
    total_amount: 29.96,
    status: 'pending',
    payment_status: 'unpaid',
    created_at: '2024-01-13T13:15:00Z',
    items: [
      { 
        id: 'j5k6l7m8-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
        menu_item_id: 'g6f9e0c1-4dh5-69c4-1h5c-9h8f3e4c2d01',
        name: 'Spicy Chicken Wings', 
        price: 11.99, 
        quantity: 2, 
        image_url: '🍗' 
      },
      { 
        id: 'k6l7m8n9-0a1b-2c3d-4e5f-6a7b8c9d0e1f',
        menu_item_id: 'p5o8n9l0-3mq4-58l3-0q4l-8q7o2n3l1l90',
        name: 'Iced Coffee', 
        price: 2.99, 
        quantity: 2, 
        image_url: '☕' 
      },
    ],
    deliveryAddress: '789 Pine Rd, City, State 12345',
    paymentMethod: 'card',
    estimatedDelivery: '20-25 min',
    actualDelivery: null,
  },
  {
    id: 'e4f5g6h7-8i9j-0k1l-2m3n-4o5p6q7r8s9t',
    user_id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
    total_amount: 32.97,
    status: 'delivered',
    payment_status: 'paid',
    created_at: '2024-01-12T18:00:00Z',
    items: [
      { 
        id: 'l7m8n9o0-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
        menu_item_id: 'j9i2h3f4-7gk8-92f7-4k8f-2k1i6h7f5g34',
        name: 'Sushi Platter', 
        price: 24.99, 
        quantity: 1, 
        image_url: '🍣' 
      },
      { 
        id: 'm8n9o0p1-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
        menu_item_id: 'k0j3i4g5-8hl9-03g8-5l9g-3l2j7h8g6g45',
        name: 'Miso Soup', 
        price: 3.99, 
        quantity: 2, 
        image_url: '🍜' 
      },
    ],
    deliveryAddress: '321 Elm St, City, State 12345',
    paymentMethod: 'card',
    estimatedDelivery: '35-40 min',
    actualDelivery: '38 min',
  },
  {
    id: 'f5g6h7i8-9j0k-1l2m-3n4o-5p6q7r8s9t0u',
    user_id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
    total_amount: 13.99,
    status: 'cancelled',
    payment_status: 'refunded',
    created_at: '2024-01-10T20:30:00Z',
    items: [
      { 
        id: 'n9o0p1q2-3d4e-5f6a-7b8c-9d0e1f2a3b4c',
        menu_item_id: 'k0j3i4g5-8hl9-03g8-5l9g-3l2j7h8g6g45',
        name: 'Pad Thai', 
        price: 13.99, 
        quantity: 1, 
        image_url: '🍜' 
      },
    ],
    deliveryAddress: '654 Maple Dr, City, State 12345',
    paymentMethod: 'cash',
    estimatedDelivery: '20-25 min',
    actualDelivery: null,
  },
];

// Get order status color
export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    preparing: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

// Get order status label
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    preparing: 'Preparing',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};
