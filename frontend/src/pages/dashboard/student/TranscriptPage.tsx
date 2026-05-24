import { useState, useEffect } from 'react';
import {
  Loader2, Printer, GraduationCap, BookOpen,
  Building2, User as UserIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { studentNavItems } from '@/constants/studentNav';
import { resultService } from '@/services/result.service';

const navItems = studentNavItems;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGradeBadgeClass(grade: string) {
  if (grade === 'A') return 'bg-green-100 text-green-800';
  if (grade === 'B') return 'bg-blue-100 text-blue-800';
  if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
  if (grade === 'D' || grade === 'E') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

function calcGPA(results: any[]): string {
  let totalWeighted = 0, totalUnits = 0;
  results.forEach(r => {
    const units = r.course?.creditUnits ?? 3;
    totalWeighted += (r.gradePoint ?? 0) * units;
    totalUnits += units;
  });
  return totalUnits > 0 ? (totalWeighted / totalUnits).toFixed(2) : '—';
}

function sumUnits(results: any[]): number {
  return results.reduce((a, r) => a + (r.course?.creditUnits ?? 3), 0);
}

function cgpaClass(cgpa: number): string {
  if (cgpa >= 4.5) return 'First Class Honours';
  if (cgpa >= 3.5) return 'Second Class Upper';
  if (cgpa >= 2.5) return 'Second Class Lower';
  if (cgpa >= 1.5) return 'Third Class';
  return 'Pass';
}

function cgpaBadgeClass(cgpa: number): string {
  if (cgpa >= 4.5) return 'bg-green-100 text-green-800';
  if (cgpa >= 3.5) return 'bg-blue-100 text-blue-800';
  if (cgpa >= 2.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

// ── Semester table ─────────────────────────────────────────────────────────────
function SemesterTable({ title, results }: { title: string; results: any[] }) {
  const units  = sumUnits(results);
  const semGPA = calcGPA(results);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
        <span className="text-xs text-muted-foreground">
          GPA: <span className="font-semibold text-foreground">{semGPA}</span>
          <span className="mx-2">·</span>
          Units: <span className="font-semibold text-foreground">{units}</span>
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Course Title</TableHead>
            <TableHead className="text-center">Units</TableHead>
            <TableHead className="text-center">CA</TableHead>
            <TableHead className="text-center">Exam</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="text-center">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{r.course?.code ?? '—'}</TableCell>
              <TableCell>{r.course?.title ?? '—'}</TableCell>
              <TableCell className="text-center">{r.course?.creditUnits ?? 3}</TableCell>
              <TableCell className="text-center">{r.caScore ?? '—'}</TableCell>
              <TableCell className="text-center">{r.examScore ?? '—'}</TableCell>
              <TableCell className="text-center font-semibold">{r.totalScore ?? '—'}</TableCell>
              <TableCell className="text-center">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${getGradeBadgeClass(r.grade ?? 'F')}`}>
                  {r.grade ?? '—'}
                </span>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {r.gradePoint?.toFixed(1) ?? '—'}
              </TableCell>
            </TableRow>
          ))}

          {/* Subtotal row */}
          <TableRow className="bg-muted/40 font-medium text-sm">
            <TableCell colSpan={2} className="text-right text-muted-foreground">Subtotal</TableCell>
            <TableCell className="text-center">{units}</TableCell>
            <TableCell colSpan={4} />
            <TableCell className="text-center font-bold text-foreground">{semGPA}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function TranscriptPage() {
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await resultService.getTranscript();
        setTranscriptData(res.data?.data ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const student   = transcriptData?.student;
  const cgpa      = transcriptData?.cgpa ?? 0;
  const transcript: Record<string, any[]> = transcriptData?.transcript ?? {};
  const sessions  = Object.keys(transcript).sort().reverse(); // newest first

  const totalUnitsAll = sessions.reduce((a, s) => a + sumUnits(transcript[s]), 0);
  const totalCourses  = sessions.reduce((a, s) => a + transcript[s].length, 0);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Transcript</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Academic Transcript</h1>
            <p className="text-muted-foreground">Full academic history across all sessions</p>
          </div>
          <Button
            variant="outline"
            className="gap-2 print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !transcriptData || sessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                title="No transcript available"
                description="Your transcript will appear here once lecturers publish your results."
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Student info card ── */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: personal details */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="font-semibold">
                          {student?.user?.firstName} {student?.user?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Matric Number</p>
                        <p className="font-semibold font-mono">{student?.matricNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="font-semibold">{(student?.department as any)?.name ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Institution</p>
                        <p className="font-semibold">{(student?.school as any)?.name ?? '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: CGPA + summary stats */}
                  <div className="space-y-3">
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Cumulative GPA
                      </p>
                      <p className="text-5xl font-bold text-primary">{cgpa.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">out of 5.00</p>
                      <Badge className={`mt-2 ${cgpaBadgeClass(cgpa)}`}>
                        {cgpaClass(cgpa)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Sessions',  value: sessions.length  },
                        { label: 'Courses',   value: totalCourses     },
                        { label: 'Tot. Units',value: totalUnitsAll    },
                      ].map(stat => (
                        <div key={stat.label} className="text-center p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-xl font-bold">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Per-session results ── */}
            {sessions.map(session => {
              const sessionResults = transcript[session];
              const firstSem  = sessionResults.filter(r =>
                (r.semester ?? '').toLowerCase().includes('first')
              );
              const secondSem = sessionResults.filter(r =>
                (r.semester ?? '').toLowerCase().includes('second')
              );
              const ungrouped = firstSem.length === 0 && secondSem.length === 0;
              const sessionGPA   = calcGPA(sessionResults);
              const sessionUnits = sumUnits(sessionResults);

              return (
                <Card key={session}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-base">
                        {session} Academic Session
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Session GPA:{' '}
                          <span className="font-bold text-foreground">{sessionGPA}</span>
                        </span>
                        <span>
                          Units:{' '}
                          <span className="font-bold text-foreground">{sessionUnits}</span>
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {ungrouped ? (
                      <SemesterTable title="Results" results={sessionResults} />
                    ) : (
                      <>
                        {firstSem.length  > 0 && <SemesterTable title="First Semester"  results={firstSem}  />}
                        {secondSem.length > 0 && <SemesterTable title="Second Semester" results={secondSem} />}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* ── CGPA summary footer ── */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Cumulative Grade Point Average (CGPA)</p>
                    <p className="text-sm text-muted-foreground">
                      Computed from {totalCourses} published course{totalCourses !== 1 ? 's' : ''} across {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">{cgpa.toFixed(2)} / 5.00</span>
                    <Badge className={cgpaBadgeClass(cgpa)}>{cgpaClass(cgpa)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}