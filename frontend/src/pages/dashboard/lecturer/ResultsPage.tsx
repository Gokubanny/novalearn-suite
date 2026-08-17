import { useState, useEffect, useMemo } from 'react';
import {
  Home, BookOpen, Users, FileText, BarChart3, Calendar,
  CheckCircle, Save, User, Loader2, Send, AlertCircle, Edit3,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { toast } from 'sonner';
import { courseService } from '@/services/course.service';
import { resultService } from '@/services/result.service';

const navItems = [
  { name: 'Dashboard',   href: '/dashboard/lecturer',             icon: Home        },
  { name: 'My Courses',  href: '/dashboard/lecturer/courses',     icon: BookOpen    },
  { name: 'Attendance',  href: '/dashboard/lecturer/attendance',  icon: CheckCircle },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText    },
  { name: 'Results',     href: '/dashboard/lecturer/results',     icon: BarChart3   },
  { name: 'Students',    href: '/dashboard/lecturer/students',    icon: Users       },
  { name: 'Schedule',    href: '/dashboard/lecturer/schedule',    icon: Calendar    },
  { name: 'Profile',     href: '/dashboard/lecturer/profile',     icon: User        },
];

function computeGrade(total: number): string {
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

function getGradeBadgeClass(grade: string) {
  if (grade === 'A') return 'bg-green-100 text-green-800';
  if (grade === 'B') return 'bg-blue-100 text-blue-800';
  if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
  if (grade === 'D' || grade === 'E') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

interface CourseOption {
  id: string;
  code: string;
  title: string;
  semester: string;
  session: string;
  level: number;
}

interface StudentResult {
  studentId: string;
  name: string;
  matric: string;
  ca_score: number;
  exam_score: number;
  original_ca: number;   // ← to detect unsaved changes
  original_exam: number;
  total: number;
  grade: string;
  is_published: boolean;
  has_existing: boolean; // ← true if result already exists in DB
}

export default function LecturerResultsPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchStudentResults(); }, [selectedCourse]);

  async function fetchCourses() {
    try {
      const res = await courseService.getLecturerCourses();
      const list: any[] = res.data?.data ?? [];
      const opts: CourseOption[] = list.map(c => ({
        id:       c._id ?? c.id,
        code:     c.code,
        title:    c.title,
        semester: c.semester ?? '',
        session:  c.session  ?? '',
        level:    c.level    ?? 100,
      }));
      setCourses(opts);
      if (opts.length > 0) setSelectedCourse(opts[0].id);
      else setLoading(false);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  async function fetchStudentResults() {
    setLoading(true);
    try {
      const course = courses.find(c => c.id === selectedCourse);
      const [studentsRes, resultsRes] = await Promise.all([
        courseService.getCourseStudents(selectedCourse),
        resultService.getCourseResults(selectedCourse, course?.session)
          .catch(() => ({ data: { data: [] } })),
      ]);

      const studentList: any[] = studentsRes.data?.data ?? [];
      const resultList:  any[] = resultsRes.data?.data  ?? [];

      // Map studentId → existing result
      const resultMap = new Map<string, any>();
      resultList.forEach(r => {
        if (!r.student) return; // orphaned result — referenced student no longer exists
        const sid = typeof r.student === 'object'
          ? String(r.student._id ?? r.student.id)
          : String(r.student);
        resultMap.set(sid, r);
      });

      setStudents(studentList.map(s => {
        const sid = String(s._id ?? s.id);
        const r   = resultMap.get(sid);
        const ca   = r ? Number(r.caScore)   : 0;
        const exam = r ? Number(r.examScore) : 0;
        return {
          studentId:     sid,
          name:          `${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`.trim() || 'Student',
          matric:        s.matricNumber ?? '—',
          ca_score:      ca,
          exam_score:    exam,
          original_ca:   ca,   // ← snapshot for dirty-check
          original_exam: exam,
          total:         ca + exam,
          grade:         r?.grade ?? computeGrade(ca + exam),
          is_published:  !!r?.isPublished,
          has_existing:  !!r,
        };
      }));
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  function updateScore(idx: number, field: 'ca_score' | 'exam_score', value: string) {
    if (students[idx].is_published) return; // published rows are read-only
    setStudents(prev => {
      const updated = [...prev];
      const max = field === 'ca_score' ? 40 : 60;
      const num = Math.max(0, Math.min(max, Number(value) || 0));
      updated[idx] = { ...updated[idx], [field]: num };
      const total = updated[idx].ca_score + updated[idx].exam_score;
      updated[idx].total = total;
      updated[idx].grade = computeGrade(total);
      return updated;
    });
  }

  const isDirty = (s: StudentResult) =>
    s.ca_score !== s.original_ca || s.exam_score !== s.original_exam;

  // ← Fix: only save rows with actual scores OR existing DB results
  // Prevents saving blank rows for students who haven't been graded
  const rowsToSave = students.filter(
    s => !s.is_published && (s.has_existing || s.ca_score > 0 || s.exam_score > 0)
  );

  const dirtyCount    = students.filter(s => !s.is_published && isDirty(s)).length;
  const allPublished  = students.length > 0 && students.every(s => s.is_published);
  const publishedCount = students.filter(s => s.is_published).length;
  const avgScore = students.length
    ? Math.round(students.reduce((a, s) => a + s.total, 0) / students.length) : 0;
  const passRate = students.length
    ? Math.round((students.filter(s => s.total >= 50).length / students.length) * 100) : 0;

  // Unique sessions from the course list for the session filter
  const availableSessions = useMemo(() => {
    const set = new Set(courses.map(c => c.session).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [courses]);

  // Filter course dropdown by selected session
  const filteredCourses = selectedSession === 'all'
    ? courses
    : courses.filter(c => c.session === selectedSession);

  const currentCourse = courses.find(c => c.id === selectedCourse);

  async function saveResults(publish: boolean) {
    const course = courses.find(c => c.id === selectedCourse);
    if (rowsToSave.length === 0) {
      toast.error('Enter at least one student\'s scores before saving.');
      return;
    }
    setSaving(true);
    try {
      await resultService.uploadResults(selectedCourse, {
        results: rowsToSave.map(s => ({
          studentId: s.studentId,
          caScore:   s.ca_score,
          examScore: s.exam_score,
        })),
        semester: course?.semester,
        session:  course?.session,
      });

      if (publish) {
        await resultService.publishResults(selectedCourse, course?.session);
        toast.success(`Results published for ${rowsToSave.length} student(s).`);
      } else {
        toast.success(`Draft saved for ${rowsToSave.length} student(s).`);
      }

      await fetchStudentResults();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save results.');
    } finally {
      setSaving(false);
      setPublishDialogOpen(false);
    }
  }

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Results Management</span>
        </div>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Results Management</h1>
            <p className="text-muted-foreground">Enter and publish student scores</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Session filter — only shown when lecturer has courses in multiple sessions */}
            {availableSessions.length > 1 && (
              <Select
                value={selectedSession}
                onValueChange={v => {
                  setSelectedSession(v);
                  const first = courses.find(c => v === 'all' || c.session === v);
                  if (first) setSelectedCourse(first.id);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sessions</SelectItem>
                  {availableSessions.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Course selector */}
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-medium">{c.code}</span>
                    <span className="mx-1 text-muted-foreground">—</span>
                    {c.title}
                    <span className="ml-2 text-xs text-muted-foreground">({c.session})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Course meta badges ── */}
        {currentCourse && (
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Badge variant="outline">{currentCourse.session}</Badge>
            <Badge variant="outline">{currentCourse.semester} Semester</Badge>
            <Badge variant="outline">{currentCourse.level} Level</Badge>
            {allPublished && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ✓ All Published
              </Badge>
            )}
            {dirtyCount > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 gap-1">
                <Edit3 className="h-3 w-3" />
                {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                title="No students enrolled"
                description="No students are enrolled in this course yet."
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Students',   value: students.length          },
                { label: 'Avg Score',  value: `${avgScore}%`           },
                { label: 'Pass Rate',  value: `${passRate}%`, green: true },
                { label: 'Published',  value: `${publishedCount}/${students.length}` },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stat.green ? 'text-green-600' : ''}`}>
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Results table ── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>{currentCourse?.code} — {currentCourse?.title}</CardTitle>
                    <CardDescription>CA max 40 · Exam max 60 · Total 100</CardDescription>
                  </div>
                  {!allPublished && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={saving || rowsToSave.length === 0}
                        onClick={() => saveResults(false)}
                      >
                        {saving && !publishDialogOpen
                          ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          : <Save className="h-4 w-4 mr-2" />}
                        Save Draft
                      </Button>
                      <Button
                        size="sm"
                        disabled={saving || rowsToSave.length === 0}
                        onClick={() => setPublishDialogOpen(true)}
                      >
                        <Send className="h-4 w-4 mr-2" /> Publish
                      </Button>
                    </div>
                  )}
                  {allPublished && (
                    <Badge className="bg-green-100 text-green-800 text-sm py-1 px-3">
                      ✓ Results published — read only
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Matric No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center w-24">CA (40)</TableHead>
                      <TableHead className="text-center w-24">Exam (60)</TableHead>
                      <TableHead className="text-center w-20">Total</TableHead>
                      <TableHead className="text-center w-20">Grade</TableHead>
                      <TableHead className="text-center w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s, i) => (
                      <TableRow
                        key={s.studentId}
                        className={isDirty(s) && !s.is_published
                          ? 'bg-orange-50/50 dark:bg-orange-950/20'
                          : ''}
                      >
                        <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium font-mono text-sm">{s.matric}</TableCell>
                        <TableCell>{s.name}</TableCell>

                        {/* CA input */}
                        <TableCell className="text-center">
                          {s.is_published ? (
                            <span className="font-medium">{s.ca_score}</span>
                          ) : (
                            <Input
                              className={`w-16 text-center mx-auto h-8 text-sm ${
                                isDirty(s) ? 'border-orange-400 focus-visible:ring-orange-300' : ''
                              }`}
                              type="number"
                              min={0}
                              max={40}
                              value={s.ca_score}
                              onChange={e => updateScore(i, 'ca_score', e.target.value)}
                            />
                          )}
                        </TableCell>

                        {/* Exam input */}
                        <TableCell className="text-center">
                          {s.is_published ? (
                            <span className="font-medium">{s.exam_score}</span>
                          ) : (
                            <Input
                              className={`w-16 text-center mx-auto h-8 text-sm ${
                                isDirty(s) ? 'border-orange-400 focus-visible:ring-orange-300' : ''
                              }`}
                              type="number"
                              min={0}
                              max={60}
                              value={s.exam_score}
                              onChange={e => updateScore(i, 'exam_score', e.target.value)}
                            />
                          )}
                        </TableCell>

                        <TableCell className="text-center font-bold">{s.total}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeBadgeClass(s.grade)}`}>
                            {s.grade}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {s.is_published ? (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                              Published
                            </Badge>
                          ) : s.has_existing ? (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                              Draft
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Unsaved notice */}
                {dirtyCount > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {dirtyCount} row{dirtyCount !== 1 ? 's' : ''} with unsaved changes — click "Save Draft" to save.
                  </div>
                )}

                {!allPublished && (
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      disabled={saving || rowsToSave.length === 0}
                      onClick={() => saveResults(false)}
                    >
                      {saving && !publishDialogOpen
                        ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        : <Save className="h-4 w-4 mr-2" />}
                      Save Draft
                    </Button>
                    <Button
                      disabled={saving || rowsToSave.length === 0}
                      onClick={() => setPublishDialogOpen(true)}
                    >
                      <Send className="h-4 w-4 mr-2" /> Publish Results
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Publish confirmation */}
        <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish Results?</AlertDialogTitle>
              <AlertDialogDescription>
                This will publish results for <strong>{rowsToSave.length}</strong> student(s) in{' '}
                <strong>{currentCourse?.code} — {currentCourse?.title}</strong>.
                Students will be notified and <strong>results cannot be edited after publishing</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => saveResults(true)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Yes, Publish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}