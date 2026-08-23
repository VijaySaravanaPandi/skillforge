const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Profile = require('../models/Profile');
const Review = require('../models/Review');

const router = express.Router();

/**
 * GET /api/analytics/overview
 * Platform-wide statistics
 */
router.get('/overview', async (req, res) => {
  try {
    const [totalJobs, openJobs, totalApplications, totalProfiles, totalReviews] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Application.countDocuments(),
      Profile.countDocuments(),
      Review.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { totalJobs, openJobs, totalApplications, totalProfiles, totalReviews },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch overview' });
  }
});

/**
 * GET /api/analytics/top-skills
 * Top skills in demand across all open job postings
 */
router.get('/top-skills', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;

    const result = await Job.aggregate([
      { $match: { status: { $in: ['open', 'in_progress'] } } },
      { $unwind: '$skillsRequired' },
      {
        $group: {
          _id: { $toLower: '$skillsRequired' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, skill: '$_id', count: 1 } },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch top skills' });
  }
});

/**
 * GET /api/analytics/application-trends
 * Application submission counts grouped by day (last 30 days)
 */
router.get('/application-trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await Application.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' },
              },
            },
          },
          count: 1,
        },
      },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch application trends' });
  }
});

/**
 * GET /api/analytics/job-categories
 * Job count grouped by category
 */
router.get('/job-categories', async (req, res) => {
  try {
    const result = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch job categories' });
  }
});

/**
 * GET /api/analytics/my
 * Client/Freelancer personal analytics
 */
router.get('/my', async (req, res) => {
  try {
    if (req.user.role === 'client') {
      const [myJobs, myApplicants] = await Promise.all([
        Job.find({ clientId: req.user.id }).lean(),
        Application.countDocuments({
          jobId: { $in: await Job.find({ clientId: req.user.id }).distinct('_id') },
        }),
      ]);
      const jobStatusBreakdown = myJobs.reduce((acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1;
        return acc;
      }, {});
      return res.json({ success: true, data: { totalJobs: myJobs.length, totalApplicants: myApplicants, jobStatusBreakdown } });
    }

    if (req.user.role === 'freelancer') {
      const [applications, profile] = await Promise.all([
        Application.find({ freelancerId: req.user.id }).lean(),
        Profile.findOne({ userId: req.user.id }).lean(),
      ]);
      const statusBreakdown = applications.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});
      return res.json({
        success: true,
        data: {
          totalApplications: applications.length,
          statusBreakdown,
          averageRating: profile?.averageRating || 0,
          completedJobs: profile?.completedJobs || 0,
          reviewCount: profile?.reviewCount || 0,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch personal analytics' });
  }
});

module.exports = router;
