const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

/**
 * GET /api/jobs
 * List jobs with filtering, pagination, search
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['open', 'in_progress', 'completed', 'cancelled']),
    query('experienceLevel').optional().isIn(['entry', 'intermediate', 'expert']),
    query('q').optional().isString(),
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.experienceLevel) filter.experienceLevel = req.query.experienceLevel;
      if (req.query.category) filter.category = req.query.category;
      if (req.query.q) filter.$text = { $search: req.query.q };

      const [jobs, total] = await Promise.all([
        Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Job.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: jobs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error('[Jobs] GET / error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
  }
);

/**
 * GET /api/jobs/:id
 */
router.get('/:id', [param('id').isMongoId()], validate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch job' });
  }
});

/**
 * POST /api/jobs
 * Only clients can post jobs
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().isLength({ max: 150 }),
    body('description').trim().notEmpty().isLength({ max: 5000 }),
    body('skillsRequired').isArray({ min: 1 }).withMessage('At least one skill required'),
    body('budget.min').optional().isFloat({ min: 0 }),
    body('budget.max').optional().isFloat({ min: 0 }),
    body('duration').optional().isIn(['less_than_1_week', '1_to_4_weeks', '1_to_3_months', '3_to_6_months', 'more_than_6_months']),
    body('experienceLevel').optional().isIn(['entry', 'intermediate', 'expert']),
    body('category').optional().trim(),
  ],
  validate,
  async (req, res) => {
    if (req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only clients can post jobs' });
    }
    try {
      const job = await Job.create({ ...req.body, clientId: req.user.id });
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      console.error('[Jobs] POST error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to create job' });
    }
  }
);

/**
 * PATCH /api/jobs/:id
 * Only the owning client can update their job
 */
router.patch(
  '/:id',
  [param('id').isMongoId()],
  validate,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      if (job.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only edit your own jobs' });
      }

      const allowed = ['title', 'description', 'skillsRequired', 'budget', 'duration', 'experienceLevel', 'status', 'category'];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) job[field] = req.body[field];
      });

      await job.save();
      res.json({ success: true, data: job });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update job' });
    }
  }
);

/**
 * DELETE /api/jobs/:id
 */
router.delete('/:id', [param('id').isMongoId()], validate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own jobs' });
    }
    await job.deleteOne();
    await Application.deleteMany({ jobId: req.params.id });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
});

/**
 * GET /api/jobs/client/my
 * Get all jobs posted by the authenticated client
 */
router.get('/client/my', async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Only clients can access this endpoint' });
  }
  try {
    const jobs = await Job.find({ clientId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch your jobs' });
  }
});

module.exports = router;
