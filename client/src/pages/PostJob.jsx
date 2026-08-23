import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Briefcase, AlertCircle, Sparkles, Plus, X, ArrowLeft } from 'lucide-react';

const PostJob = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState(['React', 'Node.js', 'Tailwind CSS']);
  const [skillInput, setSkillInput] = useState('');
  const [minBudget, setMinBudget] = useState(500);
  const [maxBudget, setMaxBudget] = useState(1500);
  const [duration, setDuration] = useState('1_to_4_weeks');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [category, setCategory] = useState('Web Development');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skillsRequired.includes(skillInput.trim())) {
      setSkillsRequired([...skillsRequired, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsRequired(skillsRequired.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skillsRequired.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        skillsRequired,
        budget: { min: Number(minBudget), max: Number(maxBudget), currency: 'USD' },
        duration,
        experienceLevel,
        category,
      };
      const res = await api.post('/api/jobs', payload);
      if (res.data.success) {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Post a New Project</h1>
            <p className="text-sm text-slate-400">Describe your project requirements for AI semantic matching</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build an AI-Powered Next.js E-Commerce Storefront"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Detailed Description & Scope
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the scope of work, deliverables, tech requirements, and project milestones..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-1.5 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span>Our NLP model will analyze this text to match candidates with semantic accuracy.</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Required Skills
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. Python, Docker, FastApi"
                className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-1.5 border border-slate-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skillsRequired.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Budget Range (USD)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="Min ($)"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="number"
                  min="0"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Max ($)"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Expected Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="less_than_1_week">&lt; 1 Week</option>
                <option value="1_to_4_weeks">1 to 4 Weeks</option>
                <option value="1_to_3_months">1 to 3 Months</option>
                <option value="3_to_6_months">3 to 6 Months</option>
                <option value="more_than_6_months">&gt; 6 Months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Web Development">Web Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Mobile Apps">Mobile Apps</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-8"
          >
            <span>{submitting ? 'Publishing Job...' : 'Publish Job & Match AI'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
