import { supabase } from '../config/supabase.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Mock registration success response (matching docs/api_contract.md)
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user_id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
        name,
        email,
        role: role || 'customer',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user and return token
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Mock login success response (matching docs/api_contract.md)
    return res.status(200).json({
      status: 'success',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMyYjNlOGE3LTNkZjgtNDNkOS05ZjdhLThmNWQxZTJhMGIxMiIsIm5hbWUiOiJKYW5lIERvZSIsInJvbGUiOiJjdXN0b21lciJ9.signature',
      expires_in: 3600,
      user: {
        id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
        name: 'Jane Doe',
        role: 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
};
