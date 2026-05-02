import { useState } from 'react';
import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  CheckCircle, ArrowUpCircle, Calendar, Shield, Loader2, ExternalLink
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useSubscription, getPlanLabel } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const stripePrices: Record<string, { monthly: string; yearly: string }> = {
  basic: { monthly: 'price_basic_monthly', yearly: 'price_basic_yearly' },
  pro: { monthly: 'price_pro_monthly', yearly: 'price_pro_yearly' },
  enterprise: { monthly: 'price_enterprise_monthly', yearly: 'price_enterprise_yearly' },
};

const allPlans = [
  { key: 'basic' as const, name: 'Basic', monthlyPrice: '₦500,000', yearlyPrice: '₦5,000,000', features: ['Up to 500 students', '10 Lecturers', 'Basic analytics', 'Email support'] },
  { key: 'pro' as const, name: 'Pro', monthlyPrice: '₦800,000', yearlyPrice: '₦8,000,000', features: ['Up to 2,000 students', '50 Lecturers', 'Advanced analytics', 'AI features', 'Priority support'] },
  { key: 'enterprise' as const, name: 'Enterprise', monthlyPrice: '₦1,200,000', yearlyPrice: '₦12,000,000', features: ['Unlimited students', 'Unlimited lecturers', 'Full AI suite', 'Dedicated support', 'Custom integrations'] },
];

export default function SubscriptionPage() {
  const { plan, limits } = useSubscription();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const studentCount = 1150;
  const lecturerCount = 37;
  const storageUsed = 12.5;

  const studentPct = limits.maxStudents === Infinity ? 5 : Math.round((studentCount / limits.maxStudents) * 100);
  const lecturerPct = limits.maxLecturers === Infinity ? 5 : Math.round((lecturerCount / limits.maxLecturers) * 100);
  const storagePct = limits.storageGB === Infinity ? 5 : Math.round((storageUsed / limits.storageGB) * 100);

  const handleSubscribe = async (planKey: string) => {
    if (!user?.institutionId) {
      toast.error('No institution linked to your account');
      return;
    }
    setLoadingPlan(planKey);
    try {
      const priceId = stripePrices[planKey]?.[billingPeriod];
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, institutionId: user?.institutionId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (!user?.institutionId) return;
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { institutionId: user?.institutionId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to open billing portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription & Billing</h1>
          <p className="text-muted-foreground">Manage your institution's subscription plan</p>
        </div>

        {/* Current Plan */}
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Current Plan: {getPlanLabel(plan)}
                </CardTitle>
                <CardDescription>Manage your subscription through Stripe</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600">Active</Badge>
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={loadingPortal}>
                  {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ExternalLink className="h-4 w-4 mr-1" />}
                  Manage Billing
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Students Used</p>
                <p className="text-2xl font-bold">{studentCount.toLocaleString()} / {limits.maxStudents === Infinity ? '∞' : limits.maxStudents.toLocaleString()}</p>
                <Progress value={studentPct} className="mt-2" />
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Lecturers Used</p>
                <p className="text-2xl font-bold">{lecturerCount} / {limits.maxLecturers === Infinity ? '∞' : limits.maxLecturers}</p>
                <Progress value={lecturerPct} className="mt-2" />
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{storageUsed} / {limits.storageGB === Infinity ? '∞' : limits.storageGB} GB</p>
                <Progress value={storagePct} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Period Toggle */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant={billingPeriod === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setBillingPeriod('monthly')}>Monthly</Button>
            <Button variant={billingPeriod === 'yearly' ? 'default' : 'outline'} size="sm" onClick={() => setBillingPeriod('yearly')}>
              Yearly <Badge variant="secondary" className="ml-1 text-xs">Save 17%</Badge>
            </Button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allPlans.map((p) => {
            const isCurrent = p.key === plan;
            const price = billingPeriod === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
            return (
              <Card key={p.key} className={isCurrent ? 'border-primary ring-1 ring-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {p.name}
                    {isCurrent && <Badge>Current</Badge>}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className="text-muted-foreground">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {p.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  <Separator />
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleSubscribe(p.key)} disabled={!!loadingPlan}>
                      {loadingPlan === p.key ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                      )}
                      {p.key === 'enterprise' ? 'Subscribe' : 'Upgrade'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Billing History - Managed through Stripe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Billing History</CardTitle>
            <CardDescription>View and download invoices from the billing portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleManageBilling} disabled={loadingPortal}>
              {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              View Invoices in Billing Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}