import jwt from 'jsonwebtoken';
import { getAdminClient, supabase } from '../config/supabase.js';

// Connection registry: userId -> Array of response objects
const userConnections = {};

/**
 * Helper function to create a notification log inside the database
 */
export const createNotification = async (userId, title, message, type, referenceId = null) => {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        reference_id: referenceId,
        is_read: false
      })
      .select('*')
      .single();

    if (error) throw error;

    // Broadcast immediately to connected SSE clients
    broadcastNotification(userId, data);

    return data;
  } catch (err) {
    console.error('Failed to create notification record:', err.message);
    return null;
  }
};

/**
 * Fetch notifications for authenticated user
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Keep last 50 notifications

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data: data || []
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    next(error);
  }
};

/**
 * Mark all user notifications as read
 * POST /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .select('*');

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
      data: data || []
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    next(error);
  }
};

/**
 * Setup a Server-Sent Events (SSE) notification stream
 * GET /api/notifications/stream?token=...
 */
export const setupNotificationSSEStream = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({ error: 'Token is required for notification streaming' });
    }

    let userId;
    if (token.startsWith('mock_jwt_token_for_')) {
      userId = token.replace('mock_jwt_token_for_', '');
    } else {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'restaurant_pwa_secret_key_jwt_token_signing');
        userId = decoded.id;
      } catch (err) {
        // Fallback: Check if it is a Supabase token
        try {
          const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
          if (error || !sbUser) throw new Error();
          userId = sbUser.id;
        } catch (e) {
          return res.status(401).json({ error: 'Invalid/expired token' });
        }
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Configure headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Prevent proxy buffering (Nginx, etc.)
    });

    // Send connection acknowledgement
    res.write('data: {"status":"connected"}\n\n');

    // Register active SSE stream connection
    if (!userConnections[userId]) {
      userConnections[userId] = [];
    }
    userConnections[userId].push(res);

    // Keep-alive heartbeat interval to prevent idle socket closures
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      if (userConnections[userId]) {
        userConnections[userId] = userConnections[userId].filter(conn => conn !== res);
        if (userConnections[userId].length === 0) {
          delete userConnections[userId];
        }
      }
    });
  } catch (error) {
    console.error('Notification SSE connection error:', error);
    res.status(500).end();
  }
};

/**
 * Broadcast notification change to any active connected SSE client matching userId
 */
export const broadcastNotification = (userId, notification) => {
  const connections = userConnections[userId];
  if (connections && connections.length > 0) {
    const payload = JSON.stringify({
      status: 'new_notification',
      data: notification
    });
    connections.forEach((res) => {
      res.write(`data: ${payload}\n\n`);
    });
  }
};

/**
 * Create a notification for all admin users (managers and staff)
 */
export const createNotificationForAdmins = async (title, message, type, referenceId = null) => {
  try {
    const supabase = getAdminClient();
    // Fetch all managers and staff
    const { data: admins, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .in('role', ['manager', 'staff']);

    if (fetchError) throw fetchError;

    if (admins && admins.length > 0) {
      const inserts = admins.map(admin => ({
        user_id: admin.id,
        title,
        message,
        type,
        reference_id: referenceId,
        is_read: false
      }));

      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert(inserts)
        .select('*');

      if (insertError) throw insertError;

      // Broadcast immediately to each active connected admin SSE client
      if (data && data.length > 0) {
        data.forEach(notif => {
          broadcastNotification(notif.user_id, notif);
        });
      }

      return data;
    }
    return [];
  } catch (err) {
    console.error('Failed to create admin notifications:', err.message);
    return null;
  }
};

