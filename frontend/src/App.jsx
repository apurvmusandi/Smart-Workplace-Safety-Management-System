import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import BootScreen from './pages/BootScreen';
import DashboardLayout from './layouts/DashboardLayout';
import LiveMonitoring from './pages/dashboard/LiveMonitoring';
import History from './pages/dashboard/History';
import Alerts from './pages/dashboard/Alerts';
import Analytics from './pages/dashboard/Analytics';
import EmergencyControl from './pages/dashboard/EmergencyControl';
import Diagnostics from './pages/dashboard/Diagnostics';
import Developers from './pages/dashboard/Developers';
import About from './pages/dashboard/About';

const ProtectedRoute = ({ children }) => {
  const auth = localStorage.getItem('swms_auth');
  return auth === 'true' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/boot" element={<BootScreen />} />
          
          <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/app/monitoring" replace />} />
            <Route path="monitoring" element={<LiveMonitoring />} />
            <Route path="history" element={<History />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="diagnostics" element={<Diagnostics />} />
            <Route path="emergency" element={<EmergencyControl />} />
            <Route path="developers" element={<Developers />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
