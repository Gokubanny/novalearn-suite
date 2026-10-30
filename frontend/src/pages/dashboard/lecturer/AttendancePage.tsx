import { useState, useEffect, useRef } from 'react';
import {
  Home, BookOpen, Users, FileText, BarChart3, Calendar,
  Camera, CheckCircle, Search, User, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services/course.service';
import { attendanceService } from '@/services/attendance.service';
import { getSocket } from '@/lib/socket';
import { GeofencedSessionPanel } from '@/components/attendance/GeofencedSessionPanel';

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

interface CourseOption {
  id: string;
  code: string;
  title: string;
}

interface StudentAttendance {
  studentId: string;
  first_name: string;
  last_name: string;
  matric_number: string | null;
  present: boolean;
}

// Each item in the flattened records list
interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  method: string | null;
  student_name: string;
  matric_number: string | null;
}

// A geofenced session that is open (or inside its review window) for the
// selected course. While one exists, the Manual tab works against it live.
interface LiveSession {
  sessionId: string;
  inReview: boolean;
}

// 'face' = verified by selfie (locked), 'manual' = marked by the lecturer.
type LiveMethod = 'face' | 'manual';

// The part of a present-student entry from the session results that we use.
interface LiveResultStudent {
  _id?: string;
  id?: string;
  method?: string;
}

export default function LecturerAttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('geofenced');
  const activeTabRef = useRef('geofenced');
  const [live, setLive] = useState<LiveSession | null>(null);
  const [livePresent, setLivePresent] = useState<Record<string, LiveMethod>>({});
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const refreshLiveRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchRecords();
    }
  }, [selectedCourse]);

  // A different course has its own session, so forget the previous one.
  useEffect(() => {
    setLive(null);
    setLivePresent({});
    setPendingIds(new Set());
  }, [selectedCourse]);

  // While the Manual tab is open, keep it in step with the course's live
  // session: who is present (and how), refreshed on a socket push, every 10s
  // as a fallback, and whenever the browser tab regains focus.
  useEffect(() => {
    if (!selectedCourse || activeTab !== 'manual') return;
    let cancelled = false;

    const fetchLive = async () => {
      try {
        const r = await attendanceService.getActiveSession(selectedCourse);
        const data = r.data?.data ?? null;
        const sid = data ? (data._id ?? data.id ?? data.sessionId) : null;
        if (cancelled) return;

        if (!sid) {
          setLive(null);
          setLivePresent({});
          return;
        }

        const res = await attendanceService.getSessionResults(sid);
        if (cancelled) return;

        const list: LiveResultStudent[] = Array.isArray(res.data?.data?.presentStudents)
          ? res.data.data.presentStudents
          : [];
        const map: Record<string, LiveMethod> = {};
        for (const s of list) {
          const id = String(s._id ?? s.id ?? '');
          if (id) map[id] = s.method === 'manual' ? 'manual' : 'face';
        }
        setLive({ sessionId: String(sid), inReview: !!data.inReview });
        setLivePresent(map);
      } catch {
        /* keep the last known state; the next refresh will retry */
      }
    };

    refreshLiveRef.current = fetchLive;
    fetchLive();
    const timer = window.setInterval(fetchLive, 10_000);

    const socket = getSocket();
    const onUpdate = () => { fetchLive(); };
    socket?.on('attendance:session-update', onUpdate);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchLive();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      socket?.off('attendance:session-update', onUpdate);
      document.removeEventListener('visibilitychange', onVisible);
      if (refreshLiveRef.current === fetchLive) refreshLiveRef.current = null;
    };
  }, [selectedCourse, activeTab]);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getLecturerCourses();
      const list: any[] = res.data?.data ?? [];
      const opts = list.map((c) => ({
        id: c._id ?? c.id,
        code: c.code,
        title: c.title,
      }));
      setCourses(opts);
      if (opts.length > 0) setSelectedCourse(opts[0].id);
    } catch (err: any) {
      toast({ title: 'Error loading courses', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await courseService.getCourseStudents(selectedCourse);
      const list: any[] = res.data?.data ?? [];
      setStudents(
        list.map((s) => ({
          studentId: s._id ?? s.id,
          first_name: s.user?.firstName ?? '',
          last_name: s.user?.lastName ?? '',
          matric_number: s.matricNumber ?? null,
          present: false,
        }))
      );
    } catch (err: any) {
      toast({ title: 'Error loading students', description: err.message, variant: 'destructive' });
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await attendanceService.getCourseAttendance(selectedCourse);
      // Backend returns: array of IAttendance documents, each with a nested `records[]`
      // We flatten them so each individual student record becomes one row
      const attendanceDocs: any[] = res.data?.data ?? [];
      const flat: AttendanceRecord[] = [];

      for (const doc of attendanceDocs) {
        const date = doc.date ?? doc.createdAt ?? '';
        for (const rec of doc.records ?? []) {
          const student = rec.student;
          const studentName = student?.user
            ? `${student.user.firstName ?? ''} ${student.user.lastName ?? ''}`.trim()
            : 'Unknown';
          flat.push({
            id: `${doc._id ?? doc.id}-${student?._id ?? student?.id ?? Math.random()}`,
            date,
            status: rec.status ?? 'absent',
            method: rec.method ?? null,
            student_name: studentName || 'Unknown',
            matric_number: student?.matricNumber ?? null,
          });
        }
      }

      // Sort newest first
      flat.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(flat.slice(0, 100));
    } catch {
      setRecords([]);
    }
  };

  // Records are saved when a session ends (or is saved automatically), which
  // can happen while another tab is showing — so reload them when opened.
  const handleTabChange = (value: string) => {
    // The tab component can report the same change more than once in a single
    // click, so ignore a tab we have already switched to.
    if (value === activeTabRef.current) return;
    activeTabRef.current = value;
    setActiveTab(value);
    if (value === 'records' && selectedCourse) fetchRecords();
  };

  const toggleAttendance = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === id ? { ...s, present: !s.present } : s))
    );
  };

  // Live mode: mark or un-mark a student on the running session straight away.
  // Students verified by face are locked and never reach this function.
  const toggleLive = async (studentId: string) => {
    if (!live) return;
    const current = livePresent[studentId];
    if (current === 'face') return;
    const makePresent = !current;

    setPendingIds((prev) => new Set(prev).add(studentId));
    setLivePresent((prev) => {
      const next = { ...prev };
      if (makePresent) next[studentId] = 'manual';
      else delete next[studentId];
      return next;
    });

    try {
      await attendanceService.setManualPresence(live.sessionId, studentId, makePresent);
    } catch (err) {
      // Put the switch back the way it was.
      setLivePresent((prev) => {
        const next = { ...prev };
        if (current) next[studentId] = current;
        else delete next[studentId];
        return next;
      });
      toast({
        title: 'Could not update attendance',
        description: (err as { message?: string })?.message,
        variant: 'destructive',
      });
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
      // Reconcile with the server either way.
      refreshLiveRef.current?.();
    }
  };

  const submitAttendance = async () => {
    if (!selectedCourse) return;
    setSubmitting(true);
    try {
      const payload = students.map((s) => ({
        studentId: s.studentId,
        status: s.present ? 'present' : 'absent',
      }));
      await attendanceService.markAttendanceManual(selectedCourse, payload);
      const presentCount = students.filter((s) => s.present).length;
      toast({
        title: 'Attendance submitted',
        description: `${presentCount}/${students.length} students marked present.`,
      });
      // Reset toggles and refresh records
      setStudents((prev) => prev.map((s) => ({ ...s, present: false })));
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const presentCount = live
    ? students.filter((s) => !!livePresent[s.studentId]).length
    : students.filter((s) => s.present).length;
  const filteredStudents = students.filter((s) =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.matric_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const selectedCourseLabel = courses.find((c) => c.id === selectedCourse);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Attendance Management</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance Management</h1>
            <p className="text-muted-foreground">Take attendance via geofenced session or manually</p>
          </div>
          {courses.length > 0 && (
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No courses assigned yet. Contact your administrator.
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="geofenced">Geofenced Session</TabsTrigger>
              <TabsTrigger value="manual">Manual Attendance</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
            </TabsList>

            {/* ── Geofenced ── */}
            <TabsContent value="geofenced" className="mt-4">
              <GeofencedSessionPanel
                courseId={selectedCourse}
                courseLabel={selectedCourseLabel ? `${selectedCourseLabel.code} — ${selectedCourseLabel.title}` : undefined}
              />
            </TabsContent>

            {/* ── Manual ── */}
            <TabsContent value="manual" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle>Manual Attendance</CardTitle>
                      <CardDescription>
                        Toggle each student — {new Date().toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        className="w-[220px] pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {live && (
                    <p className="mb-3 text-xs text-muted-foreground">
                      A geofenced session is {live.inReview ? 'in its review period' : 'in progress'} — changes
                      here save instantly and students verified by face are locked. Finish with End Session on
                      the Geofenced Session tab.
                    </p>
                  )}

                  {/* Bulk actions */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">
                      Present: {presentCount} / {students.length}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!!live}
                        onClick={() => setStudents((p) => p.map((s) => ({ ...s, present: true })))}
                      >
                        All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!!live}
                        onClick={() => setStudents((p) => p.map((s) => ({ ...s, present: false })))}
                      >
                        All Absent
                      </Button>
                    </div>
                  </div>

                  {students.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No students enrolled in this course yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredStudents.map((student) => {
                        const liveMethod = live ? livePresent[student.studentId] : undefined;
                        const isPresent = live ? !!liveMethod : student.present;

                        return (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  isPresent ? 'bg-green-500' : 'bg-destructive'
                                }`}
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {student.first_name} {student.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {student.matric_number || 'No matric'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">
                                {isPresent ? 'Present' : 'Absent'}
                                {liveMethod === 'face' && ' · Verified'}
                                {liveMethod === 'manual' && ' · Manual'}
                              </span>
                              <Switch
                                checked={isPresent}
                                disabled={
                                  live
                                    ? liveMethod === 'face' || pendingIds.has(student.studentId)
                                    : false
                                }
                                onCheckedChange={() =>
                                  live ? toggleLive(student.studentId) : toggleAttendance(student.studentId)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={submitAttendance}
                      disabled={submitting || students.length === 0 || !!live}
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Submit Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Records ── */}
            <TabsContent value="records" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    All attendance entries for this course (newest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {records.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No attendance records yet for this course.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {records.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                r.status === 'present'
                                  ? 'bg-green-500'
                                  : r.status === 'late'
                                  ? 'bg-orange-500'
                                  : 'bg-destructive'
                              }`}
                            />
                            <div>
                              <p className="font-medium text-sm">{r.student_name}</p>
                              {r.matric_number && (
                                <p className="text-xs text-muted-foreground">{r.matric_number}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge
                              variant={
                                r.status === 'present'
                                  ? 'default'
                                  : r.status === 'late'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {r.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {r.date ? new Date(r.date).toLocaleDateString() : '—'}
                              {r.method && ` · ${r.method}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}