import { supabase } from '../config/supabase.js';

/**
 * Authentication Middleware
 * Validates the Authorization Bearer token using Supabase Auth.
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
        .select('name, role, email, phone')
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
        phone: profile.phone || ''
      };
      
      return next();
    }

    // Verify token using Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }

    // Fetch details from public.users table to get their role and contact info
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role, email, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    // Set user payload on request object
    req.user = {
      id: user.id,
      email: profile?.email || user.email,
      name: profile?.name || user.user_metadata?.name || 'User',
      role: profile?.role || user.user_metadata?.role || 'customer',
      phone: profile?.phone || user.user_metadata?.phone || ''
    };

    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};
