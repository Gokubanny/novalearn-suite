import { useState, useEffect } from 'react';
import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, Save, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { toast } from 'sonner';
import { courseService } from '@/services/course.service';
import { resultService } from '@/services/result.service';

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

function computeGrade(total: number): string {
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

function getGradeColor(grade: string) {
  if (grade === 'A') return 'bg-green-100 text-green-800';
  if (grade === 'B') return 'bg-blue-100 text-blue-800';
  if (grade === 'C') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

interface CourseOption { id: string; code: string; title: string; semester?: string; session?: string; }
interface StudentResult {
  studentId: string;
  name: string;
  matric: string;
  ca_score: number;
  exam_score: number;
  total: number;
  grade: string;
  is_published: boolean;
}

export default function LecturerResultsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) fetchStudentResults();
  }, [selectedCourse]);

  async function fetchCourses() {
    try {
      const res = await courseService.getLecturerCourses();
      const list: any[] = res.data?.data ?? [];
      const opts = list.map(c => ({
        id: c._id ?? c.id, code: c.code, title: c.title,
        semester: c.semester, session: c.session,
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
      const [studentsRes, resultsRes] = await Promise.all([
        courseService.getCourseStudents(selectedCourse),
        resultService.getCourseResults(selectedCourse).catch(() => ({ data: { data: [] } })),
      ]);
      const studentList: any[] = studentsRes.data?.data ?? [];
      const resultList: any[] = resultsRes.data?.data ?? [];
      const resultMap = new Map<string, any>();
      resultList.forEach((r) => {
        const sid = (typeof r.student === 'object' ? (r.student._id ?? r.student.id) : r.student);
        resultMap.set(String(sid), r);
      });

      setStudents(studentList.map((s) => {
        const sid = String(s._id ?? s.id);
        const r = resultMap.get(sid);
        const ca = Number(r?.caScore) || 0;
        const exam = Number(r?.examScore) || 0;
        const total = ca + exam;
        return {
          studentId: sid,
          name: `${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`.trim() || 'Student',
          matric: s.matricNumber || '—',
          ca_score: ca,
          exam_score: exam,
          total: r ? (r.totalScore ?? total) : total,
          grade: r?.grade || computeGrade(total),
          is_published: !!r?.isPublished,
        };
      }));
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  function updateScore(idx: number, field: 'ca_score' | 'exam_score', value: string) {
    setStudents(prev => {
      const updated = [...prev];
      const num = Math.max(0, Math.min(field === 'ca_score' ? 40 : 60, Number(value) || 0));
      updated[idx] = { ...updated[idx], [field]: num };
      const total = updated[idx].ca_score + updated[idx].exam_score;
      updated[idx].total = total;
      updated[idx].grade = computeGrade(total);
      return updated;
    });
  }

  async function saveResults(publish: boolean) {
    setSaving(true);
    try {
      const course = courses.find(c => c.id === selectedCourse);
      const payload = {
        results: students.map(s => ({
          studentId: s.studentId,
          caScore: s.ca_score,
          examScore: s.exam_score,
        })),
        semester: course?.semester,
        session: course?.session,
      };
      await resultService.uploadResults(selectedCourse, payload);
      if (publish) {
        await resultService.publishResults(selectedCourse, course?.session);
      }
      toast.success(publish ? 'Results published!' : 'Results saved as draft');
      fetchStudentResults();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  }

  const currentCourse = courses.find(c => c.id === selectedCourse);
  const avgScore = students.length ? Math.round(students.reduce((a, s) => a + s.total, 0) / students.length) : 0;
  const passRate = students.length ? Math.round((students.filter(s => s.total >= 50).length / students.length) * 100) : 0;
  const isPublished = students.some(s => s.is_published);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Results Management</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Results Management</h1>
            <p className="text-muted-foreground">Enter scores and publish student results</p>
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select Course" /></SelectTrigger>
            <SelectContent>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : students.length === 0 ? (
          <Card><CardContent className="pt-6"><EmptyState title="No students enrolled" description="No students are enrolled in this course yet." /></CardContent></Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{students.length}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{avgScore}%</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-600">{passRate}%</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                <CardContent><Badge variant={isPublished ? 'default' : 'secondary'}>{isPublished ? 'Published' : 'Draft'}</Badge></CardContent></Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Student Results — {currentCourse?.code}</CardTitle>
                <CardDescription>CA (40) + Exam (60) = Total (100)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matric No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">CA (40)</TableHead>
                      <TableHead className="text-center">Exam (60)</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s, i) => (
                      <TableRow key={s.studentId}>
                        <TableCell className="font-medium">{s.matric}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="text-center">
                          <Input className="w-16 text-center mx-auto" type="number" min={0} max={40}
                            value={s.ca_score} onChange={e => updateScore(i, 'ca_score', e.target.value)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input className="w-16 text-center mx-auto" type="number" min={0} max={60}
                            value={s.exam_score} onChange={e => updateScore(i, 'exam_score', e.target.value)} />
                        </TableCell>
                        <TableCell className="text-center font-bold">{s.total}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(s.grade)}`}>{s.grade}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" disabled={saving} onClick={() => saveResults(false)}>
                    <Save className="h-4 w-4 mr-2" />Save Draft
                  </Button>
                  <Button disabled={saving} onClick={() => saveResults(true)}>
                    Publish Results
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
