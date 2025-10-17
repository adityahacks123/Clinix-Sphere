import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Auth from './components/Auth';
import DoctorDashboard from './components/DoctorDashboard';
import ClientDashboard from './components/ClientDashboard';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <div className={`App ${isAuthPage ? 'auth-layout' : ''}`}>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
