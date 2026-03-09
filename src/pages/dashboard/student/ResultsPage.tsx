import { useState, useEffect } from 'react';
import { Download, TrendingUp, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { studentNavItems } from '@/constants/studentNav';

const navItems = studentNavItems;

function getGradeColor(grade: string | null) {
  if (grade === 'A') return 'text-green-600';
  if (grade === 'B') return 'text-blue-600';
  if (grade === 'C') return 'text-orange-600';
  return 'text-destructive';
}

function gradePoints(grade: string | null): number {
  if (grade === 'A') return 5;
  if (grade === 'B') return 4;
  if (grade === 'C') return 3;
  if (grade === 'D') return 2;
  if (grade === 'E') return 1;
  return 0;
}

interface ResultRow {
  id: string;
  ca_score: number | null;
  exam_score: number | null;
  total_score: number | null;
  grade: string | null;
  is_published: boolean | null;
  semester: string | null;
  academic_year: string | null;
  course: { code: string; title: string; credit_units: number | null } | null;
}

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchResults();
  }, [user]);

  async function fetchResults() {
    setLoading(true);
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, matric_number, department')
        .eq('user_id', user!.id)
        .single();
      setProfile(prof);
      if (!prof) { setLoading(false); return; }

      const { data } = await supabase
        .from('results')
        .select('id, ca_score, exam_score, total_score, grade, is_published, semester, academic_year, course_id')
        .eq('student_id', prof.id)
        .eq('is_published', true);

      const courseIds = [...new Set(data?.map(r => r.course_id) || [])];
      const { data: courses } = await supabase
        .from('courses')
        .select('id, code, title, credit_units')
        .in('id', courseIds.length ? courseIds : ['none']);

      const courseMap = new Map(courses?.map(c => [c.id, { code: c.code, title: c.title, credit_units: c.credit_units }]));

      setResults((data || []).map(r => ({
        ...r,
        course: courseMap.get(r.course_id) || null,
      })));
    } finally {
      setLoading(false);
    }
  }

  // Compute GPA
  const publishedResults = results.filter(r => r.grade);
  let totalWeighted = 0, totalUnits = 0;
  publishedResults.forEach(r => {
    const units = r.course?.credit_units || 3;
    totalWeighted += gradePoints(r.grade) * units;
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
                <CardContent><div className="text-2xl font-bold">{publishedResults.length}</div></CardContent>
              </Card>
            </div>

            {results.length === 0 ? (
              <Card><CardContent className="pt-6"><EmptyState title="No results yet" description="Your published results will appear here." /></CardContent></Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Published Results</CardTitle>
                  <CardDescription>CA (30) + Exam (70) = Total (100)</CardDescription>
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
