import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Briefcase, BarChart2, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl group-hover:border-emerald-500/60 transition duration-300">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              SkillForge
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'}
                  className="text-sm font-medium text-slate-300 hover:text-white transition flex items-center space-x-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Dashboard</span>
                </Link>

                {user?.role === 'client' && (
                  <Link
                    to="/post-job"
                    className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Job</span>
                  </Link>
                )}

                {user?.role === 'freelancer' && (
                  <Link
                    to="/profile"
                    className="text-sm font-medium text-slate-300 hover:text-white transition flex items-center space-x-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/50"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>My Profile</span>
                  </Link>
                )}

                <Link
                  to="/analytics"
                  className="text-sm font-medium text-slate-300 hover:text-white transition flex items-center space-x-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  <BarChart2 className="w-4 h-4 text-teal-400" />
                  <span>Analytics</span>
                </Link>

                <div className="h-5 w-px bg-slate-800" />

                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800/60 text-slate-300 font-medium capitalize">
                    {user?.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800/50 transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800/50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
