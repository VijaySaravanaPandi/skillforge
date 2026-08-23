import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Briefcase, Search, Filter, Sparkles, Send, CheckCircle2, Clock, DollarSign, X } from 'lucide-react';

const FreelancerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'applications'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState(50);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/api/jobs?status=open'),
        api.get('/api/applications/my'),
      ]);
      if (jobsRes.data.success) setJobs(jobsRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');
    setApplying(true);
    try {
      const res = await api.post('/api/applications', {
        jobId: selectedJob._id,
        coverLetter,
        proposedRate: Number(proposedRate),
      });
      if (res.data.success) {
        setApplySuccess('Application submitted successfully!');
        setApplications([res.data.data, ...applications]);
        setTimeout(() => {
          setSelectedJob(null);
          setCoverLetter('');
          setApplySuccess('');
        }, 1500);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const appliedJobIds = new Set(applications.map((a) => (typeof a.jobId === 'object' ? a.jobId?._id : a.jobId)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Freelancer Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Explore open projects and track your application progress</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'browse'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explore Projects ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'applications'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Applications ({applications.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, skill (e.g. React, Python), or keywords..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Job Feed */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No matching projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => {
                const hasApplied = appliedJobIds.has(job._id);
                return (
                  <div
                    key={job._id}
                    className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{job.title}</h3>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 font-medium capitalize flex-shrink-0">
                          {job.category || 'General'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-3 mb-4">{job.description}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.skillsRequired.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        <span className="font-semibold text-white text-sm">
                          ${job.budget?.min} - ${job.budget?.max}
                        </span>{' '}
                        {job.budget?.currency}
                      </div>

                      {hasApplied ? (
                        <span className="inline-flex items-center space-x-1.5 text-xs text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setProposedRate(job.budget?.min || 50);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Applications Tab */
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">You haven't applied to any projects yet.</p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-base font-bold text-white">
                    {app.jobId?.title || 'Project Application'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Cover Letter: "{app.coverLetter}"
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Rate: ${app.proposedRate} {app.currency} • Applied on{' '}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {app.aiMatchScore !== null && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{Math.round(app.aiMatchScore * 100)}% Match</span>
                    </span>
                  )}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
                      app.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : app.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Apply for Project</h2>
            <p className="text-xs text-slate-400 mb-6 truncate">{selectedJob.title}</p>

            {applyError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {applyError}
              </div>
            )}
            {applySuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                {applySuccess}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Proposed Rate ($)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Cover Letter & Pitch
                </label>
                <textarea
                  required
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you're a great fit and highlight relevant experience..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;
