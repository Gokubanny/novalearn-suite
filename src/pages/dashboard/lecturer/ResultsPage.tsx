import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, Upload, Save, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const studentResults = [
  { matric: 'NEX/2024/001', name: 'Adebayo Oluwaseun', ca1: 8, ca2: 7, ca3: 9, exam: 58, total: 82, grade: 'A' },
  { matric: 'NEX/2024/002', name: 'Chinwe Okafor', ca1: 7, ca2: 8, ca3: 6, exam: 52, total: 73, grade: 'B' },
  { matric: 'NEX/2024/003', name: 'Ibrahim Musa', ca1: 5, ca2: 6, ca3: 5, exam: 40, total: 56, grade: 'C' },
  { matric: 'NEX/2024/004', name: 'Fatima Abdullahi', ca1: 9, ca2: 9, ca3: 8, exam: 65, total: 91, grade: 'A' },
  { matric: 'NEX/2024/005', name: 'Emeka Nwankwo', ca1: 4, ca2: 5, ca3: 4, exam: 30, total: 43, grade: 'F' },
  { matric: 'NEX/2024/006', name: 'Grace Adeyemi', ca1: 8, ca2: 7, ca3: 8, exam: 55, total: 78, grade: 'B' },
];

function getGradeColor(grade: string) {
  if (grade === 'A') return 'bg-green-100 text-green-800';
  if (grade === 'B') return 'bg-blue-100 text-blue-800';
  if (grade === 'C') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

export default function LecturerResultsPage() {
  const avgScore = Math.round(studentResults.reduce((a, s) => a + s.total, 0) / studentResults.length);
  const passRate = Math.round((studentResults.filter(s => s.total >= 50).length / studentResults.length) * 100);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Results Management</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Results Management</h1>
            <p className="text-muted-foreground">Upload, edit, and publish student results</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Import CSV</Button>
            <Select defaultValue="cs101">
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cs101">CS101 - Intro to Computer Science</SelectItem>
                <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{studentResults.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{avgScore}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{passRate}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent><Badge variant="secondary">Draft</Badge></CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Results — CS101</CardTitle>
            <CardDescription>CA scores (10 each) + Exam (70) = Total (100)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matric No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">CA1 (10)</TableHead>
                  <TableHead className="text-center">CA2 (10)</TableHead>
                  <TableHead className="text-center">CA3 (10)</TableHead>
                  <TableHead className="text-center">Exam (70)</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentResults.map((s) => (
                  <TableRow key={s.matric}>
                    <TableCell className="font-medium">{s.matric}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell className="text-center"><Input className="w-14 text-center mx-auto" defaultValue={s.ca1} /></TableCell>
                    <TableCell className="text-center"><Input className="w-14 text-center mx-auto" defaultValue={s.ca2} /></TableCell>
                    <TableCell className="text-center"><Input className="w-14 text-center mx-auto" defaultValue={s.ca3} /></TableCell>
                    <TableCell className="text-center"><Input className="w-14 text-center mx-auto" defaultValue={s.exam} /></TableCell>
                    <TableCell className="text-center font-bold">{s.total}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(s.grade)}`}>{s.grade}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline"><Save className="h-4 w-4 mr-2" />Save Draft</Button>
              <Button>Publish Results</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
