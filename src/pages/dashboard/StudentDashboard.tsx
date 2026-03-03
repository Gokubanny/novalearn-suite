import { 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  Trophy, 
  CheckCircle,
  Clock,
  TrendingUp,
  Brain,
  User
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const courses = [
  { name: 'Introduction to Computer Science', progress: 75, instructor: 'Dr. Adebayo' },
  { name: 'Calculus II', progress: 60, instructor: 'Prof. Okonkwo' },
  { name: 'English Composition', progress: 90, instructor: 'Mrs. Ibrahim' },
  { name: 'Physics 101', progress: 45, instructor: 'Dr. Chukwu' },
];

const upcomingAssignments = [
  { title: 'CS101 Lab Report', due: '2 days', course: 'Computer Science' },
  { title: 'Math Problem Set 5', due: '4 days', course: 'Calculus II' },
  { title: 'Essay Draft', due: '1 week', course: 'English Composition' },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Student Portal"
      accentColor="hsl(221, 83%, 53%)"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enrolled Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Assignments
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 due this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current GPA
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.75</div>
              <p className="text-xs text-green-600">+0.15 from last semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Study Hours
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.map((course) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{course.name}</span>
                    <span className="text-muted-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Instructor: {course.instructor}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Don't miss your deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div 
                  key={assignment.title} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">{assignment.course}</p>
                    <p className="text-xs text-orange-600 mt-1">Due in {assignment.due}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Assignments</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">Browse Courses</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">View Schedule</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Brain className="h-5 w-5" />
                <span className="text-xs">AI Assistant</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">View Progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
