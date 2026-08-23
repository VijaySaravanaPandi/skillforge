const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

/**
 * POST /api/applications
 * Freelancer applies to a job
 */
router.post(
  '/',
  [
    body('jobId').isMongoId().withMessage('Valid jobId is required'),
    body('coverLetter').trim().notEmpty().isLength({ max: 2000 }),
    body('proposedRate').isFloat({ min: 0 }),
    body('estimatedDuration').optional().isString(),
  ],
  validate,
  async (req, res) => {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Only freelancers can apply to jobs' });
    }
    try {
      const job = await Job.findById(req.body.jobId);
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      if (job.status !== 'open') {
        return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
      }

      const application = await Application.create({
        jobId: req.body.jobId,
        freelancerId: req.user.id,
        coverLetter: req.body.coverLetter,
        proposedRate: req.body.proposedRate,
        currency: req.body.currency || 'USD',
        estimatedDuration: req.body.estimatedDuration || '',
      });

      // Increment applicant count on job
      await Job.findByIdAndUpdate(req.body.jobId, { $inc: { applicantCount: 1 } });

      res.status(201).json({ success: true, data: application });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You have already applied to this job' });
      }
      res.status(500).json({ success: false, message: 'Failed to submit application' });
    }
  }
);

/**
 * GET /api/applications/my
 * Freelancer: get their own applications
 */
router.get('/my', async (req, res) => {
  if (req.user.role !== 'freelancer') {
    return res.status(403).json({ success: false, message: 'Only freelancers can view their applications' });
  }
  try {
    const applications = await Application.find({ freelancerId: req.user.id })
      .populate('jobId', 'title status budget clientId')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

/**
 * GET /api/applications/job/:jobId
 * Client: view all applications for one of their jobs (sorted by AI score)
 */
router.get('/job/:jobId', [param('jobId').isMongoId()], validate, async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Only clients can view job applications' });
  }
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only view applications for your own jobs' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .sort({ aiMatchScore: -1, createdAt: 1 })
      .lean();

    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

/**
 * PATCH /api/applications/:id/status
 * Client: change application status (shortlist, accept, reject)
 */
router.patch(
  '/:id/status',
  [
    param('id').isMongoId(),
    body('status').isIn(['reviewed', 'shortlisted', 'accepted', 'rejected']),
  ],
  validate,
  async (req, res) => {
    if (req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only clients can update application status' });
    }
    try {
      const application = await Application.findById(req.params.id);
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

      // Verify client owns the job
      const job = await Job.findById(application.jobId);
      if (!job || job.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      application.status = req.body.status;
      await application.save();

      // If accepted, mark job as in_progress
      if (req.body.status === 'accepted') {
        await Job.findByIdAndUpdate(application.jobId, { status: 'in_progress' });
      }

      res.json({ success: true, data: application });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update application status' });
    }
  }
);

/**
 * PATCH /api/applications/:id/withdraw
 * Freelancer: withdraw their own application
 */
router.patch('/:id/withdraw', [param('id').isMongoId()], validate, async (req, res) => {
  if (req.user.role !== 'freelancer') {
    return res.status(403).json({ success: false, message: 'Only freelancers can withdraw applications' });
  }
  try {
    const application = await Application.findOne({ _id: req.params.id, freelancerId: req.user.id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Cannot withdraw an accepted application' });
    }
    application.status = 'withdrawn';
    await application.save();
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to withdraw application' });
  }
});

/**
 * PATCH /api/applications/:id/score
 * Internal: update aiMatchScore (called from matching service via gateway)
 */
router.patch('/:id/score', [param('id').isMongoId(), body('aiMatchScore').isFloat({ min: 0, max: 1 })], validate, async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { aiMatchScore: req.body.aiMatchScore },
      { new: true }
    );
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update match score' });
  }
});

module.exports = router;
