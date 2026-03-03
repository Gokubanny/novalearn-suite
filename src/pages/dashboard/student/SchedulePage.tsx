import { Home, BookOpen, Calendar, FileText, Trophy, CheckCircle, Brain, User, Clock, MapPin, Video } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const todaySchedule = [
  { time: '8:00 - 9:30', course: 'English Composition', type: 'Lecture', location: 'Hall A', mode: 'physical' },
  { time: '10:00 - 11:30', course: 'Computer Science', type: 'Lab', location: 'Computer Lab 2', mode: 'physical' },
  { time: '12:00 - 1:00', course: 'Lunch Break', type: 'break', location: '', mode: 'break' },
  { time: '1:00 - 2:30', course: 'Calculus II', type: 'Lecture', location: 'Online - Zoom', mode: 'online' },
  { time: '3:00 - 4:30', course: 'Physics 101', type: 'Tutorial', location: 'Room 305', mode: 'physical' },
];

const weekSchedule = [
  { day: 'Monday', classes: [
    { time: '8:00-9:30', course: 'CS101', mode: 'physical' },
    { time: '10:00-11:30', course: 'MTH201', mode: 'online' },
    { time: '1:00-2:30', course: 'PHY101', mode: 'physical' },
  ]},
  { day: 'Tuesday', classes: [
    { time: '9:00-10:30', course: 'ENG101', mode: 'physical' },
    { time: '11:00-12:30', course: 'CS201', mode: 'physical' },
  ]},
  { day: 'Wednesday', classes: [
    { time: '8:00-9:30', course: 'CS101', mode: 'online' },
    { time: '10:00-11:30', course: 'MTH201', mode: 'physical' },
    { time: '1:00-2:30', course: 'PHY101', mode: 'physical' },
    { time: '3:00-4:30', course: 'ENG101', mode: 'physical' },
  ]},
  { day: 'Thursday', classes: [
    { time: '9:00-10:30', course: 'CS201', mode: 'online' },
    { time: '11:00-12:30', course: 'MTH201', mode: 'physical' },
  ]},
  { day: 'Friday', classes: [
    { time: '8:00-9:30', course: 'CS101', mode: 'physical' },
    { time: '10:00-11:30', course: 'PHY101', mode: 'physical' },
  ]},
];

const upcomingExams = [
  { course: 'Calculus II', date: 'Mar 15, 2026', time: '9:00 AM', venue: 'Exam Hall 1' },
  { course: 'Physics 101', date: 'Mar 18, 2026', time: '2:00 PM', venue: 'Exam Hall 2' },
  { course: 'Computer Science', date: 'Mar 22, 2026', time: '9:00 AM', venue: 'Computer Lab 1' },
];

export default function StudentSchedulePage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Schedule</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">View your classes, exams, and academic calendar</p>
        </div>

        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="exams">Upcoming Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Tuesday, March 3, 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0">
                  {todaySchedule.map((item, i) => (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${item.mode === 'break' ? 'bg-muted-foreground' : item.mode === 'online' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        {i < todaySchedule.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                      </div>
                      <div className={`flex-1 p-3 rounded-lg ${item.mode === 'break' ? 'bg-muted/30' : 'bg-muted/50'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{item.course}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.time}</span>
                              {item.location && (
                                <span className="flex items-center gap-1">
                                  {item.mode === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.type !== 'break' && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{item.type}</Badge>
                              <Badge variant={item.mode === 'online' ? 'default' : 'outline'}>{item.mode}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {day.classes.map((cls, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                        <div className={`w-2 h-2 rounded-full ${cls.mode === 'online' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <span className="font-medium">{cls.course}</span>
                        <span className="text-muted-foreground ml-auto">{cls.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="exams" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Examinations</CardTitle>
                <CardDescription>Prepare ahead for your exams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div key={exam.course} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{exam.course}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{exam.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exam.venue}</span>
                      </div>
                    </div>
                    <Badge variant="destructive">Exam</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
