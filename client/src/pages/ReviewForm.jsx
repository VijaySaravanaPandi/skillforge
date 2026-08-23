import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Star, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ReviewForm = () => {
  const { jobId, userId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [communication, setCommunication] = useState(5);
  const [quality, setQuality] = useState(5);
  const [expertise, setExpertise] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        jobId,
        revieweeId: userId,
        rating: Number(rating),
        comment,
        categories: {
          communication: Number(communication),
          quality: Number(quality),
          expertise: Number(expertise),
          timeliness: Number(timeliness),
        },
      };
      const res = await api.post('/api/reviews', payload);
      if (res.data.success) {
        setSuccess('Review submitted successfully! Thank you for your feedback.');
        setTimeout(() => navigate('/client/dashboard'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarPicker = (val, setVal, label) => (
    <div>
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setVal(s)}
            className="p-1 text-slate-600 hover:text-amber-400 transition"
          >
            <Star
              className={`w-6 h-6 ${
                s <= val ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
              }`}
            />
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-2 font-medium">{val} / 5</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go Back</span>
      </button>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Leave a Project Review</h1>
        <p className="text-sm text-slate-400 mb-6">
          Rate performance and provide constructive feedback to build platform reputation
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            {renderStarPicker(rating, setRating, 'Overall Rating')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
            {renderStarPicker(communication, setCommunication, 'Communication')}
            {renderStarPicker(quality, setQuality, 'Work Quality')}
            {renderStarPicker(expertise, setExpertise, 'Technical Expertise')}
            {renderStarPicker(timeliness, setTimeliness, 'Timeliness & Deadlines')}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Detailed Feedback / Comment
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was it like working with this freelancer? Mention strengths and outcomes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {submitting ? 'Submitting Review...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
