import { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Users, FileText, BarChart3, MessageSquare,
  PlusCircle, Settings, Eye, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CourseDiscussions } from '@/components/course/CourseDiscussions';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Analytics', href: '/dashboard/lecturer/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/dashboard/lecturer/messages', icon: MessageSquare },
];

interface LecturerCourse {
  id: string;
  title: string;
  code: string;
  is_active: boolean;
  credit_units: number | null;
  semester: string | null;
  enrollment_count: number;
  assignments_count: number;
  materials_count: number;
}

export default function LecturerCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [discussionCourse, setDiscussionCourse] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    setLoading(true);

    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('lecturer_id', user.id);

    if (!coursesData) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      coursesData.map(async (course) => {
        const [{ count: enrollCount }, { count: assignCount }, { count: matCount }] = await Promise.all([
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_id', course.id),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('course_id', course.id),
          supabase.from('course_materials').select('*', { count: 'exact', head: true }).eq('course_id', course.id),
        ]);

        return {
          id: course.id,
          title: course.title,
          code: course.code,
          is_active: course.is_active ?? true,
          credit_units: course.credit_units,
          semester: course.semester,
          enrollment_count: enrollCount ?? 0,
          assignments_count: assignCount ?? 0,
          materials_count: matCount ?? 0,
        };
      })
    );

    setCourses(enriched);
    setLoading(false);
  };

  if (discussionCourse) {
    return (
      <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 71%, 45%)">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setDiscussionCourse(null)}>
            ← Back to Courses
          </Button>
          <CourseDiscussions courseId={discussionCourse.id} courseName={discussionCourse.title} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 71%, 45%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Manage your courses and content</p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="You haven't been assigned any courses. Contact your admin to get started."
            icon={BookOpen}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={course.is_active ? 'default' : 'secondary'}>
                          {course.is_active ? 'Active' : 'Draft'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{course.code}</span>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{course.enrollment_count}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{course.assignments_count}</p>
                      <p className="text-xs text-muted-foreground">Assignments</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{course.materials_count}</p>
                      <p className="text-xs text-muted-foreground">Materials</p>
                    </div>
                  </div>
                  {course.credit_units && (
                    <div className="text-sm text-muted-foreground text-center">
                      {course.credit_units} credit units · {course.semester} semester
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDiscussionCourse({ id: course.id, title: course.title })}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
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
