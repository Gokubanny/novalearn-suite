import { useState, useEffect, useRef } from 'react';
import {
  Home, BookOpen, Users, FileText, BarChart3, Calendar,
  CheckCircle, PlusCircle, Clock, Loader2, ExternalLink,
  User as UserIcon, AlertCircle, Send,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services/course.service';
import { assignmentService } from '@/services/assignment.service';

const navItems = [
  { name: 'Dashboard',   href: '/dashboard/lecturer',             icon: Home        },
  { name: 'My Courses',  href: '/dashboard/lecturer/courses',     icon: BookOpen    },
  { name: 'Attendance',  href: '/dashboard/lecturer/attendance',  icon: CheckCircle },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText    },
  { name: 'Results',     href: '/dashboard/lecturer/results',     icon: BarChart3   },
  { name: 'Students',    href: '/dashboard/lecturer/students',    icon: Users       },
  { name: 'Schedule',    href: '/dashboard/lecturer/schedule',    icon: Calendar    },
  { name: 'Profile',     href: '/dashboard/lecturer/profile',     icon: UserIcon    },
];

interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  totalMarks: number;
  courseTitle: string;
  courseCode: string;
  courseId: string;
  totalEnrolled: number;
  submissionCount: number;
  gradedCount: number;
  attachments: string[];
}

interface SubmissionRow {
  studentId: string;
  studentName: string;
  matric: string;
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  score: number | null;
  feedback: string;
  status: string;
}

interface CourseOpt { id: string; title: string; code: string; }

export default function LecturerAssignmentsPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [assignments, setAssignments]   = useState<AssignmentRow[]>([]);
  const [courses, setCourses]           = useState<CourseOpt[]>([]);
  const [loading, setLoading]           = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen]     = useState(false);
  const [creating, setCreating]         = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', courseId: '',
    dueDate: '', totalMarks: '100',
  });

  // View dialog
  const [viewAssignment, setViewAssignment] = useState<AssignmentRow | null>(null);

  // Grade dialog
  const [gradeAssignment, setGradeAssignment] = useState<AssignmentRow | null>(null);
  const [submissions, setSubmissions]         = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [totalEnrolledGrade, setTotalEnrolledGrade] = useState(0);
  const [grades, setGrades] = useState<Record<string, { score: string; feedback: string }>>({});
  const [savingGrade, setSavingGrade]         = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        courseService.getLecturerCourses(),
        assignmentService.getLecturerAssignments(),
      ]);

      const courseList: CourseOpt[] = (coursesRes.data?.data ?? []).map((c: any) => ({
        id: c._id ?? c.id, title: c.title, code: c.code,
      }));
      setCourses(courseList);

      const list: AssignmentRow[] = (assignmentsRes.data?.data ?? []).map((a: any) => {
        const courseObj  = a.course;
        const subs: any[] = a.submissions ?? [];
        const enrolled   = courseObj?.enrolledStudents?.length ?? 0;
        return {
          id:              a._id ?? a.id,
          title:           a.title,
          description:     a.description ?? null,
          dueDate:         a.dueDate,
          totalMarks:      a.totalMarks ?? 100,
          courseTitle:     courseObj?.title ?? '',
          courseCode:      courseObj?.code  ?? '',
          courseId:        courseObj?._id ?? courseObj?.id ?? '',
          totalEnrolled:   enrolled,
          submissionCount: subs.length,
          gradedCount:     subs.filter((s: any) => s.status === 'graded' || s.score != null).length,
          attachments:     a.attachments ?? [],
        };
      });
      setAssignments(list);
    } catch {
      setAssignments([]);
    }
    setLoading(false);
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!form.title || !form.courseId || !form.dueDate) return;
    setCreating(true);
    try {
      const files = fileRef.current?.files
        ? Array.from(fileRef.current.files)
        : undefined;

      // Fix: send courseId (not course) and totalMarks (not maxScore)
      await assignmentService.createAssignment({
        courseId:    form.courseId,
        title:       form.title,
        description: form.description,
        dueDate:     form.dueDate,
        totalMarks:  parseInt(form.totalMarks) || 100,
      }, files);

      toast({ title: 'Assignment created and students notified!' });
      setCreateOpen(false);
      setForm({ title: '', description: '', courseId: '', dueDate: '', totalMarks: '100' });
      if (fileRef.current) fileRef.current.value = '';
      fetchData();
    } catch (err: any) {
      toast({ title: 'Failed to create', description: err?.message, variant: 'destructive' });
    }
    setCreating(false);
  }

  // ── Grade dialog ──────────────────────────────────────────────────────────
  async function openGradeDialog(assignment: AssignmentRow) {
    setGradeAssignment(assignment);
    setSubmissionsLoading(true);
    try {
      const res = await assignmentService.getAssignmentSubmissions(assignment.id);
      const data = res.data?.data;
      const subs: any[] = data?.submissions ?? [];

      setTotalEnrolledGrade(data?.totalEnrolled ?? 0);
      setSubmissions(subs.map(s => ({
        studentId:   s.student?._id?.toString() ?? s.student?.toString() ?? '',
        studentName: `${s.student?.user?.firstName ?? ''} ${s.student?.user?.lastName ?? ''}`.trim() || 'Student',
        matric:      s.student?.matricNumber ?? '—',
        fileUrl:     s.fileUrl ?? '',
        submittedAt: s.submittedAt ?? '',
        isLate:      s.status === 'late',
        score:       s.score ?? null,
        feedback:    s.feedback ?? '',
        status:      s.status ?? 'submitted',
      })));

      // Initialise grade inputs from existing scores
      const init: Record<string, { score: string; feedback: string }> = {};
      subs.forEach((s: any) => {
        const sid = s.student?._id?.toString() ?? '';
        init[sid] = {
          score:    s.score != null ? String(s.score) : '',
          feedback: s.feedback ?? '',
        };
      });
      setGrades(init);
    } catch (err: any) {
      toast({ title: 'Failed to load submissions', description: err.message, variant: 'destructive' });
    }
    setSubmissionsLoading(false);
  }

  async function saveGrade(studentId: string) {
    if (!gradeAssignment) return;
    const g = grades[studentId];
    if (!g?.score || isNaN(Number(g.score))) {
      toast({ title: 'Enter a valid score', variant: 'destructive' }); return;
    }
    setSavingGrade(studentId);
    try {
      await assignmentService.gradeSubmission(
        gradeAssignment.id, studentId, Number(g.score), g.feedback
      );
      toast({ title: 'Grade saved!' });
      setSubmissions(prev => prev.map(s =>
        s.studentId === studentId
          ? { ...s, score: Number(g.score), feedback: g.feedback, status: 'graded' }
          : s
      ));
      fetchData();
    } catch (err: any) {
      toast({ title: 'Grading failed', description: err.message, variant: 'destructive' });
    }
    setSavingGrade(null);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isOverdue = (a: AssignmentRow) => new Date() > new Date(a.dueDate);
  const getStatusColor = (a: AssignmentRow) => {
    if (a.gradedCount >= a.submissionCount && a.submissionCount > 0) return 'text-green-600';
    if (a.submissionCount > 0) return 'text-blue-600';
    return 'text-orange-600';
  };

  const pending   = assignments.filter(a => a.submissionCount === 0);
  const needsGrading = assignments.filter(a => a.submissionCount > 0 && a.gradedCount < a.submissionCount);
  const completed = assignments.filter(a => a.submissionCount > 0 && a.gradedCount >= a.submissionCount);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Assignments</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Create, manage and grade course assignments</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Create Assignment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pending.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Needs Grading</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{needsGrading.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{completed.length}</div></CardContent>
          </Card>
        </div>

        {/* Assignments list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : assignments.length === 0 ? (
          <Card><CardContent className="pt-6">
            <EmptyState title="No assignments yet" description="Click 'Create Assignment' to post your first assignment." />
          </CardContent></Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>Click Grade to review and score student submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignments.map(a => (
                <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    a.gradedCount >= a.submissionCount && a.submissionCount > 0
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : a.submissionCount > 0
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <FileText className={`h-5 w-5 ${getStatusColor(a)}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{a.courseCode} — {a.courseTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverdue(a) && a.submissionCount === 0 && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-200">Overdue</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {a.totalMarks} marks
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {a.submissionCount} / {a.totalEnrolled} submitted
                      </div>
                    </div>

                    {a.submissionCount > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress
                          value={a.totalEnrolled > 0 ? (a.submissionCount / a.totalEnrolled) * 100 : 0}
                          className="h-1.5 flex-1 max-w-xs"
                        />
                        <span className="text-xs text-muted-foreground">
                          {a.gradedCount}/{a.submissionCount} graded
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewAssignment(a)}
                    >
                      View
                    </Button>
                    {a.submissionCount > 0 && (
                      <Button
                        size="sm"
                        onClick={() => openGradeDialog(a)}
                      >
                        Grade ({a.submissionCount})
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Create Assignment Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>Students in the selected course will be notified</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={form.courseId} onValueChange={v => setForm(f => ({ ...f, courseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Assignment 1 — Data Structures"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description / Instructions</Label>
              <Textarea
                placeholder="Describe what students need to do…"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.totalMarks}
                  onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Attachments (optional)</Label>
              <input ref={fileRef} type="file" multiple className="block w-full text-sm text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Instructions PDFs, reference materials, etc.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !form.title || !form.courseId || !form.dueDate}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {creating ? 'Creating…' : 'Create & Notify Students'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Assignment Dialog ── */}
      <Dialog open={!!viewAssignment} onOpenChange={v => { if (!v) setViewAssignment(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewAssignment?.title}</DialogTitle>
            <DialogDescription>
              {viewAssignment?.courseCode} — {viewAssignment?.courseTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {viewAssignment?.description && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wide">Instructions</p>
                <p>{viewAssignment.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {viewAssignment && new Date(viewAssignment.dueDate).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="font-medium">{viewAssignment?.totalMarks}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submissions</p>
                <p className="font-medium">{viewAssignment?.submissionCount} / {viewAssignment?.totalEnrolled}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Graded</p>
                <p className="font-medium">{viewAssignment?.gradedCount}</p>
              </div>
            </div>
            {viewAssignment && viewAssignment.attachments.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Attachments</p>
                <div className="space-y-1">
                  {viewAssignment.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline text-sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Attachment {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAssignment(null)}>Close</Button>
            {viewAssignment && viewAssignment.submissionCount > 0 && (
              <Button onClick={() => { setViewAssignment(null); openGradeDialog(viewAssignment); }}>
                Grade Submissions
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Grade Submissions Dialog ── */}
      <Dialog open={!!gradeAssignment} onOpenChange={v => { if (!v) setGradeAssignment(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Grade Submissions
            </DialogTitle>
            <DialogDescription>
              {gradeAssignment?.title} — {gradeAssignment?.courseCode} ·{' '}
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} of{' '}
              {totalEnrolledGrade} enrolled
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {submissionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No submissions yet.</p>
              </div>
            ) : (
              submissions.map(sub => {
                const isGraded = sub.status === 'graded' || sub.score != null;
                return (
                  <div key={sub.studentId} className={`rounded-xl border p-4 space-y-3 ${isGraded ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20' : ''}`}>
                    {/* Student info row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sub.studentName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{sub.matric}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.isLate && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">Late</Badge>
                        )}
                        {isGraded && (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                            Graded: {sub.score}/{gradeAssignment?.totalMarks}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="gap-1">
                            <ExternalLink className="h-3.5 w-3.5" /> Submission
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Submitted at */}
                    {sub.submittedAt && (
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}

                    {/* Grade inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Score (max {gradeAssignment?.totalMarks})
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={gradeAssignment?.totalMarks}
                          placeholder="0"
                          value={grades[sub.studentId]?.score ?? ''}
                          onChange={e => setGrades(prev => ({
                            ...prev,
                            [sub.studentId]: { ...prev[sub.studentId], score: e.target.value },
                          }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1 flex flex-col">
                        <Label className="text-xs">Feedback (optional)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write feedback…"
                            value={grades[sub.studentId]?.feedback ?? ''}
                            onChange={e => setGrades(prev => ({
                              ...prev,
                              [sub.studentId]: { ...prev[sub.studentId], feedback: e.target.value },
                            }))}
                            className="h-8 text-sm flex-1"
                          />
                          <Button
                            size="sm"
                            className="h-8 flex-shrink-0"
                            disabled={savingGrade === sub.studentId || !grades[sub.studentId]?.score}
                            onClick={() => saveGrade(sub.studentId)}
                          >
                            {savingGrade === sub.studentId
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : isGraded ? 'Update' : 'Save'
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="border-t pt-3 mt-2">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-muted-foreground">
                {submissions.filter(s => s.status === 'graded').length} of {submissions.length} graded
              </p>
              <Button variant="outline" onClick={() => setGradeAssignment(null)}>Done</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}