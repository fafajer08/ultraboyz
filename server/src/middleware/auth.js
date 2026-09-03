import { verifyToken } from '../utils/jwt.js';

// Attaches req.user if a valid token is present. Does NOT reject if missing —
// use requireAuth for that. Handy for routes that behave differently when
// logged in vs anonymous (none currently, but kept for flexibility).
export function attachUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      req.user = null;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'You need to be logged in for that.' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only.' });
  }
  next();
}
