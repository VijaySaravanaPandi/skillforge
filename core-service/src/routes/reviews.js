const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Profile = require('../models/Profile');
const Job = require('../models/Job');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

/**
 * POST /api/reviews
 * Submit a review after job completion
 */
router.post(
  '/',
  [
    body('jobId').isMongoId(),
    body('revieweeId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isLength({ max: 1000 }),
    body('categories.communication').optional().isInt({ min: 1, max: 5 }),
    body('categories.quality').optional().isInt({ min: 1, max: 5 }),
    body('categories.expertise').optional().isInt({ min: 1, max: 5 }),
    body('categories.timeliness').optional().isInt({ min: 1, max: 5 }),
  ],
  validate,
  async (req, res) => {
    try {
      const job = await Job.findById(req.body.jobId);
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      if (!['in_progress', 'completed'].includes(job.status)) {
        return res.status(400).json({ success: false, message: 'Can only review jobs that are in progress or completed' });
      }

      const review = await Review.create({
        jobId: req.body.jobId,
        reviewerId: req.user.id,
        revieweeId: req.body.revieweeId,
        reviewerRole: req.user.role,
        rating: req.body.rating,
        comment: req.body.comment || '',
        categories: req.body.categories || {},
      });

      // Update freelancer's average rating if reviewing a freelancer
      if (req.user.role === 'client') {
        const allReviews = await Review.find({ revieweeId: req.body.revieweeId, reviewerRole: 'client' });
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Profile.findOneAndUpdate(
          { userId: req.body.revieweeId },
          { averageRating: parseFloat(avg.toFixed(2)), reviewCount: allReviews.length }
        );
      }

      res.status(201).json({ success: true, data: review });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this job' });
      }
      res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
  }
);

/**
 * GET /api/reviews/user/:userId
 * Get all reviews for a specific user (profile page)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ revieweeId: req.params.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ revieweeId: req.params.userId }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

/**
 * GET /api/reviews/job/:jobId
 * Get reviews for a specific job
 */
router.get('/job/:jobId', [param('jobId').isMongoId()], validate, async (req, res) => {
  try {
    const reviews = await Review.find({ jobId: req.params.jobId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

module.exports = router;
