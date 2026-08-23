/**
 * extractUser middleware
 * Core service is an internal service — it does not validate JWTs directly.
 * It trusts the X-User-Id and X-User-Role headers injected by the gateway.
 * This middleware attaches a req.user object from those headers.
 */
const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole) {
    return res.status(401).json({ success: false, message: 'Unauthorized — missing identity headers' });
  }

  req.user = { id: userId, role: userRole };
  next();
};

module.exports = extractUser;
