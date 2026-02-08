import { 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  Trophy, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Grades', href: '/dashboard/student/grades', icon: Trophy },
  { name: 'Messages', href: '/dashboard/student/messages', icon: MessageSquare },
];

const assignments = [
  { 
    id: 1,
    title: 'CS101 Lab Report', 
    course: 'Introduction to Computer Science',
    dueDate: '2024-02-15',
    status: 'pending',
    priority: 'high'
  },
  { 
    id: 2,
    title: 'Math Problem Set 5', 
    course: 'Calculus II',
    dueDate: '2024-02-18',
    status: 'pending',
    priority: 'medium'
  },
  { 
    id: 3,
    title: 'Essay Draft', 
    course: 'English Composition',
    dueDate: '2024-02-20',
    status: 'pending',
    priority: 'low'
  },
  { 
    id: 4,
    title: 'Physics Experiment Report', 
    course: 'Physics 101',
    dueDate: '2024-02-10',
    status: 'submitted',
    priority: 'high'
  },
  { 
    id: 5,
    title: 'Programming Assignment 3', 
    course: 'Introduction to Computer Science',
    dueDate: '2024-02-05',
    status: 'graded',
    grade: '92%',
    priority: 'high'
  },
];

export default function StudentAssignmentsPage() {
  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');
  const gradedAssignments = assignments.filter(a => a.status === 'graded');

  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Student Portal"
      accentColor="hsl(221, 83%, 53%)"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Track and submit your assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
              <Upload className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedAssignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gradedAssignments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={
                            assignment.priority === 'high' ? 'destructive' : 
                            assignment.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {assignment.priority} priority
                        </Badge>
                        <span className="text-sm text-orange-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button>Submit</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      <p className="text-sm text-blue-600 mt-2">Awaiting grade</p>
                    </div>
                  </div>
                  <Button variant="outline">View Submission</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            {gradedAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      <p className="text-sm text-green-600 font-medium mt-2">Grade: {assignment.grade}</p>
                    </div>
                  </div>
                  <Button variant="outline">View Feedback</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
