import { useState, useEffect } from 'react';
import { Home, BookOpen, Calendar, FileText, Trophy, CheckCircle, Brain, User, Clock, MapPin, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';

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

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string | null;
  course: { code: string; title: string } | null;
}

export default function StudentSchedulePage() {
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
      // Get student's profile to find institution
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, institution_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.institution_id) { setLoading(false); return; }

      // Get enrolled course IDs
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'enrolled');

      const courseIds = enrollments?.map(e => e.course_id) || [];
      if (courseIds.length === 0) { setEntries([]); setLoading(false); return; }

      // Get timetable entries for enrolled courses
      const { data } = await supabase
        .from('timetable')
        .select('id, day_of_week, start_time, end_time, venue, course_id')
        .in('course_id', courseIds)
        .order('day_of_week')
        .order('start_time');

      // Get course details
      const { data: courses } = await supabase
        .from('courses')
        .select('id, code, title')
        .in('id', courseIds);

      const courseMap = new Map(courses?.map(c => [c.id, { code: c.code, title: c.title }]));

      setEntries((data || []).map(e => ({
        ...e,
        course: courseMap.get(e.course_id) || null,
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
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Schedule</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">View your classes and academic calendar</p>
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
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>{dayNames[today]}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {todayEntries.length === 0 ? (
                    <EmptyState title="No classes today" description="You have no scheduled classes for today." />
                  ) : (
                    <div className="space-y-3">
                      {todayEntries.map(e => (
                        <div key={e.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="w-1 h-12 rounded-full bg-primary" />
                          <div className="flex-1">
                            <p className="font-medium">{e.course?.code} — {e.course?.title}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(e.start_time)} - {formatTime(e.end_time)}</span>
                              {e.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</span>}
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
                <Card><CardContent className="pt-6"><EmptyState title="No schedule found" description="No timetable entries found for your enrolled courses." /></CardContent></Card>
              ) : weekGrouped.map(day => (
                <Card key={day.day}>
                  <CardHeader className="pb-3"><CardTitle className="text-base">{day.day}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {day.classes.map(cls => (
                        <div key={cls.id} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-medium">{cls.course?.code}</span>
                          <span className="text-muted-foreground ml-auto">{formatTime(cls.start_time)}-{formatTime(cls.end_time)}</span>
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
