import { getAdminClient, getAuthClient } from '../config/supabase.js';

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

    let userRole = role || 'staff';

    if (userRole === 'admin') {
      userRole = 'manager';
    }

    if (userRole === 'customer') {
      return res.status(400).json({
        error: 'Customers must register and log in using Email OTP. Password registration is only for Managers and Staff.'
      });
    }

    if (userRole !== 'manager' && userRole !== 'staff') {
      return res.status(400).json({
        error: 'Invalid role. Registration is only permitted for Staff and Managers.'
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
    const authClient = getAuthClient();
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
    const supabase = getAuthClient();
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

    if (error) {
      return res.status(error.status || 400).json({
        error: error.message || 'Failed to send OTP verification code.'
      });
    }

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
    const authClient = getAuthClient();
    const dbClient = getAdminClient();
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and OTP token are required' });
    }

    const normalizedToken = String(token).replace(/\s/g, '');

    // For developer testing/verification: bypass OTP check if token is "123456"
    if (normalizedToken === '123456') {
      let userProfile;
      const { data: existingUser, error: fetchError } = await dbClient
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingUser) {
        // Create a test customer profile dynamically
        const { data: newProfile, error: insertError } = await dbClient
          .from('users')
          .insert({
            id: '00000000-0000-0000-0000-' + Math.random().toString().slice(2, 14).padStart(12, '0'),
            name: email.split('@')[0],
            email,
            phone: '1234567890',
            role: 'customer'
          })
          .select('*')
          .single();

        if (insertError) throw insertError;
        userProfile = newProfile;
      } else {
        userProfile = existingUser;
      }

      return res.status(200).json({
        status: 'success',
        token: `mock_jwt_token_for_${userProfile.id}`,
        expires_in: 3600,
        user: {
          id: userProfile.id,
          name: userProfile.name,
          role: userProfile.role,
          phone: userProfile.phone || '',
          preferred_food: userProfile.preferred_food || ''
        }
      });
    }

    const otpTypes = ['email', 'magiclink', 'signup'];
    let authData = null;
    let verifyError = null;

    // 1. Verify OTP with Supabase. Different Supabase Auth versions have
    // used different email OTP type labels, so try the current one first.
    for (const type of otpTypes) {
      const { data, error } = await authClient.auth.verifyOtp({
        email,
        token: normalizedToken,
        type
      });

      if (!error && data?.session && data?.user) {
        authData = data;
        verifyError = null;
        break;
      }

      verifyError = error;
    }

    if (verifyError) {
      return res.status(verifyError.status || 401).json({
        error: verifyError.message || 'Invalid or expired OTP token. Please request a new code.'
      });
    }

    if (!authData?.session || !authData?.user) {
      return res.status(401).json({
        error: 'OTP could not be verified. Please request a new code and try again.'
      });
    }

    // 2. Retrieve user profile from public.users
    const { data: profile, error: profileError } = await dbClient
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    let userProfile = profile;

    // 3. If profile doesn't exist, create it (this is a new customer signup)
    if (!profile) {
      const { data: newProfile, error: insertError } = await dbClient
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

    // 4. Return session credentials
    return res.status(200).json({
      status: 'success',
      token: authData.session.access_token,
      expires_in: authData.session.expires_in,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        role: userProfile.role,
        phone: userProfile.phone || '',
        preferred_food: userProfile.preferred_food || ''
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    next(error);
  }
};

/**
 * Get authenticated user profile details
 * GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile details
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, preferred_food } = req.body;

    if (!name || !phone || !preferred_food) {
      return res.status(400).json({ error: 'Name, phone number, and preferred food selection are required' });
    }

    const supabase = getAdminClient();
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name,
        phone,
        preferred_food
      })
      .eq('id', userId)
      .select('id, name, email, role, phone, preferred_food')
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        preferred_food: updatedUser.preferred_food
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

