import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import FaceRecognition from './pages/FaceRecognition';
import CastVote from './pages/CastVote';
import VoteSubmitted from './pages/VoteSubmitted';
import Results from './pages/Results';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import WinnerAnnouncement from './pages/WinnerAnnouncement';
import ChangePassword from './pages/ChangePassword';
import Elections from './pages/admin/Elections';
import Candidates from './pages/admin/Candidates';
import CandidatesList from './pages/admin/CandidatesList';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuditLogs from './pages/admin/AuditLogs';
import SessionControl from './pages/admin/SessionControl';
import Settings from './pages/admin/Settings';
import CreateElection from './pages/admin/CreateElection';
import CreateCandidate from './pages/admin/CreateCandidate';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/elections" element={<Elections />} />
        <Route path="/admin/elections/create" element={<CreateElection />} />
        <Route path="/admin/candidates/create" element={<CreateCandidate />} />
        <Route path="/admin/candidates" element={<Candidates />} />
        <Route path="/admin/candidates/list" element={<CandidatesList />} />
        <Route path="/change-password" element={<ChangePassword />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/vote" element={<CastVote />} />
        <Route path="/vote-submitted" element={<VoteSubmitted />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/session-control" element={<SessionControl />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/winner" element={<WinnerAnnouncement />} />
      </Routes>
    </Router>
  );
}

export default App;