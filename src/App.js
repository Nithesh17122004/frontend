import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

// Clear localStorage on first load
const cleanupStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && typeof userStr === 'string' && !userStr.startsWith('{')) {
      localStorage.clear();
    }
  } catch (error) {
    localStorage.clear();
  }
};

// Run cleanup
cleanupStorage();

function App() {
  return (
    <Router>
      <AuthProvider>
        <FileProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/activate/:token" element={<ActivateAccount />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </FileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;