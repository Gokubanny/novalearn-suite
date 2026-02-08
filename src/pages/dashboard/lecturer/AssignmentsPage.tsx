import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  MessageSquare,
  PlusCircle,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Analytics', href: '/dashboard/lecturer/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/dashboard/lecturer/messages', icon: MessageSquare },
];

const assignments = [
  { 
    id: 1,
    title: 'Lab Report 3', 
    course: 'Introduction to Computer Science',
    dueDate: '2024-02-15',
    totalSubmissions: 38,
    totalStudents: 45,
    graded: 20,
    status: 'active'
  },
  { 
    id: 2,
    title: 'Project Proposal', 
    course: 'Web Development',
    dueDate: '2024-02-18',
    totalSubmissions: 45,
    totalStudents: 52,
    graded: 45,
    status: 'grading'
  },
  { 
    id: 3,
    title: 'Quiz 5', 
    course: 'Data Structures & Algorithms',
    dueDate: '2024-02-20',
    totalSubmissions: 38,
    totalStudents: 38,
    graded: 38,
    status: 'completed'
  },
];

export default function LecturerAssignmentsPage() {
  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Lecturer Portal"
      accentColor="hsl(142, 71%, 45%)"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Create and manage course assignments</p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Needs Grading</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.status === 'grading').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>Track submissions and grades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.map((assignment) => (
              <div 
                key={assignment.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    assignment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    assignment.status === 'grading' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <FileText className={`h-6 w-6 ${
                      assignment.status === 'completed' ? 'text-green-600' :
                      assignment.status === 'grading' ? 'text-blue-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <Badge variant={
                        assignment.status === 'completed' ? 'default' :
                        assignment.status === 'grading' ? 'secondary' : 'outline'
                      }>
                        {assignment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Submissions:</span>
                        <span className="font-medium">{assignment.totalSubmissions}/{assignment.totalStudents}</span>
                        <Progress 
                          value={(assignment.totalSubmissions / assignment.totalStudents) * 100} 
                          className="w-20 h-2"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Graded:</span>
                        <span className="font-medium">{assignment.graded}/{assignment.totalSubmissions}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {assignment.status !== 'completed' && (
                    <Button size="sm">Grade</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
