import { GraduationCap } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function StudentLoginPage() {
  return (
    <AuthLayout
      title="Student Portal"
      subtitle="Access your courses, assignments, and track your academic progress all in one place."
      icon={<GraduationCap className="h-10 w-10 text-white" />}
      accentColor="hsl(221, 83%, 53%)"
    >
      <LoginForm 
        role="student" 
        roleLabel="Student" 
        redirectPath="/dashboard/student" 
      />
    </AuthLayout>
  );
}
