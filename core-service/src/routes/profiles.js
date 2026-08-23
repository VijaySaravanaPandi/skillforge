const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Profile = require('../models/Profile');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

/**
 * GET /api/profiles
 * List all freelancer profiles (public)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.skill) filter.skills = { $in: [req.query.skill] };
    if (req.query.available === 'true') filter.isAvailable = true;
    if (req.query.experienceLevel) filter.experienceLevel = req.query.experienceLevel;

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .select('-__v')
        .sort({ averageRating: -1, completedJobs: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Profile.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: profiles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profiles' });
  }
});

/**
 * GET /api/profiles/me
 * Get the authenticated freelancer's own profile
 */
router.get('/me', async (req, res) => {
  if (req.user.role !== 'freelancer') {
    return res.status(403).json({ success: false, message: 'Only freelancers have profiles' });
  }
  try {
    let profile = await Profile.findOne({ userId: req.user.id }).lean();
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not yet created. Use POST /api/profiles to create.' });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/profiles/:userId
 * Get a specific freelancer's profile by userId
 */
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

/**
 * POST /api/profiles
 * Create a new freelancer profile (one per user)
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('bio').optional().isLength({ max: 1000 }),
    body('skills').optional().isArray(),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('experienceLevel').optional().isIn(['entry', 'intermediate', 'expert']),
  ],
  validate,
  async (req, res) => {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Only freelancers can create profiles' });
    }
    try {
      const existing = await Profile.findOne({ userId: req.user.id });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Profile already exists. Use PATCH to update.' });
      }
      const profile = await Profile.create({ ...req.body, userId: req.user.id });
      res.status(201).json({ success: true, data: profile });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create profile' });
    }
  }
);

/**
 * PATCH /api/profiles/me
 * Update authenticated freelancer's profile
 */
router.patch(
  '/me',
  [
    body('bio').optional().isLength({ max: 1000 }),
    body('skills').optional().isArray(),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('experienceLevel').optional().isIn(['entry', 'intermediate', 'expert']),
  ],
  validate,
  async (req, res) => {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Only freelancers can update profiles' });
    }
    try {
      const allowed = ['name', 'bio', 'skills', 'hourlyRate', 'currency', 'location', 'portfolioLinks', 'languages', 'experienceLevel', 'isAvailable', 'avatar'];
      const updates = {};
      allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

      const profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
      res.json({ success: true, data: profile });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
);

module.exports = router;
