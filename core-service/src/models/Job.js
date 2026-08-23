const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    skillsRequired: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: [(arr) => arr.length > 0, 'Skills array cannot be empty'],
    },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    duration: {
      type: String,
      enum: ['less_than_1_week', '1_to_4_weeks', '1_to_3_months', '3_to_6_months', 'more_than_6_months'],
      default: '1_to_4_weeks',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    clientId: {
      type: String, // from JWT (X-User-Id header)
      required: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    attachments: [{ type: String }], // URLs
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for text search
jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ clientId: 1 });

module.exports = mongoose.model('Job', jobSchema);
