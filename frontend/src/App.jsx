import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PolicyDetailPage from './pages/PolicyDetailPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark">
        <div className="container mx-auto px-4 py-6">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/policy/:id" element={<PolicyDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </div>

        {/* Background Gradient Effects */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-rose/10 rounded-full blur-3xl" />
        </div>
      </div>
    </Router>
  );
}

export default App;