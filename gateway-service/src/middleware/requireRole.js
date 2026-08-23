const verifyToken = require('./verifyToken');

/**
 * requireRole(...roles)
 * Factory that returns middleware enforcing one of the given roles.
 * Must be used AFTER verifyToken so req.user is populated.
 *
 * Usage:
 *   router.post('/jobs', verifyToken, requireRole('client'), handler)
 *   router.get('/match', verifyToken, requireRole('client', 'freelancer'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — this endpoint requires role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

module.exports = requireRole;
