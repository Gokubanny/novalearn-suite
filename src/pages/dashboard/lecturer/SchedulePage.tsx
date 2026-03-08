import { useState, useEffect } from 'react';
import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, Clock, MapPin, Loader2, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';

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

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string | null;
  course: { code: string; title: string } | null;
  studentCount: number;
}

export default function LecturerSchedulePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSchedule();
  }, [user]);

  async function fetchSchedule() {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      if (!profile) { setLoading(false); return; }

      // Get lecturer's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, code, title')
        .eq('lecturer_id', profile.id)
        .eq('is_active', true);

      const courseIds = courses?.map(c => c.id) || [];
      if (courseIds.length === 0) { setEntries([]); setLoading(false); return; }

      const courseMap = new Map(courses?.map(c => [c.id, { code: c.code, title: c.title }]));

      // Get timetable
      const { data } = await supabase
        .from('timetable')
        .select('id, day_of_week, start_time, end_time, venue, course_id')
        .in('course_id', courseIds)
        .order('day_of_week')
        .order('start_time');

      // Get enrollment counts
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .in('course_id', courseIds)
        .eq('status', 'enrolled');

      const countMap = new Map<string, number>();
      enrollments?.forEach(e => countMap.set(e.course_id, (countMap.get(e.course_id) || 0) + 1));

      setEntries((data || []).map(e => ({
        ...e,
        course: courseMap.get(e.course_id) || null,
        studentCount: countMap.get(e.course_id) || 0,
      })));
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().getDay();
  const todayEntries = entries.filter(e => e.day_of_week === today);
  const weekGrouped = [1, 2, 3, 4, 5].map(day => ({
    day: dayNames[day],
    classes: entries.filter(e => e.day_of_week === day),
  })).filter(d => d.classes.length > 0);

  const formatTime = (t: string) => t.slice(0, 5);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Schedule</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">Your teaching schedule from the timetable</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Classes</CardTitle>
                  <CardDescription>{dayNames[today]}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {todayEntries.length === 0 ? (
                    <EmptyState title="No classes today" description="You have no scheduled classes for today." />
                  ) : (
                    <div className="space-y-3">
                      {todayEntries.map(e => (
                        <div key={e.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-1 h-12 rounded-full bg-primary" />
                            <div>
                              <p className="font-medium">{e.course?.code} — {e.course?.title}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(e.start_time)} - {formatTime(e.end_time)}</span>
                                {e.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</span>}
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{e.studentCount} students</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="mt-4 space-y-4">
              {weekGrouped.length === 0 ? (
                <Card><CardContent className="pt-6"><EmptyState title="No schedule found" description="No timetable entries found for your courses." /></CardContent></Card>
              ) : weekGrouped.map(day => (
                <Card key={day.day}>
                  <CardHeader className="pb-3"><CardTitle className="text-base">{day.day}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {day.classes.map(cls => (
                        <div key={cls.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-2 h-8 rounded-full bg-primary" />
                          <div>
                            <p className="font-medium text-sm">{cls.course?.code}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(cls.start_time)}-{formatTime(cls.end_time)} • {cls.studentCount} students</p>
                          </div>
                          {cls.venue && <Badge variant="outline" className="ml-auto text-xs">{cls.venue}</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
