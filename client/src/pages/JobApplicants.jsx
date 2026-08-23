import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { Sparkles, ArrowLeft, Check, X, Star, Clock, AlertCircle, RefreshCw, Award } from 'lucide-react';

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    try {
      setLoading(true);
      const [jobRes, appRes] = await Promise.all([
        api.get(`/api/jobs/${jobId}`),
        api.get(`/api/applications/job/${jobId}`),
      ]);
      if (jobRes.data.success) setJob(jobRes.data.data);
      if (appRes.data.success) setApplicants(appRes.data.data);
    } catch (err) {
      setError('Failed to load applicants or job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAIMatching = async () => {
    if (!job || applicants.length === 0) return;
    setScoring(true);
    setError('');
    setActionSuccess('');
    try {
      // 1. Fetch profile details for all applicants to get bios and skills
      const profilePromises = applicants.map((app) =>
        api.get(`/api/profiles/${app.freelancerId}`).catch(() => null)
      );
      const profileResponses = await Promise.all(profilePromises);

      const freelancerPayloads = applicants.map((app, idx) => {
        const p = profileResponses[idx]?.data?.data;
        return {
          freelancer_id: app.freelancerId,
          bio: p?.bio || app.coverLetter || '',
          skills: p?.skills || [],
          experience_level: p?.experienceLevel || 'intermediate',
          hourly_rate: p?.hourlyRate || app.proposedRate || 0,
        };
      });

      // 2. Call AI matching service
      const matchRes = await api.post('/match/score', {
        job_id: job._id,
        job_description: job.description,
        skills_required: job.skillsRequired,
        experience_level: job.experienceLevel,
        freelancers: freelancerPayloads,
      });

      if (matchRes.data.results) {
        // 3. Update scores on each application in core-service
        const updatePromises = matchRes.data.results.map((result) => {
          const app = applicants.find((a) => a.freelancerId === result.freelancer_id);
          if (app) {
            return api.patch(`/api/applications/${app._id}/score`, {
              aiMatchScore: result.score,
            });
          }
          return Promise.resolve();
        });
        await Promise.all(updatePromises);

        setActionSuccess('AI Matching completed! Candidates ranked by semantic vector similarity.');
        fetchJobAndApplicants();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'AI matching service error. Please try again.');
    } finally {
      setScoring(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const res = await api.patch(`/api/applications/${applicationId}/status`, { status: newStatus });
      if (res.data.success) {
        setApplicants(applicants.map((a) => (a._id === applicationId ? res.data.data : a)));
        if (newStatus === 'accepted') {
          setJob({ ...job, status: 'in_progress' });
        }
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate('/client/dashboard')}
        className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Job Summary Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{job?.title}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                {job?.status}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl line-clamp-2">{job?.description}</p>
          </div>

          <button
            onClick={handleRunAIMatching}
            disabled={scoring || applicants.length === 0}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex-shrink-0"
          >
            {scoring ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{scoring ? 'Scoring Embeddings...' : 'Rank Candidates with AI'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3 text-emerald-400 text-sm">
          <Award className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Applicants List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">
          Applicants ({applicants.length})
        </h2>

        {applicants.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No applications received yet for this project.</p>
          </div>
        ) : (
          applicants.map((app, index) => {
            const scorePercent =
              app.aiMatchScore !== null ? Math.round(app.aiMatchScore * 100) : null;

            return (
              <div
                key={app._id}
                className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-bold text-white">
                      Applicant #{index + 1}
                    </span>

                    {scorePercent !== null && (
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1.5 ${
                          scorePercent >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : scorePercent >= 60
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{scorePercent}% AI Match</span>
                      </span>
                    )}

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                        app.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 mb-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    "{app.coverLetter}"
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>
                      Proposed Rate:{' '}
                      <strong className="text-white">
                        ${app.proposedRate} {app.currency}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                  {app.status !== 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'accepted')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Hire</span>
                    </button>
                  )}

                  {app.status !== 'shortlisted' && app.status !== 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-700"
                    >
                      Shortlist
                    </button>
                  )}

                  {app.status !== 'rejected' && app.status !== 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'rejected')}
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-xl text-xs transition"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {app.status === 'accepted' && (
                    <Link
                      to={`/review/job/${job._id}/user/${app.freelancerId}`}
                      className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Review Freelancer</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JobApplicants;
