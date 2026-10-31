import { env } from '../config/env.js';

const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const allowedOrigins = new Set([
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean));

export const validateOrigin = (req, res, next) => {
  // Only check state-changing requests authenticated via cookies
  if (!stateChangingMethods.has(req.method)) {
    return next();
  }

  // If request is authenticated via Bearer token in header, CSRF via cookie is not an attack vector
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // If a cookie token is present, validate origin/referer to prevent CSRF attacks
  if (req.cookies && req.cookies.token) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    let requestOrigin = origin;
    if (!requestOrigin && referer) {
      try {
        requestOrigin = new URL(referer).origin;
      } catch {
        // malformed referer
      }
    }

    // In non-browser testing/curl without origin, or mismatched origin:
    if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ORIGIN_MISMATCH',
          message: 'Cross-origin request rejected for cookie-authenticated operation',
          details: [{ origin: requestOrigin }],
        },
      });
    }
  }

  next();
};

export default validateOrigin;
