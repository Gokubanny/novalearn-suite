import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  TrendingUp, TrendingDown, Calendar
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const departmentAttendance = [
  { name: 'Computer Science', rate: 87, trend: 'up', students: 450, change: '+3%' },
  { name: 'Business Admin', rate: 82, trend: 'down', students: 380, change: '-1%' },
  { name: 'Engineering', rate: 91, trend: 'up', students: 320, change: '+5%' },
  { name: 'Medicine', rate: 95, trend: 'up', students: 200, change: '+2%' },
  { name: 'Law', rate: 78, trend: 'down', students: 180, change: '-4%' },
];

const weeklyData = [
  { day: 'Mon', rate: 88 },
  { day: 'Tue', rate: 85 },
  { day: 'Wed', rate: 90 },
  { day: 'Thu', rate: 82 },
  { day: 'Fri', rate: 75 },
];

export default function AttendanceAnalyticsPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance Analytics</h1>
            <p className="text-muted-foreground">Institution-wide attendance overview and trends</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="this-semester">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-semester">This Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">86.6%</div>
              <div className="flex items-center text-xs text-green-600"><TrendingUp className="h-3 w-3 mr-1" />+2.1% vs last month</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes Today</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">42</div><p className="text-xs text-muted-foreground">38 completed</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">1,089</div><p className="text-xs text-muted-foreground">of 1,280 enrolled</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Students</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">23</div><p className="text-xs text-muted-foreground">&lt;60% attendance</p></CardContent>
          </Card>
        </div>

        {/* Weekly Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Pattern</CardTitle>
            <CardDescription>Average attendance by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium">{d.rate}%</span>
                  <div className="w-full bg-muted rounded-t-md relative" style={{ height: `${d.rate}%` }}>
                    <div className="absolute inset-0 bg-primary/80 rounded-t-md" />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Department */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Department</CardTitle>
            <CardDescription>Breakdown across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentAttendance.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{dept.name}</span>
                      <Badge variant="outline" className="text-xs">{dept.students} students</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{dept.rate}%</span>
                      <div className={`flex items-center text-xs ${dept.trend === 'up' ? 'text-green-600' : 'text-destructive'}`}>
                        {dept.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                        {dept.change}
                      </div>
                    </div>
                  </div>
                  <Progress value={dept.rate} className={dept.rate < 80 ? '[&>div]:bg-orange-500' : ''} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
