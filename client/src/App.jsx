import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout & Common Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { PrivateRoute, AdminRoute } from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Protected User Pages
import Checkout from './pages/Checkout';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import WishlistPage from './pages/WishlistPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:identifier" element={<ListingDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              <Route path="/verify-email/:verifyToken" element={<VerifyEmail />} />

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
                <Route path="/admin/listings" element={<AdminListings />} />
              </Route>
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
