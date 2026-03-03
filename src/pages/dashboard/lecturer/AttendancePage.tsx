import { Home, BookOpen, Users, FileText, BarChart3, MessageSquare, Calendar, Camera, CheckCircle, XCircle, Search, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

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

const students = [
  { id: 1, name: 'Adebayo Oluwaseun', matric: 'NEX/2024/001', present: true, confidence: 98 },
  { id: 2, name: 'Chinwe Okafor', matric: 'NEX/2024/002', present: true, confidence: 95 },
  { id: 3, name: 'Ibrahim Musa', matric: 'NEX/2024/003', present: false, confidence: 0 },
  { id: 4, name: 'Fatima Abdullahi', matric: 'NEX/2024/004', present: true, confidence: 92 },
  { id: 5, name: 'Emeka Nwankwo', matric: 'NEX/2024/005', present: false, confidence: 0 },
  { id: 6, name: 'Grace Adeyemi', matric: 'NEX/2024/006', present: true, confidence: 97 },
  { id: 7, name: 'Yusuf Bello', matric: 'NEX/2024/007', present: true, confidence: 89 },
  { id: 8, name: 'Blessing Eze', matric: 'NEX/2024/008', present: true, confidence: 94 },
];

export default function LecturerAttendancePage() {
  const [studentList, setStudentList] = useState(students);

  const toggleAttendance = (id: number) => {
    setStudentList(prev => prev.map(s => s.id === id ? { ...s, present: !s.present } : s));
  };

  const presentCount = studentList.filter(s => s.present).length;

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
          <Select defaultValue="cs101">
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs101">CS101 - Intro to Computer Science</SelectItem>
              <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
              <SelectItem value="web101">WEB101 - Web Development</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="facial">
          <TabsList>
            <TabsTrigger value="facial">Facial Recognition</TabsTrigger>
            <TabsTrigger value="manual">Manual Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="facial" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Camera Feed */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Camera Feed</CardTitle>
                      <CardDescription>AI-powered facial recognition attendance</CardDescription>
                    </div>
                    <Button>
                      <Camera className="h-4 w-4 mr-2" /> Start Scanning
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border relative overflow-hidden">
                    <div className="text-center space-y-3">
                      <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground font-medium">Camera feed will appear here</p>
                      <p className="text-sm text-muted-foreground">Click "Start Scanning" to begin facial recognition</p>
                    </div>
                    {/* Face detection overlay placeholders */}
                    <div className="absolute top-4 left-4 w-20 h-20 border-2 border-green-500 rounded-lg opacity-30" />
                    <div className="absolute top-8 right-12 w-20 h-20 border-2 border-green-500 rounded-lg opacity-30" />
                  </div>
                </CardContent>
              </Card>

              {/* Recognised Students */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recognised Students</CardTitle>
                  <CardDescription>{presentCount}/{studentList.length} detected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {studentList.filter(s => s.present).map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.matric}</p>
                      </div>
                      <Badge variant="default" className="text-xs">{student.confidence}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manual Attendance</CardTitle>
                    <CardDescription>Toggle attendance for each student</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students..." className="w-[200px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Present: {presentCount}/{studentList.length}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setStudentList(prev => prev.map(s => ({ ...s, present: true })))}>Mark All Present</Button>
                    <Button variant="outline" size="sm" onClick={() => setStudentList(prev => prev.map(s => ({ ...s, present: false })))}>Mark All Absent</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {studentList.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${student.present ? 'bg-green-500' : 'bg-destructive'}`} />
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.matric}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{student.present ? 'Present' : 'Absent'}</span>
                        <Switch checked={student.present} onCheckedChange={() => toggleAttendance(student.id)} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button>Submit Attendance</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
