import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  TrendingUp, ArrowUpCircle, ArrowDownCircle, CreditCard
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const revenueByPlan = [
  { plan: 'Enterprise', institutions: 8, revenue: 9600000, percentage: 53 },
  { plan: 'Pro', institutions: 10, revenue: 8000000, percentage: 35 },
  { plan: 'Basic', institutions: 6, revenue: 3000000, percentage: 12 },
];

const recentTransactions = [
  { institution: 'University of Lagos', plan: 'Enterprise', amount: '₦1,200,000', date: 'Mar 1, 2024', status: 'completed' },
  { institution: 'Covenant University', plan: 'Pro', amount: '₦800,000', date: 'Feb 28, 2024', status: 'completed' },
  { institution: 'Lagos State University', plan: 'Basic', amount: '₦500,000', date: 'Feb 25, 2024', status: 'pending' },
  { institution: 'Ahmadu Bello University', plan: 'Enterprise', amount: '₦1,200,000', date: 'Feb 20, 2024', status: 'completed' },
];

export default function RevenuePage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Revenue & Subscriptions</h1>
            <p className="text-muted-foreground">Platform revenue overview and subscription management</p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦20.6M</div>
              <div className="flex items-center text-xs text-green-600"><TrendingUp className="h-3 w-3 mr-1" />+18% YoY</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦1.72M</div>
              <p className="text-xs text-muted-foreground">Monthly recurring</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">24</div><p className="text-xs text-muted-foreground">Across all plans</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">2.1%</div><p className="text-xs text-green-600">Below target</p></CardContent>
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
                <Progress value={item.percentage} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle><CardDescription>Latest payment activities</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{tx.institution}</p>
                    <p className="text-xs text-muted-foreground">{tx.plan} Plan • {tx.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{tx.amount}</span>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
