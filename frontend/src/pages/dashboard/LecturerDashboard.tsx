import { useState, useEffect } from 'react';
import {
  Home, BookOpen, Users, FileText, BarChart3, Calendar,
  CheckCircle, PlusCircle, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/course.service';
import { assignmentService } from '@/services/assignment.service';

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

interface DashboardData {
  totalStudents: number;
  activeCourses: number;
  pendingReviews: number;
  totalAssignments: number;
  courses: { id: string; title: string; code: string; studentCount: number; assignmentCount: number }[];
  recentSubmissions: { id: string; student: string; assignment: string; time: string; status: string }[];
}

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        courseService.getLecturerCourses().catch(() => ({ data: { data: [] } })),
        assignmentService.getLecturerAssignments().catch(() => ({ data: { data: [] } })),
      ]);

      const courses: any[] = coursesRes.data?.data ?? [];
      const assignments: any[] = assignmentsRes.data?.data ?? [];

      let totalStudents = 0;
      const enrichedCourses = courses.map((c) => {
        const studentCount = c.enrolledStudents?.length ?? c.enrollmentCount ?? 0;
        const assignmentCount = assignments.filter(
          (a) => (a.course?._id ?? a.course) === (c._id ?? c.id)
        ).length;
        totalStudents += studentCount;
        return {
          id: c._id ?? c.id,
          title: c.title,
          code: c.code,
          studentCount,
          assignmentCount,
        };
      });

      const recentSubmissions: DashboardData['recentSubmissions'] = [];
      let pendingReviews = 0;
      for (const a of assignments) {
        const subs: any[] = a.submissions ?? [];
        for (const s of subs) {
          if (!s.score && s.score !== 0) pendingReviews += 1;
          recentSubmissions.push({
            id: s._id ?? `${a._id}-${s.student?._id ?? s.student}`,
            student: s.student?.firstName
              ? `${s.student.firstName} ${s.student.lastName ?? ''}`.trim()
              : 'Student',
            assignment: a.title,
            time: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '',
            status: s.score != null ? 'graded' : 'submitted',
          });
        }
      }
      recentSubmissions.sort((a, b) => (b.time > a.time ? 1 : -1));

      setData({
        totalStudents,
        activeCourses: enrichedCourses.length,
        pendingReviews,
        totalAssignments: assignments.length,
        courses: enrichedCourses,
        recentSubmissions: recentSubmissions.slice(0, 5),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="Lecturer Portal"
      accentColor="hsl(142, 71%, 45%)"
    >
      <div className="space-y-6">
        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton />
            </div>
            <div className="space-y-3">
              <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
            </div>
          </>
        ) : !data || data.activeCourses === 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Total Students', 'Active Courses', 'Pending Reviews', 'Avg. Score'].map(label => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">0</div></CardContent>
                </Card>
              ))}
            </div>
            <EmptyState
              icon={BookOpen}
              title="No courses assigned"
              description="You don't have any courses assigned yet. Contact your administrator to get courses assigned."
            />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Across all courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.activeCourses}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.pendingReviews}</div>
                  <p className="text-xs text-warning">{data.pendingReviews > 0 ? 'Needs attention' : 'All caught up'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Assignments</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalAssignments}</div>
                  <p className="text-xs text-muted-foreground">Total assignments</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>Manage your active courses</CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/dashboard/lecturer/courses">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.studentCount} students • {course.assignmentCount} assignments
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/lecturer/courses">Manage</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest student work</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.recentSubmissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No submissions yet.</p>
                  ) : data.recentSubmissions.map(sub => (
                    <div key={sub.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {sub.student.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sub.student}</p>
                        <p className="text-xs text-muted-foreground truncate">{sub.assignment}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{sub.time}</span>
                          <Badge variant={sub.status === 'graded' ? 'secondary' : 'outline'} className="text-xs">
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/lecturer/assignments">View All Submissions</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/lecturer/assignments">
                      <PlusCircle className="h-5 w-5" />
                      <span className="text-xs">Create Assignment</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/lecturer/schedule">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">View Schedule</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/lecturer/attendance">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-xs">Mark Attendance</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/lecturer/results">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs">Enter Results</span>
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
