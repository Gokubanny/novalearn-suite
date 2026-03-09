import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <span className="text-primary-foreground font-bold text-2xl">N</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect pending/rejected users to approval page
  if (user.approvalStatus !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const dashboardPaths: Record<UserRole, string> = {
      student: '/dashboard/student',
      lecturer: '/dashboard/lecturer',
      admin: '/dashboard/admin',
      super_admin: '/dashboard/super-admin',
    };
    return <Navigate to={dashboardPaths[user.role]} replace />;
  }

  return <>{children}</>;
}
