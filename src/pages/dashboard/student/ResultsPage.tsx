import { Home, BookOpen, Calendar, FileText, Trophy, CheckCircle, Brain, User, Download, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/student/attendance', icon: CheckCircle },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/student/results', icon: Trophy },
  { name: 'AI Assistant', href: '/dashboard/student/ai-assistant', icon: Brain },
  { name: 'Profile', href: '/dashboard/student/profile', icon: User },
];

const currentResults = [
  { course: 'Introduction to Computer Science', code: 'CS101', ca: 28, exam: 62, total: 90, grade: 'A', unit: 3 },
  { course: 'Calculus II', code: 'MTH201', ca: 22, exam: 48, total: 70, grade: 'B', unit: 4 },
  { course: 'English Composition', code: 'ENG101', ca: 30, exam: 65, total: 95, grade: 'A', unit: 2 },
  { course: 'Physics 101', code: 'PHY101', ca: 18, exam: 40, total: 58, grade: 'C', unit: 3 },
  { course: 'Data Structures', code: 'CS201', ca: 25, exam: 55, total: 80, grade: 'A', unit: 3 },
];

const previousSemesters = [
  { semester: '2025/2026 First Semester', gpa: 3.85, courses: 5, totalUnits: 15, status: 'Completed' },
  { semester: '2024/2025 Second Semester', gpa: 3.60, courses: 6, totalUnits: 18, status: 'Completed' },
  { semester: '2024/2025 First Semester', gpa: 3.45, courses: 5, totalUnits: 15, status: 'Completed' },
];

function getGradeColor(grade: string) {
  if (grade === 'A') return 'text-green-600';
  if (grade === 'B') return 'text-blue-600';
  if (grade === 'C') return 'text-orange-600';
  return 'text-destructive';
}

export default function StudentResultsPage() {
  const currentGPA = 3.75;
  const cgpa = 3.65;

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Results & Transcript</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Results & Transcript</h1>
            <p className="text-muted-foreground">View your academic performance and download transcripts</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download Transcript
          </Button>
        </div>

        {/* GPA Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentGPA}</div>
              <p className="text-xs text-green-600">+0.15 from last semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CGPA</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cgpa}</div>
              <p className="text-xs text-muted-foreground">Cumulative</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">63</div>
              <p className="text-xs text-muted-foreground">Of 120 required</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Standing</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2nd Class Upper</div>
              <p className="text-xs text-muted-foreground">Current classification</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Current Semester</TabsTrigger>
            <TabsTrigger value="history">Semester History</TabsTrigger>
            <TabsTrigger value="transcript">Transcript Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>2025/2026 Second Semester</CardTitle>
                <CardDescription>Current academic results</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-center">CA (30)</TableHead>
                      <TableHead className="text-center">Exam (70)</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Units</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentResults.map((result) => (
                      <TableRow key={result.code}>
                        <TableCell className="font-medium">{result.code}</TableCell>
                        <TableCell>{result.course}</TableCell>
                        <TableCell className="text-center">{result.ca}</TableCell>
                        <TableCell className="text-center">{result.exam}</TableCell>
                        <TableCell className="text-center font-medium">{result.total}</TableCell>
                        <TableCell className={`text-center font-bold ${getGradeColor(result.grade)}`}>{result.grade}</TableCell>
                        <TableCell className="text-center">{result.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            {previousSemesters.map((sem) => (
              <Card key={sem.semester}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sem.semester}</p>
                      <p className="text-sm text-muted-foreground">{sem.courses} courses • {sem.totalUnits} units</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{sem.gpa}</p>
                      <Badge>{sem.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="transcript" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Official Transcript Preview</CardTitle>
                <CardDescription>This is a preview. Download the official version for certified copies.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-xl font-bold">NexfordEdu University</h2>
                    <p className="text-sm text-muted-foreground">Official Academic Transcript</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">John Doe</span></div>
                    <div><span className="text-muted-foreground">Matric No:</span> <span className="font-medium">NEX/2024/001</span></div>
                    <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">Computer Science</span></div>
                    <div><span className="text-muted-foreground">Level:</span> <span className="font-medium">200 Level</span></div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cumulative GPA</span>
                      <span className="font-bold text-lg">{cgpa}</span>
                    </div>
                    <Progress value={(cgpa / 5) * 100} className="h-2 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
