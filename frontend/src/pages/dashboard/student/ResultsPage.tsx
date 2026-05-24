import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, BookOpen, Trophy, ScrollText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { studentNavItems } from '@/constants/studentNav';
import { resultService } from '@/services/result.service';

const navItems = studentNavItems;

function getGradeBadgeClass(grade: string | null) {
  if (grade === 'A') return 'bg-green-100 text-green-800 border-green-200';
  if (grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (grade === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (grade === 'D' || grade === 'E') return 'bg-orange-100 text-orange-800 border-orange-200';
  if (!grade) return 'bg-muted text-muted-foreground border-border';
  return 'bg-red-100 text-red-800 border-red-200';
}

interface ResultRow {
  id: string;
  ca_score: number | null;
  exam_score: number | null;
  total_score: number | null;
  grade: string | null;
  gradePoint: number;
  semester: string;
  course: { code: string; title: string; credit_units: number; semester: string } | null;
}

function ResultsTable({ title, results }: { title: string; results: ResultRow[] }) {
  const totalUnits = results.reduce((a, r) => a + (r.course?.credit_units ?? 3), 0);
  const totalWeighted = results.reduce(
    (a, r) => a + (r.gradePoint ?? 0) * (r.course?.credit_units ?? 3), 0
  );
  const semGPA = totalUnits > 0 ? (totalWeighted / totalUnits).toFixed(2) : '—';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>Semester GPA: <span className="font-bold text-foreground">{semGPA}</span></span>
            <span>Units: <span className="font-bold text-foreground">{totalUnits}</span></span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead className="text-center">CA</TableHead>
              <TableHead className="text-center">Exam</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-center">Units</TableHead>
              <TableHead className="text-center">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.course?.code ?? '—'}</TableCell>
                <TableCell>{r.course?.title ?? '—'}</TableCell>
                <TableCell className="text-center">{r.ca_score ?? '—'}</TableCell>
                <TableCell className="text-center">{r.exam_score ?? '—'}</TableCell>
                <TableCell className="text-center font-semibold">{r.total_score ?? '—'}</TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadgeClass(r.grade)}`}>
                    {r.grade ?? '—'}
                  </span>
                </TableCell>
                <TableCell className="text-center">{r.course?.credit_units ?? 3}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {r.gradePoint?.toFixed(1) ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  // ← Fix: use GPA/CGPA from backend, not local recalc
  const [gpa, setGpa] = useState<number>(0);
  const [cgpa, setCgpa] = useState<number>(0);

  // Load available sessions from transcript on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await resultService.getTranscript();
        const transcriptMap: Record<string, any[]> = res.data?.data?.transcript ?? {};
        const sessionList = Object.keys(transcriptMap).sort().reverse(); // newest first
        setSessions(sessionList);
        if (sessionList.length > 0) {
          setSelectedSession(sessionList[0]);
        } else {
          setSessionsLoading(false);
          setLoading(false);
        }
      } catch {
        setSessionsLoading(false);
        setLoading(false);
      }
    })();
  }, []);

  // Refetch results whenever selected session changes
  useEffect(() => {
    if (!selectedSession) return;
    setSessionsLoading(false);
    fetchResults(selectedSession);
  }, [selectedSession]);

  async function fetchResults(session: string) {
    setLoading(true);
    try {
      const res = await resultService.getMyResults(session);

      // ← Fix: backend returns { results: [], gpa, cgpa } — not a plain array
      const { results: list = [], gpa: g = 0, cgpa: c = 0 } = res.data?.data ?? {};

      setGpa(g);
      setCgpa(c);
      setResults(list.map((r: any) => ({
        id: r._id ?? r.id,
        ca_score: r.caScore ?? null,
        exam_score: r.examScore ?? null,
        total_score: r.totalScore ?? null,
        grade: r.grade ?? null,
        gradePoint: r.gradePoint ?? 0,
        semester: r.semester ?? r.course?.semester ?? '',
        course: r.course ? {
          code: r.course.code,
          title: r.course.title,
          credit_units: r.course.creditUnits ?? 3,
          semester: r.course.semester ?? r.semester ?? '',
        } : null,
      })));
    } finally {
      setLoading(false);
    }
  }

  // Group by semester
  const firstSem  = results.filter(r => r.semester.toLowerCase().includes('first'));
  const secondSem = results.filter(r => r.semester.toLowerCase().includes('second'));
  const ungrouped = firstSem.length === 0 && secondSem.length === 0;

  const totalUnits = results.reduce((a, r) => a + (r.course?.credit_units ?? 3), 0);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Results</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Results</h1>
            <p className="text-muted-foreground">Published results for the selected session</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {sessions.length > 0 && (
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" asChild>
              <Link to="/dashboard/student/transcript" className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                Full Transcript
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats — use backend values, not local recalc */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Session GPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{gpa ? gpa.toFixed(2) : '—'}</div>
              <p className="text-xs text-muted-foreground mt-1">This session</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CGPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cgpa ? cgpa.toFixed(2) : '—'}</div>
              <p className="text-xs text-muted-foreground mt-1">Cumulative</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Credit Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
              <p className="text-xs text-muted-foreground mt-1">This session</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Published</p>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {sessionsLoading || loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                title="No published results"
                description={
                  sessions.length === 0
                    ? 'No published results yet. Check back after your lecturers publish scores.'
                    : `No published results for ${selectedSession}.`
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ungrouped ? (
              <ResultsTable title="Results" results={results} />
            ) : (
              <>
                {firstSem.length  > 0 && <ResultsTable title="First Semester"  results={firstSem}  />}
                {secondSem.length > 0 && <ResultsTable title="Second Semester" results={secondSem} />}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}