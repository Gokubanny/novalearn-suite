import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { studentNavItems } from '@/constants/studentNav';
import { courseService } from '@/services/course.service';
import { attendanceService } from '@/services/attendance.service';
import { StudentAttendanceAlert } from '@/components/attendance/StudentAttendanceAlert';
import { EmptyState } from '@/components/dashboard/EmptyState';

const navItems = studentNavItems;

// Shape returned by GET /api/attendance/courses/:courseId/my-summary
// data: { total, present, absent, late, percentage }
interface CourseSummary {
  courseId: string;
  courseName: string;
  courseCode: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAttendanceData();
  }, [user]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const cRes = await courseService.getStudentCourses();
      const courses: any[] = cRes.data?.data ?? [];

      if (courses.length === 0) {
        setSummaries([]);
        setLoading(false);
        return;
      }

      // Fetch summary for each enrolled course in parallel
      const results = await Promise.all(
        courses.map(async (c) => {
          const cid = c._id ?? c.id;
          try {
            const r = await attendanceService.getStudentAttendanceSummary(cid);
            // Backend returns: { total, present, absent, late, percentage }
            const data = r.data?.data ?? {};
            return {
              courseId: cid,
              courseName: c.title,
              courseCode: c.code,
              total: data.total ?? 0,
              present: data.present ?? 0,
              absent: data.absent ?? 0,
              late: data.late ?? 0,
              percentage: data.percentage ?? 0,
            } as CourseSummary;
          } catch {
            return null;
          }
        })
      );

      // Only show courses that have at least one attendance record
      const valid = results.filter(
        (r): r is CourseSummary => r !== null && r.total > 0
      );
      setSummaries(valid);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate totals across all courses
  const totalClasses = summaries.reduce((a, c) => a + c.total, 0);
  const totalPresent = summaries.reduce((a, c) => a + c.present, 0);
  const totalAbsent = summaries.reduce((a, c) => a + c.absent, 0);
  const totalLate = summaries.reduce((a, c) => a + c.late, 0);
  const overallPct =
    totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  const atRiskCourses = summaries.filter((c) => c.percentage < 75 && c.total > 0);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Attendance</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Attendance Records</h1>
          <p className="text-muted-foreground">
            Track your attendance across all enrolled courses
          </p>
        </div>

        {/* Live session alerts */}
        <StudentAttendanceAlert />

        {/* At-risk warning */}
        {atRiskCourses.length > 0 && (
          <Alert className="border-destructive/40 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm">
              <span className="font-medium">
                {atRiskCourses.length} course{atRiskCourses.length > 1 ? 's are' : ' is'} below 75% attendance:
              </span>{' '}
              {atRiskCourses.map((c) => `${c.courseCode} (${c.percentage}%)`).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : summaries.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No attendance records yet"
            description="Once your lecturers start marking attendance, your records will appear here."
          />
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overall Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallPct}%</div>
                  <Progress value={overallPct} className="h-1.5 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Present
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalPresent}</div>
                  <p className="text-xs text-muted-foreground">of {totalClasses} classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Absent
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{totalAbsent}</div>
                  <p className="text-xs text-muted-foreground">across all courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Late
                  </CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLate}</div>
                  <p className="text-xs text-muted-foreground">this semester</p>
                </CardContent>
              </Card>
            </div>

            {/* Per-course breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Course</CardTitle>
                <CardDescription>
                  Minimum required attendance is 75% per course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {summaries.map((course) => {
                  const isAtRisk = course.percentage < 75;
                  const isWarning = course.percentage >= 75 && course.percentage < 85;
                  return (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-sm truncate">
                            {course.courseCode} — {course.courseName}
                          </span>
                          {isAtRisk && (
                            <Badge variant="destructive" className="text-xs flex-shrink-0">
                              At Risk
                            </Badge>
                          )}
                          {isWarning && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              Low
                            </Badge>
                          )}
                        </div>
                        <span className="font-bold text-sm flex-shrink-0">
                          {course.percentage}%
                        </span>
                      </div>

                      <Progress
                        value={course.percentage}
                        className={
                          isAtRisk
                            ? '[&>div]:bg-destructive'
                            : isWarning
                            ? '[&>div]:bg-orange-500'
                            : ''
                        }
                      />

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          Present: {course.present}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
                          Absent: {course.absent}
                        </span>
                        {course.late > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                            Late: {course.late}
                          </span>
                        )}
                        <span className="ml-auto">
                          {course.present + course.absent + course.late} / {course.total} classes
                        </span>
                      </div>

                      {isAtRisk && (
                        <p className="text-xs text-destructive">
                          ⚠ You need {Math.ceil(course.total * 0.75) - course.present} more
                          class{Math.ceil(course.total * 0.75) - course.present !== 1 ? 'es' : ''}{' '}
                          to reach the 75% requirement.
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}