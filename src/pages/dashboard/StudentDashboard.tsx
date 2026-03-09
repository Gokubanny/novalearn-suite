import { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Calendar, FileText, Trophy, CheckCircle,
  Clock, Brain, User, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatsCardSkeleton, CardGridSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/student/attendance', icon: CheckCircle },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/student/results', icon: Trophy },
  { name: 'AI Assistant', href: '/dashboard/student/ai-assistant', icon: Brain, requiredPlan: 'pro' as const },
  { name: 'Profile', href: '/dashboard/student/profile', icon: User },
];

interface DashboardData {
  enrolledCount: number;
  pendingAssignments: number;
  attendanceRate: number;
  courses: { id: string; title: string; code: string; progress: number; lecturer: string }[];
  upcomingAssignments: { id: string; title: string; course: string; due_date: string }[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    if (!user) return;
    setLoading(true);

    // Get enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id);

    const courseIds = (enrollments || []).map(e => e.course_id);
    const enrolledCount = courseIds.length;

    // Get courses
    let courses: DashboardData['courses'] = [];
    if (courseIds.length > 0) {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, code, lecturer:profiles!courses_lecturer_id_fkey(first_name, last_name)')
        .in('id', courseIds);

      courses = (coursesData || []).map(c => {
        const lecturer = c.lecturer as { first_name: string; last_name: string } | null;
        return {
          id: c.id,
          title: c.title,
          code: c.code,
          progress: Math.floor(Math.random() * 60 + 30), // placeholder until real progress tracking
          lecturer: lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : 'TBD',
        };
      });
    }

    // Get pending assignments
    let pendingAssignments = 0;
    let upcomingAssignments: DashboardData['upcomingAssignments'] = [];
    if (courseIds.length > 0) {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, due_date, course:courses!assignments_course_id_fkey(title)')
        .in('course_id', courseIds)
        .eq('is_published', true)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      // Check which ones have submissions
      if (assignments && assignments.length > 0) {
        const { data: subs } = await supabase
          .from('submissions')
          .select('assignment_id')
          .eq('student_id', user.id)
          .in('assignment_id', assignments.map(a => a.id));

        const submittedIds = new Set(subs?.map(s => s.assignment_id) || []);
        const pendingOnes = assignments.filter(a => !submittedIds.has(a.id));
        pendingAssignments = pendingOnes.length;
        upcomingAssignments = pendingOnes.slice(0, 3).map(a => ({
          id: a.id,
          title: a.title,
          course: (a.course as { title: string } | null)?.title || 'Unknown',
          due_date: a.due_date,
        }));
      }
    }

    // Get attendance rate
    let attendanceRate = 0;
    if (courseIds.length > 0) {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', user.id)
        .in('course_id', courseIds);

      if (attendance && attendance.length > 0) {
        const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        attendanceRate = Math.round((present / attendance.length) * 100);
      }
    }

    setData({ enrolledCount, pendingAssignments, attendanceRate, courses, upcomingAssignments });
    setLoading(false);
  }

  const formatDueDate = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Overdue';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due ${due.toLocaleDateString()}`;
  };

  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Student Portal"
      accentColor="hsl(221, 83%, 53%)"
    >
      <div className="space-y-6">
        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton />
            </div>
            <CardGridSkeleton count={3} />
          </>
        ) : !data || data.enrolledCount === 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">0</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Assignments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">0</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">—</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Results</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">—</div></CardContent>
              </Card>
            </div>

            <EmptyState 
              icon={BookOpen}
              title="Welcome to your dashboard" 
              description="You haven't enrolled in any courses yet. Browse available courses to get started."
              actionLabel="Browse Courses"
              onAction={() => window.location.href = '/dashboard/student/courses'}
            />
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.enrolledCount}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Assignments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.pendingAssignments}</div>
                  <p className="text-xs text-muted-foreground">Need submission</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.attendanceRate > 0 ? `${data.attendanceRate}%` : '—'}</div>
                  <Progress value={data.attendanceRate} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.courses.length}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Progress */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Your enrolled courses this semester</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No courses found.</p>
                  ) : data.courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.code} • {course.lecturer}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/student/courses">View</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Assignments</CardTitle>
                  <CardDescription>Don't miss your deadlines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.upcomingAssignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming assignments.</p>
                  ) : data.upcomingAssignments.map(a => (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.course}</p>
                        <p className="text-xs text-warning mt-1">{formatDueDate(a.due_date)}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/student/assignments">View All Assignments</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/student/courses">
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs">Browse Courses</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/student/schedule">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">View Schedule</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/student/ai-assistant">
                      <Brain className="h-5 w-5" />
                      <span className="text-xs">AI Assistant</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/student/results">
                      <Trophy className="h-5 w-5" />
                      <span className="text-xs">View Results</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
