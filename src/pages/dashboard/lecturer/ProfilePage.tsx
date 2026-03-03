import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, Camera, Save, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/lecturer/attendance', icon: CheckCircle },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/lecturer/results', icon: BarChart3 },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Schedule', href: '/dashboard/lecturer/schedule', icon: Calendar },
  { name: 'Profile', href: '/dashboard/lecturer/profile', icon: User },
];

export default function LecturerProfilePage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Profile & Settings</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">DA</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="outline" className="absolute -bottom-1 -right-1 rounded-full w-7 h-7">
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-bold">Dr. Adebayo</h2>
                <p className="text-muted-foreground">Senior Lecturer • Computer Science Department</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name</Label><Input defaultValue="Adebayo" /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input defaultValue="Olumide" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input defaultValue="adebayo@nexford.edu" type="email" /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+234 802 345 6789" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea defaultValue="Senior Lecturer with 15 years experience in Computer Science education. Research interests include AI, Machine Learning, and EdTech." />
                </div>
                <Button><Save className="h-4 w-4 mr-2" />Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Staff ID</Label><Input defaultValue="LEC/2020/045" disabled /></div>
                  <div className="space-y-2"><Label>Department</Label><Input defaultValue="Computer Science" disabled /></div>
                  <div className="space-y-2"><Label>Faculty</Label><Input defaultValue="Science & Technology" disabled /></div>
                  <div className="space-y-2"><Label>Qualification</Label><Input defaultValue="PhD Computer Science" /></div>
                  <div className="space-y-2"><Label>Specialization</Label><Input defaultValue="Artificial Intelligence" /></div>
                  <div className="space-y-2"><Label>Years of Experience</Label><Input defaultValue="15" /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'New Submissions', desc: 'When students submit assignments' },
                  { label: 'Attendance Alerts', desc: 'Low attendance warnings' },
                  { label: 'Schedule Changes', desc: 'Modifications to your schedule' },
                  { label: 'Student Messages', desc: 'Direct messages from students' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="Enter current password" /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="Enter new password" /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="Confirm new password" /></div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
