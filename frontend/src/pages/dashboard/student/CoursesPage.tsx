import { useState, useEffect } from 'react';
import {
  Search, Users, Loader2, Plus, FileText, MessageSquare, BookOpen,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  attendance_percentage: number | null;
}

function mapCourse(c: any): CourseWithDetails {
  const lec = c.lecturer && typeof c.lecturer === 'object'
    ? {
        first_name: c.lecturer.user?.firstName ?? c.lecturer.title ?? 'Lecturer',
        last_name: c.lecturer.user?.lastName ?? '',
      }
    : null;
  return {
    id: c._id ?? c.id,
    title: c.title,
    code: c.code,
    description: c.description ?? null,
    is_active: c.isActive ?? true,
    credit_units: c.creditUnits ?? null,
    semester: c.semester ?? null,
    lecturer: lec,
    enrollment_count: Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0,
    materials_count: Array.isArray(c.materials) ? c.materials.length : 0,
    attendance_percentage: null,
  };
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
  const [materialsCourse, setMaterialsCourse] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchEnrolledCourses();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'browse' && availableCourses.length === 0 && !browseLoading) {
      fetchAvailableCourses();
    }
  }, [activeTab]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await courseService.getStudentCourses();
      const list: any[] = res.data?.data ?? [];
      const mapped = list.map(mapCourse);
      setEnrolledCourses(mapped);

      // Fetch attendance % per course in parallel
      const withAttendance = await Promise.all(
        mapped.map(async (c) => {
          try {
            const r = await attendanceService.getStudentAttendanceSummary(c.id);
            const data = r.data?.data ?? r.data ?? {};
            const pct = typeof data.percentage === 'number' ? data.percentage : null;
            return { ...c, attendance_percentage: pct };
          } catch {
            return c;
          }
        })
      );
      setEnrolledCourses(withAttendance);
    } catch (err: any) {
      toast({ title: 'Failed to load courses', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchAvailableCourses = async () => {
    if (!user) return;
    setBrowseLoading(true);
    try {
      const res = await courseService.getAllCourses({ limit: 100 });
      const list: any[] = res.data?.data ?? [];
      const enrolledIds = new Set(enrolledCourses.map(c => c.id));
      setAvailableCourses(list.map(mapCourse).filter(c => !enrolledIds.has(c.id)));
    } catch (err: any) {
      toast({ title: 'Failed to load available courses', description: err.message, variant: 'destructive' });
    }
    setBrowseLoading(false);
  };

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await courseService.enrolInCourse(courseId);
      toast({ title: 'Enrolled!', description: 'You have been enrolled in the course.' });
      const course = availableCourses.find(c => c.id === courseId);
      if (course) {
        setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
        setEnrolledCourses(prev => [...prev, { ...course, enrollment_count: course.enrollment_count + 1 }]);
      }
      // Refresh attendance data after enrollment
      await fetchEnrolledCourses();
    } catch (err: any) {
      toast({ title: 'Enrollment failed', description: err.message, variant: 'destructive' });
    }
    setEnrolling(null);
  };

  const filterCourses = (courses: CourseWithDetails[]) =>
    courses.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

  // FIXED: Check materialsCourse first, then discussionCourse
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
              <span className="font-medium">{course.lecturer.first_name} {course.lecturer.last_name}</span>
            </p>
          </div>
        )}
        {enrolled && course.attendance_percentage !== null && (
          <div className="pt-2 border-t space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Attendance</span>
              <span className="font-medium">{Math.round(course.attendance_percentage)}%</span>
            </div>
            <Progress value={course.attendance_percentage} className="h-1.5" />
          </div>
        )}
        {enrolled ? (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setMaterialsCourse({ id: course.id, title: course.title })}>
              <FileText className="h-4 w-4 mr-2" /> Materials
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDiscussionCourse({ id: course.id, title: course.title })}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={() => handleEnroll(course.id)} disabled={enrolling === course.id}>
            {enrolling === course.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
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

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Course enrollment is managed by your school administrator. Contact them or your
            department office to be added to a new course.
          </AlertDescription>
        </Alert>

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
                description={enrolledCourses.length === 0 ? "You haven't enrolled in any courses yet. Browse available courses to get started." : 'No courses match your search.'} 
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
                description={availableCourses.length === 0 ? "You're enrolled in all available courses, or no courses are available yet." : 'No courses match your search.'} 
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