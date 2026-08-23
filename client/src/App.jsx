import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import PostJob from './pages/PostJob';
import JobApplicants from './pages/JobApplicants';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ProfileEditor from './pages/ProfileEditor';
import ReviewForm from './pages/ReviewForm';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* Client Routes */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-job"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:jobId/applicants"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <JobApplicants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review/job/:jobId/user/:userId"
                element={
                  <ProtectedRoute allowedRoles={['client', 'freelancer']}>
                    <ReviewForm />
                  </ProtectedRoute>
                }
              />

              {/* Freelancer Routes */}
              <Route
                path="/freelancer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['freelancer']}>
                    <FreelancerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['freelancer']}>
                    <ProfileEditor />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
