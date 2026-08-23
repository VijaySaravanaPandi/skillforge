const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    reviewerId: {
      type: String,
      required: true,
    },
    revieweeId: {
      type: String,
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['client', 'freelancer'],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating between 1–5 is required'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
      default: '',
    },
    categories: {
      communication: { type: Number, min: 1, max: 5, default: null },
      quality: { type: Number, min: 1, max: 5, default: null },
      expertise: { type: Number, min: 1, max: 5, default: null },
      timeliness: { type: Number, min: 1, max: 5, default: null },
    },
  },
  { timestamps: true }
);

// One review per reviewer per job
reviewSchema.index({ jobId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ revieweeId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
