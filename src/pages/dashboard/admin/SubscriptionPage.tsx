import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  CheckCircle, ArrowUpCircle, Upload, Calendar, Shield
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const plans = [
  { name: 'Basic', price: '₦500,000', period: '/year', features: ['Up to 500 students', '10 Lecturers', 'Basic analytics', 'Email support'], current: false },
  { name: 'Pro', price: '₦800,000', period: '/year', features: ['Up to 2,000 students', '50 Lecturers', 'Advanced analytics', 'AI features', 'Priority support'], current: true },
  { name: 'Enterprise', price: '₦1,200,000', period: '/year', features: ['Unlimited students', 'Unlimited lecturers', 'Full AI suite', 'Dedicated support', 'Custom integrations'], current: false },
];

const invoices = [
  { id: 'INV-2024-003', date: 'Jan 15, 2024', amount: '₦800,000', status: 'paid' },
  { id: 'INV-2023-012', date: 'Jan 15, 2023', amount: '₦800,000', status: 'paid' },
  { id: 'INV-2022-008', date: 'Jan 15, 2022', amount: '₦500,000', status: 'paid' },
];

export default function SubscriptionPage() {
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
                  Current Plan: Pro
                </CardTitle>
                <CardDescription>Your subscription renews on January 15, 2025</CardDescription>
              </div>
              <Badge className="bg-green-600">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Students Used</p>
                <p className="text-2xl font-bold">1,280 / 2,000</p>
                <Progress value={64} className="mt-2" />
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Lecturers Used</p>
                <p className="text-2xl font-bold">37 / 50</p>
                <Progress value={74} className="mt-2" />
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">12.5 / 50 GB</p>
                <Progress value={25} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.current ? 'border-primary ring-1 ring-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.current && <Badge>Current</Badge>}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  <Separator />
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                  ) : plan.name === 'Enterprise' ? (
                    <Button variant="outline" className="w-full">Contact Sales</Button>
                  ) : (
                    <Button className="w-full"><ArrowUpCircle className="h-4 w-4 mr-2" />Upgrade</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Proof Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Payment Proof</CardTitle>
            <CardDescription>Upload your bank transfer receipt for plan renewal or upgrade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Drop payment proof here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">Supports PDF, PNG, JPG up to 5MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">{inv.id}</p>
                    <p className="text-sm text-muted-foreground">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{inv.amount}</span>
                    <Badge variant="default" className="bg-green-600">Paid</Badge>
                    <Button variant="outline" size="sm">Download</Button>
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
