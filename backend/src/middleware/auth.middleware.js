import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

/**
 * Authentication Middleware
 * Validates the Authorization Bearer token using custom JWT verification or Supabase Auth.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Intercept mock JWT tokens for developer customer testing
    if (token.startsWith('mock_jwt_token_for_')) {
      const userId = token.replace('mock_jwt_token_for_', '');
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role, email, phone, preferred_food')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        return res.status(401).json({ error: 'Mock token user not found.' });
      }

      req.user = {
        id: userId,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone || '',
        preferred_food: profile.preferred_food || ''
      };
      
      return next();
    }

    // Verify token using custom local secret first, fallback to Supabase
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'restaurant_pwa_secret_key_jwt_token_signing');
    } catch (err) {
      // Fallback: Check if it is a Supabase token
      const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
      if (error || !sbUser) {
        return res.status(401).json({ error: 'Invalid or expired authentication token.' });
      }
      payload = { 
        id: sbUser.id,
        email: sbUser.email,
        role: sbUser.user_metadata?.role || 'customer'
      };
    }

    // Fetch details from public.users table to get their role and contact info
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role, email, phone, preferred_food')
      .eq('id', payload.id)
      .maybeSingle();

    if (profileError) throw profileError;

    // Set user payload on request object
    req.user = {
      id: payload.id,
      email: profile?.email || payload.email || '',
      name: profile?.name || 'User',
      role: profile?.role || payload.role || 'customer',
      phone: profile?.phone || '',
      preferred_food: profile?.preferred_food || ''
    };

    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

/**
 * Staff Authorization Middleware
 * Verifies that the authenticated user is a staff member (staff, manager, or legacy admin).
 */
export const authorizeStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'manager' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Staff privileges required.' });
};

/**
 * Manager Authorization Middleware
 * Verifies that the authenticated user is a manager (manager or legacy admin).
 */
export const authorizeManager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Manager privileges required.' });
};
