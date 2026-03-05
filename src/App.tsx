import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Auth pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));

// Dashboard pages
const StudentDashboard = lazy(() => import("./pages/dashboard/StudentDashboard"));
const LecturerDashboard = lazy(() => import("./pages/dashboard/LecturerDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/dashboard/SuperAdminDashboard"));

// Student sub-pages
const StudentCoursesPage = lazy(() => import("./pages/dashboard/student/CoursesPage"));
const StudentAssignmentsPage = lazy(() => import("./pages/dashboard/student/AssignmentsPage"));
const StudentAttendancePage = lazy(() => import("./pages/dashboard/student/AttendancePage"));
const StudentResultsPage = lazy(() => import("./pages/dashboard/student/ResultsPage"));
const StudentAIAssistantPage = lazy(() => import("./pages/dashboard/student/AIAssistantPage"));
const StudentSchedulePage = lazy(() => import("./pages/dashboard/student/SchedulePage"));
const StudentProfilePage = lazy(() => import("./pages/dashboard/student/ProfilePage"));

// Lecturer sub-pages
const LecturerCoursesPage = lazy(() => import("./pages/dashboard/lecturer/CoursesPage"));
const LecturerAssignmentsPage = lazy(() => import("./pages/dashboard/lecturer/AssignmentsPage"));
const LecturerAttendancePage = lazy(() => import("./pages/dashboard/lecturer/AttendancePage"));
const LecturerResultsPage = lazy(() => import("./pages/dashboard/lecturer/ResultsPage"));
const LecturerStudentPerformancePage = lazy(() => import("./pages/dashboard/lecturer/StudentPerformancePage"));
const LecturerSchedulePage = lazy(() => import("./pages/dashboard/lecturer/SchedulePage"));
const LecturerProfilePage = lazy(() => import("./pages/dashboard/lecturer/ProfilePage"));

// Admin sub-pages
const AdminUsersPage = lazy(() => import("./pages/dashboard/admin/UsersPage"));
const AdminStudentManagement = lazy(() => import("./pages/dashboard/admin/StudentManagementPage"));
const AdminLecturerManagement = lazy(() => import("./pages/dashboard/admin/LecturerManagementPage"));
const AdminDepartmentManagement = lazy(() => import("./pages/dashboard/admin/DepartmentManagementPage"));
const AdminSubscription = lazy(() => import("./pages/dashboard/admin/SubscriptionPage"));
const AdminAttendanceAnalytics = lazy(() => import("./pages/dashboard/admin/AttendanceAnalyticsPage"));
const AdminSettings = lazy(() => import("./pages/dashboard/admin/AdminSettingsPage"));

// Admin extra pages
const AdminMatricConfig = lazy(() => import("./pages/dashboard/admin/MatricConfigPage"));
const AdminTimetable = lazy(() => import("./pages/dashboard/admin/TimetableManagementPage"));

// AI Module pages
const FacialRecognitionPage = lazy(() => import("./pages/dashboard/ai/FacialRecognitionPage"));
const NotificationCentrePage = lazy(() => import("./pages/dashboard/ai/NotificationCentrePage"));

// Super Admin sub-pages
const SuperAdminInstitutionsPage = lazy(() => import("./pages/dashboard/super-admin/InstitutionsPage"));
const SuperAdminRevenue = lazy(() => import("./pages/dashboard/super-admin/RevenuePage"));
const SuperAdminAllUsers = lazy(() => import("./pages/dashboard/super-admin/AllUsersPage"));
const SuperAdminAuditLog = lazy(() => import("./pages/dashboard/super-admin/AuditLogPage"));
const SuperAdminBlogManagement = lazy(() => import("./pages/dashboard/super-admin/BlogManagementPage"));
const SuperAdminPricingManagement = lazy(() => import("./pages/dashboard/super-admin/PricingManagementPage"));
const SuperAdminPlatformSettings = lazy(() => import("./pages/dashboard/super-admin/PlatformSettingsPage"));

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
              
              {/* Auth Pages - Unified Login */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Protected Student Dashboard Routes */}
              <Route path="/dashboard/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/student/courses" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCoursesPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/student/assignments" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/student/attendance" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAttendancePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/student/results" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentResultsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/student/ai-assistant" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAIAssistantPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/student/schedule" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSchedulePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/student/profile" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Protected Lecturer Dashboard Routes */}
              <Route path="/dashboard/lecturer" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lecturer/courses" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerCoursesPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lecturer/assignments" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerAssignmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lecturer/attendance" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerAttendancePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lecturer/results" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerResultsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lecturer/students" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerStudentPerformancePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lecturer/schedule" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerSchedulePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lecturer/profile" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Dashboard Routes */}
              <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/students" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStudentManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/lecturers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLecturerManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/departments" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDepartmentManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/subscription" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSubscription />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/attendance" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAttendanceAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/matric-config" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMatricConfig />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/timetable" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminTimetable />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/notifications" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <NotificationCentrePage />
                </ProtectedRoute>
              } />

              {/* AI Module Routes */}
              <Route path="/dashboard/lecturer/facial-recognition" element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <FacialRecognitionPage />
                </ProtectedRoute>
              } />
              
              {/* Protected Super Admin Dashboard Routes */}
              <Route path="/dashboard/super-admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/super-admin/institutions" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminInstitutionsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/super-admin/revenue" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminRevenue />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/super-admin/users" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminAllUsers />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/super-admin/audit" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminAuditLog />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/super-admin/blog" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminBlogManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/super-admin/pricing" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminPricingManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/super-admin/settings" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminPlatformSettings />
                </ProtectedRoute>
              } />
              
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
