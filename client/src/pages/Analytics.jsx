import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, BarChart2, Briefcase, Users, Star, Layers } from 'lucide-react';

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'];

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [topSkills, setTopSkills] = useState([]);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [ovRes, skillsRes, trendsRes, catRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/top-skills?limit=8'),
        api.get('/api/analytics/application-trends?days=14'),
        api.get('/api/analytics/job-categories'),
      ]);

      if (ovRes.data.success) setOverview(ovRes.data.data);
      if (skillsRes.data.success) setTopSkills(skillsRes.data.data);
      if (trendsRes.data.success) setTrends(trendsRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // Fallback demo data if database is fresh
  const displaySkills = topSkills.length > 0 ? topSkills : [
    { skill: 'React', count: 12 },
    { skill: 'Python', count: 10 },
    { skill: 'Node.js', count: 9 },
    { skill: 'FastAPI', count: 8 },
    { skill: 'MongoDB', count: 7 },
    { skill: 'Tailwind CSS', count: 6 },
    { skill: 'TypeScript', count: 5 },
    { skill: 'Docker', count: 4 },
  ];

  const displayTrends = trends.length > 0 ? trends : [
    { date: '08-10', count: 3 },
    { date: '08-11', count: 5 },
    { date: '08-12', count: 4 },
    { date: '08-13', count: 8 },
    { date: '08-14', count: 12 },
    { date: '08-15', count: 9 },
    { date: '08-16', count: 15 },
  ];

  const displayCategories = categories.length > 0 ? categories : [
    { category: 'Web Dev', count: 18 },
    { category: 'AI & ML', count: 12 },
    { category: 'Mobile Apps', count: 8 },
    { category: 'DevOps', count: 6 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Marketplace Analytics</h1>
        </div>
        <p className="text-sm text-slate-400">
          Real-time insights on skill demand, candidate flows, and job postings
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Total Projects</span>
          </div>
          <p className="text-2xl font-bold text-white">{overview?.totalJobs || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>Open Gigs</span>
          </div>
          <p className="text-2xl font-bold text-white">{overview?.openJobs || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Applications</span>
          </div>
          <p className="text-2xl font-bold text-white">{overview?.totalApplications || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Verified Reviews</span>
          </div>
          <p className="text-2xl font-bold text-white">{overview?.totalReviews || 0}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Skills in Demand Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Top Skills in Demand</h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Active postings
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displaySkills} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="skill" type="category" stroke="#cbd5e1" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Velocity Area Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-white">Application Velocity</h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Recent activity
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayTrends}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
