import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redirect root to onboarding for now */}
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

