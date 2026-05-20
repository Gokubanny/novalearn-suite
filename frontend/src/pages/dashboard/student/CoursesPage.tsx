import { useState, useEffect } from 'react';
import {
  Search, Users, Loader2, FileText, MessageSquare, BookOpen,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CourseDiscussions } from '@/components/course/CourseDiscussions';
import { CourseMaterials } from '@/components/course/CourseMaterials';
import { useToast } from '@/hooks/use-toast';
import { studentNavItems } from '@/constants/studentNav';
import { courseService } from '@/services/course.service';
import { attendanceService } from '@/services/attendance.service';

const navItems = studentNavItems;

interface EnrolledCourse {
  id: string;
  title: string;
  code: string;
  creditUnits: number | null;
  semester: string | null;
  level: number | null;
  lecturer: string;
  enrolledCount: number;
  attendancePercentage: number | null;
  isActive: boolean;
}

function mapCourse(c: any): EnrolledCourse {
  const lec = c.lecturer;
  let lecturerName = 'TBD';
  if (lec && typeof lec === 'object') {
    const title = lec.title ?? '';
    const firstName = lec.user?.firstName ?? '';
    const lastName = lec.user?.lastName ?? '';
    lecturerName = [title, firstName, lastName].filter(Boolean).join(' ') || 'TBD';
  }
  return {
    id: c._id ?? c.id,
    title: c.title,
    code: c.code,
    creditUnits: c.creditUnits ?? null,
    semester: c.semester ?? null,
    level: c.level ?? null,
    lecturer: lecturerName,
    enrolledCount: Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0,
    attendancePercentage: null,
    isActive: c.isActive ?? true,
  };
}

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [discussionCourse, setDiscussionCourse] = useState<{ id: string; title: string } | null>(null);
  const [materialsCourse, setMaterialsCourse] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.getStudentCourses();
      const list: any[] = res.data?.data ?? [];
      const mapped = list.map(mapCourse);
      setCourses(mapped);

      // Fetch attendance % per course without blocking render
      const withAttendance = await Promise.all(
        mapped.map(async (c) => {
          try {
            const r = await attendanceService.getStudentAttendanceSummary(c.id);
            const pct = r.data?.data?.percentage ?? null;
            return { ...c, attendancePercentage: typeof pct === 'number' ? pct : null };
          } catch {
            return c;
          }
        })
      );
      setCourses(withAttendance);
    } catch (err: any) {
      toast({
        title: 'Failed to load courses',
        description: err?.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  // Sub-page: Discussions
  if (discussionCourse) {
    return (
      <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setDiscussionCourse(null)}>
            ← Back to Courses
          </Button>
          <CourseDiscussions
            courseId={discussionCourse.id}
            courseName={discussionCourse.title}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Sub-page: Materials
  if (materialsCourse) {
    return (
      <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setMaterialsCourse(null)}>
            ← Back to Courses
          </Button>
          <CourseMaterials
            courseId={materialsCourse.id}
            courseName={materialsCourse.title}
            canUpload={false}
          />
        </div>
      </DashboardLayout>
    );
  }

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">
              {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled this semester
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Enrollment info banner */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Course enrollment is managed by your school administrator. Contact them or your
            department office to be added to a new course.
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 && courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses enrolled"
            description="You are not enrolled in any courses yet. Contact your school administrator to get started."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No courses match your search"
            description={`No course found for "${search}".`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <Card
                key={course.id}
                className={`hover:shadow-lg transition-shadow ${
                  !course.isActive ? 'opacity-60' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                          {course.code}
                        </Badge>
                        {course.level && (
                          <Badge variant="secondary" className="text-xs">
                            {course.level}L
                          </Badge>
                        )}
                        {!course.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base leading-tight">{course.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {course.lecturer}
                        {course.semester && ` · ${course.semester} semester`}
                        {course.creditUnits && ` · ${course.creditUnits} units`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Enrolled count */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.enrolledCount} students enrolled</span>
                  </div>

                  {/* Attendance bar */}
                  {course.attendancePercentage !== null ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Your attendance</span>
                        <span
                          className={`font-medium ${
                            course.attendancePercentage < 75
                              ? 'text-destructive'
                              : course.attendancePercentage < 85
                              ? 'text-orange-500'
                              : 'text-green-600'
                          }`}
                        >
                          {Math.round(course.attendancePercentage)}%
                        </span>
                      </div>
                      <Progress
                        value={course.attendancePercentage}
                        className={`h-1.5 ${
                          course.attendancePercentage < 75
                            ? '[&>div]:bg-destructive'
                            : course.attendancePercentage < 85
                            ? '[&>div]:bg-orange-500'
                            : ''
                        }`}
                      />
                      {course.attendancePercentage < 75 && (
                        <p className="text-xs text-destructive">Below 75% minimum</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No attendance recorded yet</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1 text-xs"
                      size="sm"
                      onClick={() =>
                        setMaterialsCourse({ id: course.id, title: course.title })
                      }
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Materials
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() =>
                        setDiscussionCourse({ id: course.id, title: course.title })
                      }
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Discuss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}