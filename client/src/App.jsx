import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { testConnection } from './services/api';

// Layout
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';

// User Dashboard
import DashboardPage from './pages/DashboardPage';
import RoomBookingPage from './pages/RoomBookingPage';
import TableReservationPage from './pages/TableReservationPage';
import GardenBookingPage from './pages/GardenBookingPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import ProfilePage from './pages/ProfilePage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageRoomsPage from './pages/admin/ManageRoomsPage';
import ManageMenuPage from './pages/admin/ManageMenuPage';
import ManageOrdersPage from './pages/admin/ManageOrdersPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

// Components
import LoadingSpinner from './components/shared/LoadingSpinner';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const data = await testConnection();
        setConnectionStatus({ success: true, message: data.message });
      } catch (error) {
        setConnectionStatus({ success: false, message: 'Backend connection failed' });
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {connectionStatus && !connectionStatus.success && (
        <div className="bg-red-500 text-white p-2 text-center text-sm">
          Warning: {connectionStatus.message}. Please check if the backend is running.
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/book/room" element={
            <ProtectedRoute>
              <RoomBookingPage />
            </ProtectedRoute>
          } />
          <Route path="/book/table" element={
            <ProtectedRoute>
              <TableReservationPage />
            </ProtectedRoute>
          } />
          <Route path="/book/garden" element={
            <ProtectedRoute>
              <GardenBookingPage />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <BookingHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageRoomsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageMenuPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageBookingsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
                <p className="text-xl text-secondary-600 mb-8">Page not found</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

