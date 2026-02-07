import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Auth pages
const StudentLoginPage = lazy(() => import("./pages/auth/StudentLoginPage"));
const LecturerLoginPage = lazy(() => import("./pages/auth/LecturerLoginPage"));
const AdminLoginPage = lazy(() => import("./pages/auth/AdminLoginPage"));
const SuperAdminLoginPage = lazy(() => import("./pages/auth/SuperAdminLoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));

// Dashboard pages
const StudentDashboard = lazy(() => import("./pages/dashboard/StudentDashboard"));
const LecturerDashboard = lazy(() => import("./pages/dashboard/LecturerDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/dashboard/SuperAdminDashboard"));

// Loading fallback with accessibility
function PageLoader() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-2xl">N</span>
        </div>
        <div className="flex gap-1" aria-hidden="true">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Skip to main content link for keyboard users */}
          <a 
            href="#main-content" 
            className="skip-link"
          >
            Skip to main content
          </a>
          
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              {/* Public Pages */}
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              
              {/* Auth Pages */}
              <Route path="/login/student" element={<StudentLoginPage />} />
              <Route path="/login/lecturer" element={<LecturerLoginPage />} />
              <Route path="/login/admin" element={<AdminLoginPage />} />
              <Route path="/login/super-admin" element={<SuperAdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Dashboard Pages */}
              <Route path="/dashboard/student/*" element={<StudentDashboard />} />
              <Route path="/dashboard/lecturer/*" element={<LecturerDashboard />} />
              <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
              <Route path="/dashboard/super-admin/*" element={<SuperAdminDashboard />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
