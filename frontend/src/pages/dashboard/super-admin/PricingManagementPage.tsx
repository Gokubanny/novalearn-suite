import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  Edit, Save, CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

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

const plans = [
  { 
    name: 'Basic', active: true, monthlyPrice: 500000, yearlyPrice: 5000000,
    features: ['Up to 500 students', '10 Lecturers', 'Basic analytics', 'Email support', '5GB Storage'],
    subscribers: 6
  },
  { 
    name: 'Pro', active: true, monthlyPrice: 800000, yearlyPrice: 8000000,
    features: ['Up to 2,000 students', '50 Lecturers', 'Advanced analytics', 'AI features', 'Priority support', '50GB Storage'],
    subscribers: 10
  },
  { 
    name: 'Enterprise', active: true, monthlyPrice: 1200000, yearlyPrice: 12000000,
    features: ['Unlimited students', 'Unlimited lecturers', 'Full AI suite', 'Dedicated support', 'Custom integrations', 'Unlimited Storage'],
    subscribers: 8
  },
];

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

export default function PricingManagementPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pricing Plan Management</h1>
            <p className="text-muted-foreground">Configure and manage subscription pricing</p>
          </div>
          <Button><Save className="h-4 w-4 mr-2" />Save All Changes</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{plan.subscribers} subscribers</Badge>
                    <Switch defaultChecked={plan.active} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Monthly Price (₦)</Label>
                    <Input type="number" defaultValue={plan.monthlyPrice} />
                  </div>
                  <div className="space-y-2">
                    <Label>Yearly Price (₦)</Label>
                    <Input type="number" defaultValue={plan.yearlyPrice} />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Features</Label>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <Input defaultValue={feature} className="h-8 text-sm" />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2">+ Add Feature</Button>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                  <Button className="flex-1"><Save className="h-4 w-4 mr-2" />Save</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
