import { Users } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LecturerLoginPage() {
  return (
    <AuthLayout
      title="Lecturer Portal"
      subtitle="Manage your classes, create content, and engage with students effectively."
      icon={<Users className="h-10 w-10 text-white" />}
      accentColor="hsl(142, 71%, 45%)"
    >
      <LoginForm 
        role="lecturer" 
        roleLabel="Lecturer" 
        redirectPath="/dashboard/lecturer" 
      />
    </AuthLayout>
  );
}
