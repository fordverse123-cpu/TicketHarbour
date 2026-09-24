import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Common Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { PrivateRoute, AdminRoute, SuperAdminRoute } from './components/common/ProtectedRoute';
import AeroShardsBackground from './components/layout/AeroShardsBackground';
import MobileBottomNav from './components/layout/MobileBottomNav';
import TicketHarbourAIWidget from './components/ai/TicketHarbourAIWidget';

// Route Level Code Splitting via React.lazy()
const Home = lazy(() => import('./pages/Home'));
const Listings = lazy(() => import('./pages/Listings'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const TrainBookingPage = lazy(() => import('./pages/TrainBookingPage'));
const BusBookingPage = lazy(() => import('./pages/BusBookingPage'));
const FlightBookingPage = lazy(() => import('./pages/FlightBookingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const SuperAdminLogin = lazy(() => import('./pages/admin/SuperAdminLogin'));

const Checkout = lazy(() => import('./pages/Checkout'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Profile = lazy(() => import('./pages/Profile'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminListings = lazy(() => import('./pages/admin/AdminListings'));
const AdminRevenuePage = lazy(() => import('./pages/admin/AdminRevenuePage'));
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard'));
const CreateAdmin = lazy(() => import('./pages/admin/CreateAdmin'));

const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const SportsPage = lazy(() => import('./pages/SportsPage'));
const AttractionsPage = lazy(() => import('./pages/AttractionsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#03B3C3] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="relative min-h-screen font-sans bg-[var(--th-page)] text-[var(--th-text)] overflow-x-hidden transition-colors duration-200">
            {/* AeroShards WebGL Background */}
            <AeroShardsBackground />

            {/* Main App Canvas */}
            <div className="relative z-10 flex flex-col min-h-screen pb-14 lg:pb-0">
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
              
              <Navbar />

              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Suspense fallback={<PageFallback />}>
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
                      <Route path="/admin/revenue" element={<AdminRevenuePage />} />
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

                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>

              <TicketHarbourAIWidget />
              <Footer />
              <MobileBottomNav />
            </div>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
