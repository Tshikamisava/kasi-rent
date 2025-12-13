import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AIAssistant from "./components/AIAssistant";

// Lazy load components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Properties = lazy(() => import("./pages/Properties"));
const About = lazy(() => import("./pages/About"));
const SignIn = lazy(() => import("./pages/SignIn"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TenantDashboard = lazy(() => import("./pages/TenantDashboard"));
const LandlordDashboard = lazy(() => import("./pages/LandlordDashboard"));
const Payments = lazy(() => import("./pages/Payments"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {/* AI Assistant - Available on all pages */}
        <AIAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
