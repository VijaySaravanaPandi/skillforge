const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    freelancerId: {
      type: String, // X-User-Id from JWT
      required: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    proposedRate: {
      type: Number,
      min: 0,
      required: [true, 'Proposed rate is required'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    estimatedDuration: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    aiMatchScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });
applicationSchema.index({ freelancerId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
