const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('../middleware/verifyToken');

/**
 * setupProxies(app)
 * Registers proxy routes for core-service and matching-service.
 * All proxied routes are JWT-protected.
 */
const setupProxies = (app) => {
  const coreTarget = process.env.CORE_SERVICE_URL || 'http://localhost:5001';
  const matchingTarget = process.env.MATCHING_SERVICE_URL || 'http://localhost:8000';

  // ── Core Service Proxy (/api/jobs, /api/profiles, /api/applications, /api/reviews, /api/analytics)
  app.use(
    '/api',
    verifyToken,
    createProxyMiddleware({
      target: coreTarget,
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          console.error('[Proxy] Core service error:', err.message);
          res.status(502).json({ success: false, message: 'Core service unavailable' });
        },
        proxyReq: (proxyReq, req) => {
          // Forward authenticated user info to downstream service
          if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            proxyReq.setHeader('X-User-Role', req.user.role);
          }
        },
      },
    })
  );

  // ── Matching Service Proxy (/match/*)
  app.use(
    '/match',
    verifyToken,
    createProxyMiddleware({
      target: matchingTarget,
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          console.error('[Proxy] Matching service error:', err.message);
          res.status(502).json({ success: false, message: 'Matching service unavailable' });
        },
        proxyReq: (proxyReq, req) => {
          if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            proxyReq.setHeader('X-User-Role', req.user.role);
          }
        },
      },
    })
  );
};

module.exports = setupProxies;
