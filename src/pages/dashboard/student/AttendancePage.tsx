import { Home, BookOpen, Calendar, FileText, Trophy, MessageSquare, CheckCircle, XCircle, Clock, TrendingUp, Brain, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/student/attendance', icon: CheckCircle },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/student/results', icon: Trophy },
  { name: 'AI Assistant', href: '/dashboard/student/ai-assistant', icon: Brain },
  { name: 'Profile', href: '/dashboard/student/profile', icon: User },
];

const attendanceData = [
  { course: 'Introduction to Computer Science', attended: 18, total: 20, percentage: 90, status: 'good' },
  { course: 'Calculus II', attended: 14, total: 20, percentage: 70, status: 'warning' },
  { course: 'English Composition', attended: 19, total: 20, percentage: 95, status: 'good' },
  { course: 'Physics 101', attended: 12, total: 20, percentage: 60, status: 'danger' },
  { course: 'Data Structures', attended: 17, total: 20, percentage: 85, status: 'good' },
];

const recentRecords = [
  { date: 'Mar 3, 2026', course: 'Computer Science', status: 'present', time: '9:00 AM' },
  { date: 'Mar 3, 2026', course: 'Calculus II', status: 'absent', time: '11:00 AM' },
  { date: 'Mar 2, 2026', course: 'English Composition', status: 'present', time: '8:00 AM' },
  { date: 'Mar 2, 2026', course: 'Physics 101', status: 'late', time: '2:15 PM' },
  { date: 'Mar 1, 2026', course: 'Data Structures', status: 'present', time: '10:00 AM' },
  { date: 'Mar 1, 2026', course: 'Computer Science', status: 'present', time: '9:00 AM' },
];

const weeklyData = [
  { day: 'Mon', classes: 4, attended: 4 },
  { day: 'Tue', classes: 3, attended: 2 },
  { day: 'Wed', classes: 4, attended: 4 },
  { day: 'Thu', classes: 3, attended: 3 },
  { day: 'Fri', classes: 2, attended: 1 },
];

export default function StudentAttendancePage() {
  const overallPercentage = Math.round(attendanceData.reduce((acc, c) => acc + c.percentage, 0) / attendanceData.length);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Attendance</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Attendance Records</h1>
          <p className="text-muted-foreground">Track your class attendance across all courses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallPercentage}%</div>
              <Progress value={overallPercentage} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes Attended</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">80</div>
              <p className="text-xs text-muted-foreground">Out of 100 total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes Missed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">20</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Late Arrivals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="by-course">
          <TabsList>
            <TabsTrigger value="by-course">By Course</TabsTrigger>
            <TabsTrigger value="recent">Recent Records</TabsTrigger>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          </TabsList>

          <TabsContent value="by-course" className="space-y-4 mt-4">
            {attendanceData.map((course) => (
              <Card key={course.course}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{course.course}</p>
                      <p className="text-sm text-muted-foreground">{course.attended}/{course.total} classes attended</p>
                    </div>
                    <Badge variant={course.status === 'good' ? 'default' : course.status === 'warning' ? 'secondary' : 'destructive'}>
                      {course.percentage}%
                    </Badge>
                  </div>
                  <Progress value={course.percentage} className="h-2" />
                  {course.percentage < 75 && (
                    <p className="text-xs text-destructive mt-2">⚠ Below minimum 75% attendance requirement</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Your latest attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRecords.map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-green-500' : record.status === 'late' ? 'bg-orange-500' : 'bg-destructive'}`} />
                        <div>
                          <p className="font-medium text-sm">{record.course}</p>
                          <p className="text-xs text-muted-foreground">{record.date} • {record.time}</p>
                        </div>
                      </div>
                      <Badge variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>This Week's Attendance</CardTitle>
                <CardDescription>Daily breakdown of your attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <span className="w-10 text-sm font-medium">{day.day}</span>
                      <div className="flex-1">
                        <Progress value={(day.attended / day.classes) * 100} className="h-3" />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{day.attended}/{day.classes}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
