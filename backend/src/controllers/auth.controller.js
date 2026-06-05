import { getAdminClient } from '../config/supabase.js';

/**
 * Register a new user (Restaurant Managers and Admins with email/password)
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields (name, email, password, phone) are required' });
    }

    const userRole = role || 'customer';

    // Enforce that customers must use the OTP flow, not password registration
    if (userRole === 'customer') {
      return res.status(400).json({
        error: 'Customers must register and log in using Email OTP. Password registration is only for Managers and Admins.'
      });
    }

    // 1. Check if user already exists in public.users
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // 2. Sign up user via Supabase Auth admin API (auto-confirms email and stores password hash)
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        role: userRole
      }
    });

    if (signUpError) throw signUpError;
    if (!authData.user) {
      return res.status(400).json({ error: 'Registration failed. Please try again.' });
    }

    // 3. Insert user profile into public.users
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone,
        role: userRole
      })
      .select('id, name, email, role, created_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    // 4. Return success response
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user via email/password (Restaurant Managers and Admins only)
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Authenticate with Supabase Auth using a dedicated auth client
    const authClient = getAdminClient();
    const { data: authData, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Fetch the user profile from public.users using a dedicated DB client
    // (retains the service_role key to bypass any RLS select restrictions)
    const dbClient = getAdminClient();
    const { data: profile, error: fetchError } = await dbClient
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // Enforce that customers cannot log in using the password endpoint
    if (!profile || profile.role === 'customer') {
      return res.status(403).json({
        error: 'Access denied. Customers must authenticate using the Email OTP system.'
      });
    }

    // 3. Return session token and user profile
    return res.status(200).json({
      status: 'success',
      token: authData.session.access_token,
      expires_in: authData.session.expires_in,
      user: {
        id: profile.id,
        name: profile.name,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * Send an OTP verification code to a user's email (Customers)
 * POST /api/auth/otp/send
 */
export const sendOTP = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const { email, name, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Request Supabase to send a 6-digit OTP code to the email address
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          name: name || 'User',
          phone: phone || '',
          role: 'customer'
        }
      }
    });

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      message: 'OTP verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    next(error);
  }
};

/**
 * Verify OTP and authenticate the user (Customers)
 * POST /api/auth/otp/verify
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and OTP token are required' });
    }

    // 1. Verify OTP with Supabase
    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (verifyError) {
      return res.status(401).json({ error: 'Invalid or expired OTP token.' });
    }

    // 2. Retrieve user profile from public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    let userProfile = profile;

    // 3. If profile doesn't exist, create it (this is a new customer signup)
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: authData.user.user_metadata?.name || 'Customer User',
          email: authData.user.email,
          phone: authData.user.user_metadata?.phone || '',
          role: 'customer'
        })
        .select('*')
        .single();

      if (insertError) throw insertError;
      userProfile = newProfile;
    }

    // 4. Return standard session credentials
    return res.status(200).json({
      status: 'success',
      token: authData.session.access_token,
      expires_in: authData.session.expires_in,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        role: userProfile.role
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    next(error);
  }
};
