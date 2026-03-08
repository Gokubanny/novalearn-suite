import { useState, useEffect } from 'react';
import {
  Home, BookOpen, Calendar, FileText, Trophy, MessageSquare,
  Search, Users, Loader2, Plus
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CourseDiscussions } from '@/components/course/CourseDiscussions';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('enrolled');
  const [discussionCourse, setDiscussionCourse] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchEnrolledCourses();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'browse' && availableCourses.length === 0) {
      fetchAvailableCourses();
    }
  }, [activeTab]);

  const enrichCourses = async (coursesData: any[]): Promise<CourseWithDetails[]> => {
    return Promise.all(
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
  };

  const fetchEnrolledCourses = async () => {
    if (!user) return;
    setLoading(true);

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id);

    if (!enrollments || enrollments.length === 0) {
      setEnrolledCourses([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map((e) => e.course_id);
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, lecturer:profiles!courses_lecturer_id_fkey(first_name, last_name)')
      .in('id', courseIds);

    if (coursesData) {
      setEnrolledCourses(await enrichCourses(coursesData));
    }
    setLoading(false);
  };

  const fetchAvailableCourses = async () => {
    if (!user) return;
    setBrowseLoading(true);

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id);

    const enrolledIds = (enrollments || []).map((e) => e.course_id);

    let query = supabase
      .from('courses')
      .select('*, lecturer:profiles!courses_lecturer_id_fkey(first_name, last_name)')
      .eq('is_active', true);

    if (enrolledIds.length > 0) {
      // Filter out already-enrolled courses client-side since .not('id', 'in', ...) needs specific format
    }

    const { data: coursesData } = await query;

    if (coursesData) {
      const filtered = coursesData.filter((c) => !enrolledIds.includes(c.id));
      setAvailableCourses(await enrichCourses(filtered));
    }
    setBrowseLoading(false);
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    setEnrolling(courseId);

    const { error } = await supabase.from('enrollments').insert({
      course_id: courseId,
      student_id: user.id,
    });

    if (error) {
      toast({ title: 'Enrollment failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Enrolled!', description: 'You have been enrolled in the course.' });
      // Move from available to enrolled
      const course = availableCourses.find((c) => c.id === courseId);
      if (course) {
        setAvailableCourses((prev) => prev.filter((c) => c.id !== courseId));
        setEnrolledCourses((prev) => [...prev, { ...course, enrollment_count: course.enrollment_count + 1 }]);
      }
    }
    setEnrolling(null);
  };

  const filterCourses = (courses: CourseWithDetails[]) =>
    courses.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

  if (discussionCourse) {
    return (
      <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setDiscussionCourse(null)}>
            ← Back to Courses
          </Button>
          <CourseDiscussions courseId={discussionCourse.id} courseName={discussionCourse.title} />
        </div>
      </DashboardLayout>
    );
  }

  const renderCourseCard = (course: CourseWithDetails, enrolled: boolean) => (
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
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        )}
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
              <span className="font-medium">
                {course.lecturer.first_name} {course.lecturer.last_name}
              </span>
            </p>
          </div>
        )}
        {enrolled ? (
          <div className="flex gap-2">
            <Button className="flex-1">Continue Learning</Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDiscussionCourse({ id: course.id, title: course.title })}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => handleEnroll(course.id)}
            disabled={enrolling === course.id}
          >
            {enrolling === course.id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Enroll
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">View, browse, and enroll in courses</p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
            <TabsTrigger value="browse">Browse & Enroll</TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filterCourses(enrolledCourses).length === 0 ? (
              <EmptyState
                title="No courses found"
                description={
                  enrolledCourses.length === 0
                    ? "You haven't enrolled in any courses yet. Browse available courses to get started."
                    : 'No courses match your search.'
                }
                icon={BookOpen}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterCourses(enrolledCourses).map((c) => renderCourseCard(c, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="mt-6">
            {browseLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filterCourses(availableCourses).length === 0 ? (
              <EmptyState
                title="No available courses"
                description={
                  availableCourses.length === 0
                    ? "You're enrolled in all available courses, or no courses are available yet."
                    : 'No courses match your search.'
                }
                icon={BookOpen}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterCourses(availableCourses).map((c) => renderCourseCard(c, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
