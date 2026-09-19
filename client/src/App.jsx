import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Common Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { PrivateRoute, AdminRoute, SuperAdminRoute } from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import TrainBookingPage from './pages/TrainBookingPage';
import BusBookingPage from './pages/BusBookingPage';
import FlightBookingPage from './pages/FlightBookingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Private Admin & Super Admin Logins
import AdminLogin from './pages/admin/AdminLogin';
import SuperAdminLogin from './pages/admin/SuperAdminLogin';

// Protected User Pages
import Checkout from './pages/Checkout';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import WishlistPage from './pages/WishlistPage';

// Admin & Super Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import CreateAdmin from './pages/admin/CreateAdmin';

import HyperspeedBackground from './components/layout/HyperspeedBackground';

// Dedicated Category Pages
import MoviesPage from './pages/MoviesPage';
import EventsPage from './pages/EventsPage';
import SportsPage from './pages/SportsPage';
import AttractionsPage from './pages/AttractionsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="relative min-h-screen font-sans bg-[var(--th-page)] text-[var(--th-text)] overflow-x-hidden transition-colors duration-200">
            {/* Hyperspeed WebGL Background */}
            <HyperspeedBackground />

            {/* Dark/Light Overlay for UI legibility */}
            <div className="fixed inset-0 bg-black/30 dark:bg-black/40 light:bg-white/70 pointer-events-none z-0" />

            {/* Main App Canvas */}
            <div className="relative z-10 flex flex-col min-h-screen">
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/sports" element={<SportsPage />} />
              <Route path="/attractions" element={<AttractionsPage />} />
              <Route path="/train" element={<TrainBookingPage />} />
              <Route path="/trains" element={<TrainBookingPage />} />
              <Route path="/bus" element={<BusBookingPage />} />
              <Route path="/buses" element={<BusBookingPage />} />
              <Route path="/flights" element={<FlightBookingPage />} />
              <Route path="/listings/:identifier" element={<ListingDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Navigate to="/register" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              <Route path="/verify-email/:verifyToken" element={<VerifyEmail />} />

              {/* Private Dedicated Logins */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />

              {/* Protected User Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<WishlistPage />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/listings" element={<AdminListings />} />
              </Route>

              {/* Super Admin Protected Routes */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/admin/super" element={<SuperAdminDashboard />} />
                <Route path="/admin/super/admins" element={<SuperAdminDashboard />} />
                <Route path="/admin/super/admins/create" element={<CreateAdmin />} />
                <Route path="/super-admin" element={<SuperAdminDashboard />} />
                <Route path="/super-admin/admins" element={<SuperAdminDashboard />} />
                <Route path="/super-admin/admins/create" element={<CreateAdmin />} />
                <Route path="/super-admin/create" element={<CreateAdmin />} />
              </Route>
            </Routes>
          </main>

          <Footer />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
