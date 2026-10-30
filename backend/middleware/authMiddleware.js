import jwt from 'jsonwebtoken';
import db from '../config/db.js';

/**
 * Authentication Middleware
 * Enforces JWT verification and populates req.user.
 * Strictly checks user existence in the database.
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Missing or malformed authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'visioninsight_default_jwt_secret';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid or corrupted authentication token.'
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    // Verify user exists in database using parameterized query
    const userResult = await db.query('SELECT id, email, created_at FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.'
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.'
    });
  }
}

