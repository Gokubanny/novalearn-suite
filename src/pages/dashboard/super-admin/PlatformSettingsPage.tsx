import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  Globe, Shield, Bell, Palette, Server, Save, Mail
} from 'lucide-react';
import { useAccentColor } from '@/hooks/useAccentColor';
import { AccentColorPicker } from '@/components/dashboard/AccentColorPicker';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function PlatformSettingsPage() {
  const { accentColor, updateAccentColor, defaultColor } = useAccentColor();

  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure global platform settings</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general"><Globe className="h-4 w-4 mr-2" />General</TabsTrigger>
            <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />Email</TabsTrigger>
            <TabsTrigger value="maintenance"><Server className="h-4 w-4 mr-2" />Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Platform Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Platform Name</Label><Input defaultValue="NexfordEdu" /></div>
                  <div className="space-y-2"><Label>Support Email</Label><Input defaultValue="support@nexfordedu.com" /></div>
                  <div className="space-y-2"><Label>Platform URL</Label><Input defaultValue="https://nexfordedu.com" /></div>
                  <div className="space-y-2"><Label>API Version</Label><Input defaultValue="v2.1.0" disabled /></div>
                </div>
                <div className="space-y-2"><Label>Platform Description</Label><Textarea defaultValue="NexfordEdu is a premium multi-institutional academic management platform." /></div>
                <Button><Save className="h-4 w-4 mr-2" />Save</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Feature Flags</CardTitle><CardDescription>Enable or disable platform features</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'AI Features', desc: 'Enable AI-powered features across the platform' },
                  { label: 'Facial Recognition', desc: 'Enable facial recognition for attendance' },
                  // { label: 'Exam Proctoring', desc: 'Enable AI exam monitoring' },
                  { label: 'Public Registration', desc: 'Allow new institutions to register publicly' },
                ].map((flag) => (
                  <div key={flag.label} className="flex items-center justify-between py-2">
                    <div><p className="font-medium text-sm">{flag.label}</p><p className="text-xs text-muted-foreground">{flag.desc}</p></div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Force 2FA for Admins', desc: 'Require two-factor authentication for all admin accounts' },
                  { label: 'IP Whitelisting', desc: 'Restrict API access to specific IP addresses' },
                  { label: 'Session Timeout', desc: 'Auto-logout inactive users after 30 minutes' },
                  { label: 'Password Complexity', desc: 'Enforce strong password requirements' },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between py-2">
                    <div><p className="font-medium text-sm">{setting.label}</p><p className="text-xs text-muted-foreground">{setting.desc}</p></div>
                    <Switch defaultChecked />
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input type="number" defaultValue="5" className="w-32" />
                </div>
                <Button><Save className="h-4 w-4 mr-2" />Save Security Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Email Configuration</CardTitle><CardDescription>SMTP settings for platform emails</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>SMTP Host</Label><Input defaultValue="smtp.sendgrid.net" /></div>
                  <div className="space-y-2"><Label>SMTP Port</Label><Input defaultValue="587" /></div>
                  <div className="space-y-2"><Label>Username</Label><Input defaultValue="apikey" /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type="password" defaultValue="••••••••" /></div>
                  <div className="space-y-2"><Label>From Name</Label><Input defaultValue="NexfordEdu" /></div>
                  <div className="space-y-2"><Label>From Email</Label><Input defaultValue="noreply@nexfordedu.com" /></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Send Test Email</Button>
                  <Button><Save className="h-4 w-4 mr-2" />Save</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Maintenance Mode</CardTitle><CardDescription>Enable when performing platform updates</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div><p className="font-medium text-sm">Enable Maintenance Mode</p><p className="text-xs text-muted-foreground">All users will see a maintenance page</p></div>
                  <Switch />
                </div>
                <div className="space-y-2"><Label>Maintenance Message</Label><Textarea defaultValue="NexfordEdu is undergoing scheduled maintenance. We'll be back shortly." /></div>
                <Button><Save className="h-4 w-4 mr-2" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
