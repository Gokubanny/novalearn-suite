import { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, Users, FileText, BarChart3, MessageSquare,
  PlusCircle, Clock, CheckCircle, Eye, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { courseService } from '@/services/course.service';
import { assignmentService } from '@/services/assignment.service';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Analytics', href: '/dashboard/lecturer/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/dashboard/lecturer/messages', icon: MessageSquare },
];

interface AssignmentWithStats {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number | null;
  is_published: boolean;
  course_title: string;
  course_code: string;
  course_id: string;
  total_students: number;
  total_submissions: number;
  graded_count: number;
}

interface LecturerCourse {
  id: string;
  title: string;
  code: string;
}

export default function LecturerAssignmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([]);
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course_id: '', due_date: '', max_score: '100' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        courseService.getLecturerCourses(),
        assignmentService.getLecturerAssignments(),
      ]);
      const coursesList: LecturerCourse[] = (coursesRes.data?.data ?? []).map((c: any) => ({
        id: c._id ?? c.id, title: c.title, code: c.code,
      }));
      setCourses(coursesList);

      const list: AssignmentWithStats[] = (assignmentsRes.data?.data ?? []).map((a: any) => {
        const courseId = a.course?._id ?? a.course?.id ?? a.course;
        const course = coursesList.find(c => c.id === courseId);
        const submissions = a.submissions ?? [];
        return {
          id: a._id ?? a.id,
          title: a.title,
          description: a.description ?? null,
          due_date: a.dueDate ?? a.due_date,
          max_score: a.maxScore ?? null,
          is_published: a.isPublished ?? true,
          course_title: course?.title ?? a.course?.title ?? 'Unknown',
          course_code: course?.code ?? a.course?.code ?? '',
          course_id: courseId,
          total_students: a.totalStudents ?? course ? (a.totalStudents ?? 0) : 0,
          total_submissions: a.totalSubmissions ?? submissions.length,
          graded_count: a.gradedCount ?? submissions.filter((s: any) => s.status === 'graded' || s.score != null).length,
        };
      });
      setAssignments(list);
    } catch {
      setAssignments([]);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !form.title || !form.course_id || !form.due_date) return;
    setCreating(true);
    try {
      const file = fileRef.current?.files?.[0];
      const files = file ? [file] : undefined;
      await assignmentService.createAssignment(
        {
          title: form.title,
          description: form.description || '',
          course: form.course_id,
          dueDate: form.due_date,
          maxScore: parseInt(form.max_score) || 100,
        },
        files
      );
      toast({ title: 'Assignment created!' });
      setCreateOpen(false);
      setForm({ title: '', description: '', course_id: '', due_date: '', max_score: '100' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Failed to create', description: err?.message ?? 'Request failed', variant: 'destructive' });
    }
    setCreating(false);
  };

  const getStatus = (a: AssignmentWithStats) => {
    if (a.graded_count >= a.total_submissions && a.total_submissions > 0) return 'completed';
    if (a.total_submissions > 0 && a.graded_count < a.total_submissions) return 'grading';
    return 'active';
  };

  const active = assignments.filter(a => getStatus(a) === 'active');
  const grading = assignments.filter(a => getStatus(a) === 'grading');
  const completed = assignments.filter(a => getStatus(a) === 'completed');

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 71%, 45%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Create and manage course assignments</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{active.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Needs Grading</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{grading.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{completed.length}</div></CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState title="No assignments" description="Create your first assignment to get started." icon={FileText} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>Track submissions and grades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments.map((a) => {
                const status = getStatus(a);
                return (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        status === 'grading' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <FileText className={`h-6 w-6 ${
                          status === 'completed' ? 'text-green-600' :
                          status === 'grading' ? 'text-blue-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{a.title}</h3>
                          <Badge variant={status === 'completed' ? 'default' : status === 'grading' ? 'secondary' : 'outline'}>
                            {status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{a.course_title} ({a.course_code})</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Submissions:</span>
                            <span className="font-medium">{a.total_submissions}/{a.total_students}</span>
                            {a.total_students > 0 && (
                              <Progress value={(a.total_submissions / a.total_students) * 100} className="w-20 h-2" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Graded:</span>
                            <span className="font-medium">{a.graded_count}/{a.total_submissions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />View
                      </Button>
                      {status !== 'completed' && <Button size="sm">Grade</Button>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Course</Label>
              <Select value={form.course_id} onValueChange={(v) => setForm(f => ({ ...f, course_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input type="datetime-local" value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div>
                <Label>Max Score</Label>
                <Input type="number" value={form.max_score} onChange={(e) => setForm(f => ({ ...f, max_score: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Attachment (optional)</Label>
              <input ref={fileRef} type="file" className="mt-1 block w-full text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !form.title || !form.course_id || !form.due_date}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
