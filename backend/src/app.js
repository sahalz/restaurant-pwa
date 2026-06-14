import express from 'express';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import supportRoutes from './routes/support.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import refundRoutes from './routes/refund.routes.js';
import addressRoutes from './routes/address.routes.js';
import loyaltyRoutes from './routes/loyalty.routes.js';
import offerRoutes from './routes/offer.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Enable pretty-printing of JSON responses
app.set('json spaces', 2);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Root route welcome message
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Welcome to the Restaurant PWA API' });
});

// Base route for status check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend service is healthy' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', ratingRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Setup global Supabase Realtime listener for Postgres changes on 'notifications' table
import { getAdminClient } from './config/supabase.js';
import { broadcastNotification } from './controllers/notification.controller.js';

try {
  const supabase = getAdminClient();
  supabase
    .channel('notifications-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
      const newNotification = payload.new;
      if (newNotification && newNotification.user_id) {
        broadcastNotification(newNotification.user_id, newNotification);
      }
    })
    .subscribe();
} catch (error) {
  console.error('Failed to set up database notification subscription:', error);
}

export default app;
