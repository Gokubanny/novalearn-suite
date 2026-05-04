import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, BookOpen, Trophy } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { studentNavItems } from '@/constants/studentNav';
import { resultService } from '@/services/result.service';

const navItems = studentNavItems;

function getGradeColor(grade: string | null) {
  if (grade === 'A') return 'text-green-600';
  if (grade === 'B') return 'text-blue-600';
  if (grade === 'C') return 'text-orange-600';
  return 'text-destructive';
}

interface ResultRow {
  id: string;
  ca_score: number | null;
  exam_score: number | null;
  total_score: number | null;
  grade: string | null;
  course: { code: string; title: string; credit_units: number | null } | null;
  gradePoint: number;
}

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchResults();
  }, [user]);

  async function fetchResults() {
    setLoading(true);
    try {
      const res = await resultService.getMyResults();
      const list: any[] = res.data?.data ?? [];
      setResults(list.map((r) => ({
        id: r._id ?? r.id,
        ca_score: r.caScore ?? r.ca_score ?? null,
        exam_score: r.examScore ?? r.exam_score ?? null,
        total_score: r.totalScore ?? r.total_score ?? null,
        grade: r.grade ?? null,
        gradePoint: r.gradePoint ?? 0,
        course: r.course ? {
          code: r.course.code,
          title: r.course.title,
          credit_units: r.course.creditUnits ?? r.course.credit_units ?? 3,
        } : null,
      })));
    } finally {
      setLoading(false);
    }
  }

  let totalWeighted = 0, totalUnits = 0;
  results.forEach(r => {
    const units = r.course?.credit_units || 3;
    totalWeighted += r.gradePoint * units;
    totalUnits += units;
  });
  const gpa = totalUnits > 0 ? (totalWeighted / totalUnits).toFixed(2) : '—';

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Results & Transcript</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Results & Transcript</h1>
            <p className="text-muted-foreground">View your academic performance</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">GPA</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{gpa}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{totalUnits}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Courses Graded</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{results.length}</div></CardContent>
              </Card>
            </div>

            {results.length === 0 ? (
              <Card><CardContent className="pt-6"><EmptyState title="No results yet" description="Your published results will appear here." /></CardContent></Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Published Results</CardTitle>
                  <CardDescription>CA + Exam = Total</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-center">CA</TableHead>
                        <TableHead className="text-center">Exam</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map(r => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.course?.code}</TableCell>
                          <TableCell>{r.course?.title}</TableCell>
                          <TableCell className="text-center">{r.ca_score ?? '—'}</TableCell>
                          <TableCell className="text-center">{r.exam_score ?? '—'}</TableCell>
                          <TableCell className="text-center font-medium">{r.total_score ?? '—'}</TableCell>
                          <TableCell className={`text-center font-bold ${getGradeColor(r.grade)}`}>{r.grade ?? '—'}</TableCell>
                          <TableCell className="text-center">{r.course?.credit_units ?? 3}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
