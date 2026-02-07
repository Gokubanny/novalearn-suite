import { Building2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Manage your institution, users, and oversee the entire learning ecosystem."
      icon={<Building2 className="h-10 w-10 text-white" />}
      accentColor="hsl(262, 83%, 58%)"
    >
      <LoginForm 
        role="admin" 
        roleLabel="Administrator" 
        redirectPath="/dashboard/admin" 
      />
    </AuthLayout>
  );
}
