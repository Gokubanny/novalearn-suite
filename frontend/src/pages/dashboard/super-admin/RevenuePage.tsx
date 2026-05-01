import { useState, useEffect } from 'react';
import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  TrendingUp, ArrowUpCircle, ArrowDownCircle, CreditCard, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Schools', href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'Revenue', href: '/dashboard/super-admin/revenue', icon: DollarSign },
  { name: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Audit Log', href: '/dashboard/super-admin/audit', icon: FileText },
  { name: 'Blog', href: '/dashboard/super-admin/blog', icon: Newspaper },
  { name: 'Pricing', href: '/dashboard/super-admin/pricing', icon: Tag },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
];

const planPricing: Record<string, number> = {
  basic: 500000,
  pro: 800000,
  enterprise: 1200000,
};

export default function RevenuePage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('institutions').select('*');
      setInstitutions(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  const activeSubscriptions = institutions.filter(i => i.subscription_status === 'active' || i.subscription_plan !== 'basic');
  
  const revenueByPlan = ['enterprise', 'pro', 'basic'].map(plan => {
    const insts = institutions.filter(i => i.subscription_plan === plan);
    return {
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      institutions: insts.length,
      revenue: insts.length * (planPricing[plan] || 0),
    };
  });
  
  const totalRevenue = revenueByPlan.reduce((sum, r) => sum + r.revenue, 0);
  const maxRevenue = Math.max(...revenueByPlan.map(r => r.revenue), 1);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Revenue & Subscriptions</h1>
            <p className="text-muted-foreground">Platform revenue overview from Stripe subscriptions</p>
          </div>
          <Select defaultValue="this-year">
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{(totalRevenue / 1000000).toFixed(1)}M</div>
                  <div className="flex items-center text-xs text-green-600"><TrendingUp className="h-3 w-3 mr-1" />From {institutions.length} institutions</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                  <ArrowUpCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{(totalRevenue / 12 / 1000000).toFixed(2)}M</div>
                  <p className="text-xs text-muted-foreground">Monthly recurring</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                  <CreditCard className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
                  <p className="text-xs text-muted-foreground">Across all plans</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Institutions</CardTitle>
                  <ArrowDownCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{institutions.length}</div>
                  <p className="text-xs text-muted-foreground">{institutions.filter(i => i.is_active).length} active</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Plan */}
            <Card>
              <CardHeader><CardTitle>Revenue by Plan</CardTitle><CardDescription>Breakdown across subscription tiers</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {revenueByPlan.map((item) => (
                  <div key={item.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.plan}</span>
                        <Badge variant="outline">{item.institutions} institutions</Badge>
                      </div>
                      <span className="font-bold">₦{(item.revenue / 1000000).toFixed(1)}M</span>
                    </div>
                    <Progress value={maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Institution Subscriptions */}
            <Card>
              <CardHeader><CardTitle>Institution Subscriptions</CardTitle><CardDescription>All institutions and their plan status</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {institutions.map((inst) => (
                    <div key={inst.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.code} • {inst.city || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{inst.subscription_plan || 'basic'}</Badge>
                        <Badge variant={inst.is_active ? 'default' : 'secondary'}>
                          {inst.is_active ? 'active' : 'inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {institutions.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No institutions found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}