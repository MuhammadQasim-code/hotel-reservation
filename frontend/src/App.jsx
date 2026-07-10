import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import BrowseHotels from './pages/BrowseHotels';
import HotelDetails from './pages/HotelDetails';
import MakeReservation from './pages/MakeReservation';
import UserDashboard from './pages/UserDashboard';
import MyReservations from './pages/MyReservations';
import MyProfile from './pages/MyProfile';

// Import Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminManageHotels from './pages/AdminManageHotels';
import AdminManageReservations from './pages/AdminManageReservations';
import AdminManageUsers from './pages/AdminManageUsers';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route component to direct authenticated users to their correct dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/hotels" element={<BrowseHotels />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />

          {/* Protected General / User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />
          <Route path="/my-reservations" element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          } />
          <Route path="/book/:hotelId" element={
            <ProtectedRoute>
              <MakeReservation />
            </ProtectedRoute>
          } />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/hotels" element={
            <AdminRoute>
              <AdminManageHotels />
            </AdminRoute>
          } />
          <Route path="/admin/reservations" element={
            <AdminRoute>
              <AdminManageReservations />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminManageUsers />
            </AdminRoute>
          } />

          {/* Helper Redirects */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth" replace />} />
          <Route path="/dashboard-redirect" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
