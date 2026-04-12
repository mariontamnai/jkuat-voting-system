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
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/vote" element={<CastVote />} />
        <Route path="/vote-submitted" element={<VoteSubmitted />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/winner" element={<WinnerAnnouncement />} />
      </Routes>
    </Router>
  );
}

export default App;