require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const jobRoutes = require('./routes/jobs');
const profileRoutes = require('./routes/profiles');
const applicationRoutes = require('./routes/applications');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const extractUser = require('./middleware/extractUser');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ success: true, service: 'core', status: 'healthy', timestamp: new Date().toISOString() })
);

// ─── All routes require user identity headers from gateway ───────────────────
app.use(extractUser);

// ─── Route registration ───────────────────────────────────────────────────────
app.use('/api/jobs', jobRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Core] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Connect MongoDB and start ────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillforge')
  .then(() => {
    console.log('[Core] MongoDB connected');
    app.listen(PORT, () => console.log(`[Core] Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[Core] MongoDB connection failed:', err.message);
    process.exit(1);
  });
