import { 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  Trophy, 
  MessageSquare,
  Search,
  Filter,
  Clock,
  Users
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Grades', href: '/dashboard/student/grades', icon: Trophy },
  { name: 'Messages', href: '/dashboard/student/messages', icon: MessageSquare },
];

const courses = [
  { 
    id: 1,
    name: 'Introduction to Computer Science', 
    code: 'CS101',
    progress: 75, 
    instructor: 'Dr. Adebayo',
    students: 45,
    duration: '16 weeks',
    status: 'in_progress'
  },
  { 
    id: 2,
    name: 'Calculus II', 
    code: 'MTH201',
    progress: 60, 
    instructor: 'Prof. Okonkwo',
    students: 38,
    duration: '16 weeks',
    status: 'in_progress'
  },
  { 
    id: 3,
    name: 'English Composition', 
    code: 'ENG101',
    progress: 90, 
    instructor: 'Mrs. Ibrahim',
    students: 52,
    duration: '12 weeks',
    status: 'in_progress'
  },
  { 
    id: 4,
    name: 'Physics 101', 
    code: 'PHY101',
    progress: 45, 
    instructor: 'Dr. Chukwu',
    students: 40,
    duration: '16 weeks',
    status: 'in_progress'
  },
  { 
    id: 5,
    name: 'Data Structures', 
    code: 'CS201',
    progress: 100, 
    instructor: 'Dr. Eze',
    students: 35,
    duration: '16 weeks',
    status: 'completed'
  },
  { 
    id: 6,
    name: 'Digital Marketing', 
    code: 'BUS301',
    progress: 0, 
    instructor: 'Prof. Adeleke',
    students: 60,
    duration: '8 weeks',
    status: 'upcoming'
  },
];

export default function StudentCoursesPage() {
  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Student Portal"
      accentColor="hsl(221, 83%, 53%)"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">View and manage your enrolled courses</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge 
                      variant={
                        course.status === 'completed' ? 'default' : 
                        course.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                      className="mb-2"
                    >
                      {course.status === 'completed' ? 'Completed' : 
                       course.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                    </Badge>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>{course.code}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Instructor:</span>{' '}
                    <span className="font-medium">{course.instructor}</span>
                  </p>
                </div>
                
                <Button className="w-full" variant={course.status === 'upcoming' ? 'outline' : 'default'}>
                  {course.status === 'upcoming' ? 'View Details' : 'Continue Learning'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
