import { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Calendar, FileText, Trophy, MessageSquare,
  Search, Filter, Clock, Users, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Grades', href: '/dashboard/student/grades', icon: Trophy },
  { name: 'Messages', href: '/dashboard/student/messages', icon: MessageSquare },
];

interface CourseWithDetails {
  id: string;
  title: string;
  code: string;
  description: string | null;
  is_active: boolean;
  credit_units: number | null;
  semester: string | null;
  lecturer: { first_name: string; last_name: string } | null;
  enrollment_count: number;
  materials_count: number;
}

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    setLoading(true);

    // Get enrolled course IDs
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id);

    if (!enrollments || enrollments.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);

    // Fetch courses with lecturer info
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, lecturer:profiles!courses_lecturer_id_fkey(first_name, last_name)')
      .in('id', courseIds);

    if (!coursesData) {
      setCourses([]);
      setLoading(false);
      return;
    }

    // Fetch enrollment counts and materials counts in parallel
    const enriched = await Promise.all(
      coursesData.map(async (course) => {
        const [{ count: enrollCount }, { count: materialsCount }] = await Promise.all([
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_id', course.id),
          supabase.from('course_materials').select('*', { count: 'exact', head: true }).eq('course_id', course.id),
        ]);

        return {
          id: course.id,
          title: course.title,
          code: course.code,
          description: course.description,
          is_active: course.is_active ?? true,
          credit_units: course.credit_units,
          semester: course.semester,
          lecturer: course.lecturer as { first_name: string; last_name: string } | null,
          enrollment_count: enrollCount ?? 0,
          materials_count: materialsCount ?? 0,
        };
      })
    );

    setCourses(enriched);
    setLoading(false);
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">View and manage your enrolled courses</p>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No courses found"
            description={courses.length === 0 ? "You haven't enrolled in any courses yet." : "No courses match your search."}
            icon={BookOpen}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant={course.is_active ? 'secondary' : 'outline'} className="mb-2">
                        {course.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.code}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollment_count} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{course.materials_count} materials</span>
                    </div>
                  </div>
                  {course.credit_units && (
                    <div className="text-sm text-muted-foreground">
                      {course.credit_units} credit units · {course.semester} semester
                    </div>
                  )}
                  {course.lecturer && (
                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Instructor:</span>{' '}
                        <span className="font-medium">{course.lecturer.first_name} {course.lecturer.last_name}</span>
                      </p>
                    </div>
                  )}
                  <Button className="w-full">Continue Learning</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
