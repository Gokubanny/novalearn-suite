import { useState, useEffect } from 'react';
import {
  Home, BookOpen, Users, FileText, BarChart3, Calendar,
  CheckCircle, PlusCircle, Settings, Loader2, MessageSquare, User
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CourseDiscussions } from '@/components/course/CourseDiscussions';
import { CourseMaterials } from '@/components/course/CourseMaterials';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services/course.service';
import { schoolService } from '@/services/school.service';

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

interface LecturerCourse {
  id: string;
  title: string;
  code: string;
  isActive: boolean;
  creditUnits: number | null;
  semester: string | null;
  level: number | null;
  session: string | null;
  enrolledCount: number;
  department: string | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface CourseForm {
  title: string;
  code: string;
  departmentId: string;
  creditUnits: string;
  semester: string;
  session: string;
  level: string;
  classType: string;
}

const EMPTY_FORM: CourseForm = {
  title: '',
  code: '',
  departmentId: '',
  creditUnits: '3',
  semester: 'first',
  session: '',
  level: '100',
  classType: 'physical',
};

function getCurrentSession() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export default function LecturerCoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CourseForm>({ ...EMPTY_FORM, session: getCurrentSession() });

  // Sub-page state
  const [discussionCourse, setDiscussionCourse] = useState<{ id: string; title: string } | null>(null);
  const [materialsCourse, setMaterialsCourse] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCourses();
    fetchDepartments();
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.getLecturerCourses();
      const list: any[] = res.data?.data ?? [];
      setCourses(
        list.map((c) => ({
          id: c._id ?? c.id,
          title: c.title,
          code: c.code,
          isActive: c.isActive ?? true,
          creditUnits: c.creditUnits ?? null,
          semester: c.semester ?? null,
          level: c.level ?? null,
          session: c.session ?? null,
          // enrolledStudents is populated as array of student objects
          enrolledCount: Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0,
          department: c.department?.name ?? c.department ?? null,
        }))
      );
    } catch (err: any) {
      toast({ title: 'Failed to load courses', description: err?.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      const res = await schoolService.getDepartments();
      const list: any[] = res.data?.data ?? [];
      setDepartments(list.map((d) => ({ id: d._id ?? d.id, name: d.name, code: d.code })));
    } catch {
      // Departments are optional for display — fail silently
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.code.trim() || !form.departmentId) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in Title, Course Code, and Department.',
        variant: 'destructive',
      });
      return;
    }
    setCreating(true);
    try {
      await courseService.createCourse({
        title: form.title.trim(),
        code: form.code.trim().toUpperCase(),
        departmentId: form.departmentId,
        creditUnits: parseInt(form.creditUnits),
        semester: form.semester,
        session: form.session || getCurrentSession(),
        level: parseInt(form.level),
        classType: form.classType,
      });
      toast({ title: 'Course created successfully!' });
      setCreateOpen(false);
      setForm({ ...EMPTY_FORM, session: getCurrentSession() });
      fetchCourses();
    } catch (err: any) {
      toast({ title: 'Failed to create course', description: err?.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const setField = (field: keyof CourseForm) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Sub-pages
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

  if (materialsCourse) {
    return (
      <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 71%, 45%)">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setMaterialsCourse(null)}>
            ← Back to Courses
          </Button>
          <CourseMaterials
            courseId={materialsCourse.id}
            courseName={materialsCourse.title}
            canUpload={true}
          />
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
            <p className="text-muted-foreground">
              {courses.length} course{courses.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
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
            icon={BookOpen}
            title="No courses yet"
            description="Create your first course or ask your administrator to assign courses to you."
            actionLabel="Create Course"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={course.isActive ? 'default' : 'secondary'}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {course.code}
                        </Badge>
                        {course.level && (
                          <Badge variant="secondary" className="text-xs">
                            {course.level}L
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      {course.department && (
                        <CardDescription>{course.department}</CardDescription>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xl font-bold">{course.enrolledCount}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xl font-bold">{course.creditUnits ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">Credits</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xl font-bold capitalize">{course.semester ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">Semester</p>
                    </div>
                  </div>

                  {course.session && (
                    <p className="text-xs text-muted-foreground text-center">
                      Session: {course.session}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
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

      {/* ── Create Course Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!creating) setCreateOpen(v); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the course details. All fields marked * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Title */}
            <div className="sm:col-span-2 space-y-2">
              <Label>Course Title *</Label>
              <Input
                placeholder="e.g. Data Structures and Algorithms"
                value={form.title}
                onChange={(e) => setField('title')(e.target.value)}
              />
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label>Course Code *</Label>
              <Input
                placeholder="e.g. CSC201"
                value={form.code}
                onChange={(e) => setField('code')(e.target.value.toUpperCase())}
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={form.departmentId} onValueChange={setField('departmentId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No departments found
                    </SelectItem>
                  ) : (
                    departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Credit Units */}
            <div className="space-y-2">
              <Label>Credit Units</Label>
              <Select value={form.creditUnits} onValueChange={setField('creditUnits')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} unit{n > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={form.semester} onValueChange={setField('semester')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Semester</SelectItem>
                  <SelectItem value="second">Second Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={setField('level')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[100, 200, 300, 400, 500].map((l) => (
                    <SelectItem key={l} value={String(l)}>{l} Level</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Type */}
            <div className="space-y-2">
              <Label>Class Type</Label>
              <Select value={form.classType} onValueChange={setField('classType')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session */}
            <div className="sm:col-span-2 space-y-2">
              <Label>Academic Session</Label>
              <Input
                placeholder="e.g. 2024/2025"
                value={form.session}
                onChange={(e) => setField('session')(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}