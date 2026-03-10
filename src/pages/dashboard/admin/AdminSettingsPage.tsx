import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  User, Bell, Shield, Palette, Globe, Save
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useAccentColor } from '@/hooks/useAccentColor';
import { AccentColorPicker } from '@/components/dashboard/AccentColorPicker';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { accentColor, updateAccentColor, defaultColor } = useAccentColor();

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and institution settings</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="institution"><Globe className="h-4 w-4 mr-2" />Institution</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
            <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                  </div>
                  <Button variant="outline">Change Avatar</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name</Label><Input defaultValue={user?.firstName} /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input defaultValue={user?.lastName} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email} type="email" /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input placeholder="+234..." /></div>
                </div>
                <Button><Save className="h-4 w-4 mr-2" />Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="institution" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Institution Details</CardTitle>
                <CardDescription>Update your school information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Institution Name</Label><Input defaultValue="University of Lagos" /></div>
                  <div className="space-y-2"><Label>Website</Label><Input defaultValue="https://unilag.edu.ng" /></div>
                  <div className="space-y-2"><Label>Email Domain</Label><Input defaultValue="unilag.edu.ng" /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+234 1 234 5678" /></div>
                </div>
                <div className="space-y-2"><Label>Address</Label><Textarea defaultValue="Akoka, Yaba, Lagos" /></div>
                <Button><Save className="h-4 w-4 mr-2" />Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'New student registrations', desc: 'Get notified when students register' },
                  { label: 'Subscription alerts', desc: 'Billing reminders and plan updates' },
                  { label: 'System updates', desc: 'Platform maintenance notifications' },
                  { label: 'Weekly reports', desc: 'Automated performance summaries' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" /></div>
                <Button><Save className="h-4 w-4 mr-2" />Update Password</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Two-Factor Authentication</CardTitle><CardDescription>Add an extra layer of security</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">Enable 2FA</p><p className="text-xs text-muted-foreground">Use authenticator app</p></div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
