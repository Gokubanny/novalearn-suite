import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { studentNavItems } from '@/constants/studentNav';
import { courseService } from '@/services/course.service';
import { attendanceService } from '@/services/attendance.service';

const navItems = studentNavItems;

interface CourseAttendance {
  courseId: string;
  courseName: string;
  courseCode: string;
  attended: number;
  total: number;
  percentage: number;
}

interface RecentRecord {
  id: string;
  date: string;
  courseName: string;
  status: string;
  method: string | null;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendance[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
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
        setCourseAttendance([]); setRecentRecords([]); setLoading(false); return;
      }

      const summaries = await Promise.all(courses.map(async (c) => {
        const cid = c._id ?? c.id;
        try {
          const r = await attendanceService.getStudentAttendanceSummary(cid);
          return { course: c, summary: r.data?.data };
        } catch {
          return { course: c, summary: null };
        }
      }));

      const stats: CourseAttendance[] = [];
      const records: RecentRecord[] = [];
      summaries.forEach(({ course, summary }) => {
        if (!summary) return;
        const total = summary.totalClasses ?? summary.total ?? 0;
        const attended = summary.attended ?? summary.present ?? 0;
        if (total > 0) {
          stats.push({
            courseId: course._id ?? course.id,
            courseName: course.title,
            courseCode: course.code,
            attended,
            total,
            percentage: Math.round((attended / total) * 100),
          });
        }
        const recs: any[] = summary.records ?? summary.history ?? [];
        recs.forEach((r) => {
          records.push({
            id: r._id ?? r.id ?? `${course._id}-${r.date}`,
            date: r.date ?? r.markedAt,
            courseName: course.title,
            status: r.status ?? 'present',
            method: r.method ?? null,
          });
        });
      });

      records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setCourseAttendance(stats);
      setRecentRecords(records.slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const totalAttended = courseAttendance.reduce((a, c) => a + c.attended, 0);
  const totalClasses = courseAttendance.reduce((a, c) => a + c.total, 0);
  const totalAbsent = totalClasses - totalAttended;
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  const lateCount = recentRecords.filter(r => r.status === 'late').length;

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Attendance</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Attendance Records</h1>
          <p className="text-muted-foreground">Track your class attendance across all courses</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallPercentage}%</div>
                  <Progress value={overallPercentage} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Classes Attended</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAttended}</div>
                  <p className="text-xs text-muted-foreground">Out of {totalClasses} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Classes Missed</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{totalAbsent}</div>
                  <p className="text-xs text-muted-foreground">Across all courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Late Arrivals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lateCount}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="by-course">
              <TabsList>
                <TabsTrigger value="by-course">By Course</TabsTrigger>
                <TabsTrigger value="recent">Recent Records</TabsTrigger>
              </TabsList>

              <TabsContent value="by-course" className="space-y-4 mt-4">
                {courseAttendance.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No attendance records yet.</CardContent></Card>
                ) : courseAttendance.map(course => (
                  <Card key={course.courseId}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{course.courseName}</p>
                          <p className="text-sm text-muted-foreground">{course.attended}/{course.total} classes attended</p>
                        </div>
                        <Badge variant={course.percentage >= 75 ? 'default' : course.percentage >= 60 ? 'secondary' : 'destructive'}>
                          {course.percentage}%
                        </Badge>
                      </div>
                      <Progress value={course.percentage} className="h-2" />
                      {course.percentage < 75 && (
                        <p className="text-xs text-destructive mt-2">⚠ Below minimum 75% attendance requirement</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recent" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                    <CardDescription>Your latest attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentRecords.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No records yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {recentRecords.map(record => (
                          <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-green-500' : record.status === 'late' ? 'bg-orange-500' : 'bg-destructive'}`} />
                              <div>
                                <p className="font-medium text-sm">{record.courseName}</p>
                                <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}>
                              {record.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
