import { Shield } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function SuperAdminLoginPage() {
  return (
    <AuthLayout
      title="Super Admin Portal"
      subtitle="Full platform access to manage all institutions, users, and system settings."
      icon={<Shield className="h-10 w-10 text-white" />}
      accentColor="hsl(0, 84%, 60%)"
    >
      <LoginForm 
        role="super_admin" 
        roleLabel="Super Admin" 
        redirectPath="/dashboard/super-admin" 
      />
    </AuthLayout>
  );
}
