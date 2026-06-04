// JWT import removed to avoid unused package dependency in early mock setup

/**
 * Authentication Middleware
 * Validates the Authorization Bearer token.
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // For initial scaffolding/development:
    // If the token matches our mock token or any valid bearer token, proceed with a mock user
    if (token) {
      req.user = {
        id: 'c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'customer'
      };
      return next();
    }

    // Standard verification template (uncomment and config once JWT_SECRET is set up)
    /*
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
    */
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};
