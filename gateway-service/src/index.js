require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const setupProxies = require('./proxy/proxyConfig');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security & parsing middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ success: true, service: 'gateway', status: 'healthy', timestamp: new Date().toISOString() })
);

// ─── Auth routes (no proxy, handled directly in gateway) ────────────────────
app.use('/auth', authLimiter, authRoutes);

// ─── Proxied service routes (JWT-protected) ──────────────────────────────────
app.use(apiLimiter);
setupProxies(app);

// ─── 404 fallthrough ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Gateway] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Connect to MongoDB then start server ─────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillforge')
  .then(() => {
    console.log('[Gateway] MongoDB connected');
    app.listen(PORT, () => {
      console.log(`[Gateway] Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Gateway] MongoDB connection failed:', err.message);
    process.exit(1);
  });
