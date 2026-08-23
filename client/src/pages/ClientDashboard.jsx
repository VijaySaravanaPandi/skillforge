import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Plus, Briefcase, Users, Eye, Sparkles, AlertCircle, Clock, Trash2 } from 'lucide-react';

const ClientDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/jobs/client/my');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      setError('Failed to load your posted jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await api.delete(`/api/jobs/${jobId}`);
      if (res.data.success) {
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Client Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your posted projects and AI-ranked applicants</p>
        </div>
        <Link
          to="/post-job"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Project</span>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Jobs Posted</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{jobs.length}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Active / Open</span>
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">
            {jobs.filter((j) => j.status === 'open').length}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Applicants</span>
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">
            {jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Your Job Postings</h2>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No jobs posted yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Create your first project posting and let our AI match qualified candidates instantly.
            </p>
            <Link
              to="/post-job"
              className="inline-flex items-center space-x-2 mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job</span>
            </Link>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job._id}
              className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-white truncate">{job.title}</h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                      job.status === 'open'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : job.status === 'in_progress'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{job.description}</p>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {job.skillsRequired.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                  <span className="text-xs text-slate-500 ml-2 font-medium">
                    Budget: ${job.budget?.min} - ${job.budget?.max} {job.budget?.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                <Link
                  to={`/jobs/${job._id}/applicants`}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Matches ({job.applicantCount || 0})</span>
                </Link>

                <button
                  onClick={() => handleDelete(job._id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 rounded-xl transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
