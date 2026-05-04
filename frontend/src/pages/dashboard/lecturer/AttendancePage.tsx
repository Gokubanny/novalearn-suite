import { useState, useEffect } from 'react';
import { Home, BookOpen, Users, FileText, BarChart3, Calendar, Camera, CheckCircle, Search, User, Loader2 } from 'lucide-react';
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

interface CourseOption { id: string; code: string; title: string; }
interface StudentAttendance {
  studentId: string;
  first_name: string;
  last_name: string;
  matric_number: string | null;
  present: boolean;
}
interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  method: string | null;
  student_name: string;
  matric_number: string | null;
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

  const fetchCourses = async () => {
    try {
      const res = await courseService.getLecturerCourses();
      const list: any[] = res.data?.data ?? [];
      const opts = list.map(c => ({ id: c._id ?? c.id, code: c.code, title: c.title }));
      setCourses(opts);
      if (opts.length > 0) setSelectedCourse(opts[0].id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await courseService.getCourseStudents(selectedCourse);
      const list: any[] = res.data?.data ?? [];
      setStudents(list.map((s) => ({
        studentId: s._id ?? s.id,
        first_name: s.user?.firstName ?? s.firstName ?? '',
        last_name: s.user?.lastName ?? s.lastName ?? '',
        matric_number: s.matricNumber ?? null,
        present: false,
      })));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await attendanceService.getCourseAttendance(selectedCourse);
      const list: any[] = res.data?.data ?? [];
      setRecords(list.slice(0, 50).map((r) => ({
        id: r._id ?? r.id,
        date: r.date ?? r.markedAt ?? '',
        status: r.status ?? 'present',
        method: r.method ?? null,
        student_name: r.student?.user
          ? `${r.student.user.firstName} ${r.student.user.lastName}`
          : (r.studentName ?? 'Unknown'),
        matric_number: r.student?.matricNumber ?? null,
      })));
    } catch {
      setRecords([]);
    }
  };

  const toggleAttendance = (id: string) => {
    setStudents(prev => prev.map(s => s.studentId === id ? { ...s, present: !s.present } : s));
  };

  const submitAttendance = async () => {
    if (!selectedCourse) return;
    setSubmitting(true);
    try {
      const records = students.map(s => ({
        studentId: s.studentId,
        status: s.present ? 'present' : 'absent',
      }));
      await attendanceService.markAttendanceManual(selectedCourse, records);
      toast({ title: 'Attendance submitted', description: `${students.filter(s => s.present).length}/${students.length} students marked present.` });
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const presentCount = students.filter(s => s.present).length;
  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.matric_number?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Attendance Management</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attendance Management</h1>
            <p className="text-muted-foreground">Take attendance manually or with facial recognition</p>
          </div>
          {courses.length > 0 && (
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select Course" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : courses.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No courses assigned yet.</CardContent></Card>
        ) : (
          <Tabs defaultValue="manual">
            <TabsList>
              <TabsTrigger value="manual">Manual Attendance</TabsTrigger>
              <TabsTrigger value="facial">Facial Recognition</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manual Attendance</CardTitle>
                      <CardDescription>Toggle attendance for each student — {new Date().toLocaleDateString()}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search students..." className="w-[200px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Present: {presentCount}/{students.length}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setStudents(prev => prev.map(s => ({ ...s, present: true })))}>Mark All Present</Button>
                      <Button variant="outline" size="sm" onClick={() => setStudents(prev => prev.map(s => ({ ...s, present: false })))}>Mark All Absent</Button>
                    </div>
                  </div>
                  {students.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No students enrolled in this course.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredStudents.map(student => (
                        <div key={student.studentId} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${student.present ? 'bg-green-500' : 'bg-destructive'}`} />
                            <div>
                              <p className="font-medium text-sm">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-muted-foreground">{student.matric_number || 'No matric'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{student.present ? 'Present' : 'Absent'}</span>
                            <Switch checked={student.present} onCheckedChange={() => toggleAttendance(student.studentId)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={submitAttendance} disabled={submitting || students.length === 0}>
                      {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Submit Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="facial" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Camera Feed</CardTitle>
                      <CardDescription>AI-powered facial recognition attendance</CardDescription>
                    </div>
                    <Button><Camera className="h-4 w-4 mr-2" /> Start Scanning</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center space-y-3">
                      <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground font-medium">Camera feed will appear here</p>
                      <p className="text-sm text-muted-foreground">Click "Start Scanning" to begin facial recognition</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>Recent attendance history for this course</CardDescription>
                </CardHeader>
                <CardContent>
                  {records.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No attendance records yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {records.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${r.status === 'present' ? 'bg-green-500' : r.status === 'late' ? 'bg-orange-500' : 'bg-destructive'}`} />
                            <div>
                              <p className="font-medium text-sm">{r.student_name}</p>
                              <p className="text-xs text-muted-foreground">{r.matric_number}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={r.status === 'present' ? 'default' : 'destructive'}>{r.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{r.date && new Date(r.date).toLocaleDateString()} · {r.method}</p>
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
