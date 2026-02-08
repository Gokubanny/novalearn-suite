import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  MessageSquare,
  PlusCircle,
  Settings,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Analytics', href: '/dashboard/lecturer/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/dashboard/lecturer/messages', icon: MessageSquare },
];

const courses = [
  { 
    id: 1,
    name: 'Introduction to Computer Science', 
    code: 'CS101',
    students: 45,
    assignments: 3,
    avgGrade: 78,
    status: 'active'
  },
  { 
    id: 2,
    name: 'Data Structures & Algorithms', 
    code: 'CS201',
    students: 38,
    assignments: 2,
    avgGrade: 72,
    status: 'active'
  },
  { 
    id: 3,
    name: 'Web Development', 
    code: 'CS301',
    students: 52,
    assignments: 4,
    avgGrade: 85,
    status: 'active'
  },
  { 
    id: 4,
    name: 'Database Systems', 
    code: 'CS401',
    students: 30,
    assignments: 0,
    avgGrade: 0,
    status: 'draft'
  },
];

export default function LecturerCoursesPage() {
  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Lecturer Portal"
      accentColor="hsl(142, 71%, 45%)"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Manage your courses and content</p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                        {course.status === 'active' ? 'Active' : 'Draft'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{course.code}</span>
                    </div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{course.students}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{course.assignments}</p>
                    <p className="text-xs text-muted-foreground">Assignments</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{course.avgGrade || '-'}%</p>
                    <p className="text-xs text-muted-foreground">Avg. Grade</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
