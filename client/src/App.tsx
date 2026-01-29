import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AIAssistant from "./components/AIAssistant";

// Lazy load components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Properties = lazy(() => import("./pages/Properties"));
const About = lazy(() => import("./pages/About"));
const SignIn = lazy(() => import("./pages/SignIn"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TenantDashboard = lazy(() => import("./pages/TenantDashboard"));
const LandlordDashboard = lazy(() => import("./pages/LandlordDashboard"));
const Payments = lazy(() => import("./pages/Payments"));
const Chat = lazy(() => import("./pages/Chat"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TenantVerification = lazy(() => import("./pages/TenantVerification"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));
const MapSearch = lazy(() => import("./pages/MapSearch"));
const ListProperty = lazy(() => import("./pages/ListProperty"));
const FindAgents = lazy(() => import("./pages/FindAgents"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const SafetyTips = lazy(() => import("./pages/SafetyTips"));
const SaveMoney = lazy(() => import("./pages/SaveMoney"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Floating scroll controls (top button at top-right, bottom button at bottom-right)
const ScrollControls = () => {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setCanScrollUp(top > 8);
      setCanScrollDown(top < height - 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const btnBase = 'w-9 h-9 flex items-center justify-center rounded-full shadow-lg bg-primary text-white text-sm hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary/60';

  return (
    <>
      <button
        onClick={scrollToTop}
        disabled={!canScrollUp}
        className={`${btnBase} fixed right-4 top-20 z-40 ${!canScrollUp ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Scroll to top"
      >
        ↑
      </button>
      <button
        onClick={scrollToBottom}
        disabled={!canScrollDown}
        className={`${btnBase} fixed right-4 bottom-24 z-40 ${!canScrollDown ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Scroll to bottom"
      >
        ↓
      </button>
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/about" element={<About />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/payments" element={<Payments />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard/tenant" 
              element={
                <ProtectedRoute requiredRole="tenant">
                  <TenantDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/landlord" 
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Chat - protected for authenticated users */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Bookings - protected for authenticated users */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {/* Favorites - protected for authenticated users */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />

            {/* Profile - protected for authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard - protected for admin users only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Tenant Verification - protected for authenticated users */}
            <Route
              path="/verification"
              element={
                <ProtectedRoute>
                  <TenantVerification />
                </ProtectedRoute>
              }
            />

            {/* Advanced Search - public access */}
            <Route path="/search" element={<AdvancedSearch />} />
            {/* Map Search - pick a point on the map to search nearby */}
            <Route path="/map-search" element={<MapSearch />} />
            <Route path="/list-property" element={<ListProperty />} />
            <Route path="/save-money" element={<SaveMoney />} />
            <Route path="/agents" element={<FindAgents />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<SafetyTips />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {/* AI Assistant - Available on all pages */}
        <AIAssistant />
        <ScrollControls />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
