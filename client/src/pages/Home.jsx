import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Semantic Matching</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Match with the perfect freelance talent using{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            NLP Embeddings
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Say goodbye to dumb keyword searches. SkillForge uses high-dimensional vector embeddings to understand project context and rank talent by true semantic fit.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/25"
          >
            <span>Start Matching Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto glass-card hover:bg-slate-800/80 text-slate-200 font-semibold px-8 py-4 rounded-xl transition duration-200 border border-slate-700 flex items-center justify-center"
          >
            Explore Dashboard
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Sentence-Transformer AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              384-dimensional dense embeddings trained on all-MiniLM-L6-v2 compute precise cosine similarities between project requirements and candidate bios.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Microservices Architecture</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Decoupled Node.js Express Gateway, MongoDB Core Service, and Python FastAPI AI Service communicating over low-latency REST and JWT token propagation.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Role-Based Workflows</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tailored experience for clients posting gigs and freelancers applying with automated match scores, reviews, and interactive analytics charts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
