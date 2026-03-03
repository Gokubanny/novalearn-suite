import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, Clock, MapPin, Video, Plus, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const todayClasses = [
  { time: '8:00 - 9:30', course: 'CS101 - Intro to CS', type: 'Lecture', location: 'Hall A', mode: 'physical', students: 45 },
  { time: '10:00 - 11:30', course: 'CS201 - Data Structures', type: 'Lab', location: 'Computer Lab 2', mode: 'physical', students: 38 },
  { time: '1:00 - 2:30', course: 'WEB101 - Web Dev', type: 'Lecture', location: 'Zoom Meeting', mode: 'online', students: 52 },
];

const weekSchedule = [
  { day: 'Monday', classes: [
    { time: '8:00-9:30', course: 'CS101', mode: 'physical', students: 45 },
    { time: '1:00-2:30', course: 'WEB101', mode: 'online', students: 52 },
  ]},
  { day: 'Tuesday', classes: [
    { time: '10:00-11:30', course: 'CS201', mode: 'physical', students: 38 },
  ]},
  { day: 'Wednesday', classes: [
    { time: '8:00-9:30', course: 'CS101', mode: 'physical', students: 45 },
    { time: '10:00-11:30', course: 'CS201', mode: 'physical', students: 38 },
    { time: '3:00-4:30', course: 'WEB101', mode: 'online', students: 52 },
  ]},
  { day: 'Thursday', classes: [
    { time: '10:00-11:30', course: 'CS201', mode: 'physical', students: 38 },
    { time: '1:00-2:30', course: 'CS101', mode: 'online', students: 45 },
  ]},
  { day: 'Friday', classes: [
    { time: '8:00-9:30', course: 'WEB101', mode: 'physical', students: 52 },
  ]},
];

export default function LecturerSchedulePage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Schedule</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Class Schedule</h1>
            <p className="text-muted-foreground">Manage your teaching schedule and class sessions</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Schedule Class</Button>
        </div>

        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="new">New Session</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Classes</CardTitle>
                <CardDescription>Tuesday, March 3, 2026</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayClasses.map((cls, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`w-1 h-12 rounded-full ${cls.mode === 'online' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="font-medium">{cls.course}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{cls.time}</span>
                          <span className="flex items-center gap-1">
                            {cls.mode === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            {cls.location}
                          </span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{cls.students} students</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cls.mode === 'online' ? 'default' : 'outline'}>{cls.mode}</Badge>
                      <Badge variant="secondary">{cls.type}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week" className="mt-4 space-y-4">
            {weekSchedule.map((day) => (
              <Card key={day.day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{day.day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {day.classes.map((cls, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-2 h-8 rounded-full ${cls.mode === 'online' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <div>
                          <p className="font-medium text-sm">{cls.course}</p>
                          <p className="text-xs text-muted-foreground">{cls.time} • {cls.students} students</p>
                        </div>
                        <Badge variant="outline" className="ml-auto text-xs">{cls.mode}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Class Session</CardTitle>
                <CardDescription>Create a physical or online class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs101">CS101 - Intro to CS</SelectItem>
                        <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
                        <SelectItem value="web101">WEB101 - Web Dev</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Class Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lecture">Lecture</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Physical or Online" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="online">Online (Zoom)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location / Zoom Link</Label>
                    <Input placeholder="e.g., Hall A or https://zoom.us/..." />
                  </div>
                </div>
                <Button>Create Session</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
