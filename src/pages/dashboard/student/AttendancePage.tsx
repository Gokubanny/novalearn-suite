import { useState, useEffect } from 'react';
import { Home, BookOpen, Calendar, FileText, Trophy, Brain, CheckCircle, XCircle, Clock, TrendingUp, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface CourseAttendance {
  courseId: string;
  courseName: string;
  courseCode: string;
  attended: number;
  total: number;
  percentage: number;
}

interface RecentRecord {
  id: string;
  date: string;
  courseName: string;
  status: string;
  method: string | null;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendance[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAttendanceData();
  }, [user]);

  const fetchAttendanceData = async () => {
    if (!user) return;
    setLoading(true);

    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id);

    if (!enrollments || enrollments.length === 0) {
      setCourseAttendance([]);
      setRecentRecords([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);

    // Get courses info
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, code')
      .in('id', courseIds);

    const courseMap = new Map((courses || []).map(c => [c.id, c]));

    // Get all attendance records for this student in these courses
    const { data: allRecords } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', user.id)
      .in('course_id', courseIds)
      .order('date', { ascending: false });

    const records = allRecords || [];

    // Calculate per-course stats
    const courseStats: CourseAttendance[] = courseIds.map(cid => {
      const c = courseMap.get(cid);
      const courseRecords = records.filter(r => r.course_id === cid);
      const totalClasses = courseRecords.length;
      const attended = courseRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;
      return {
        courseId: cid,
        courseName: c?.title ?? 'Unknown',
        courseCode: c?.code ?? '',
        attended,
        total: totalClasses,
        percentage,
      };
    }).filter(s => s.total > 0);

    setCourseAttendance(courseStats);

    // Recent records
    setRecentRecords(records.slice(0, 20).map(r => ({
      id: r.id,
      date: r.date,
      courseName: courseMap.get(r.course_id)?.title ?? 'Unknown',
      status: r.status ?? 'present',
      method: r.method,
    })));

    setLoading(false);
  };

  const totalAttended = courseAttendance.reduce((a, c) => a + c.attended, 0);
  const totalClasses = courseAttendance.reduce((a, c) => a + c.total, 0);
  const totalAbsent = totalClasses - totalAttended;
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  const lateCount = (recentRecords || []).filter(r => r.status === 'late').length;

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Attendance</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Attendance Records</h1>
          <p className="text-muted-foreground">Track your class attendance across all courses</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
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
                  <div className="text-2xl font-bold">{totalAttended}</div>
                  <p className="text-xs text-muted-foreground">Out of {totalClasses} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Classes Missed</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{totalAbsent}</div>
                  <p className="text-xs text-muted-foreground">Across all courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Late Arrivals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lateCount}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="by-course">
              <TabsList>
                <TabsTrigger value="by-course">By Course</TabsTrigger>
                <TabsTrigger value="recent">Recent Records</TabsTrigger>
              </TabsList>

              <TabsContent value="by-course" className="space-y-4 mt-4">
                {courseAttendance.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No attendance records yet.</CardContent></Card>
                ) : courseAttendance.map(course => (
                  <Card key={course.courseId}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{course.courseName}</p>
                          <p className="text-sm text-muted-foreground">{course.attended}/{course.total} classes attended</p>
                        </div>
                        <Badge variant={course.percentage >= 75 ? 'default' : course.percentage >= 60 ? 'secondary' : 'destructive'}>
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
                    {recentRecords.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No records yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {recentRecords.map(record => (
                          <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-green-500' : record.status === 'late' ? 'bg-orange-500' : 'bg-destructive'}`} />
                              <div>
                                <p className="font-medium text-sm">{record.courseName}</p>
                                <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}>
                              {record.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
