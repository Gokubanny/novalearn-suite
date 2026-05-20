import { Home, BookOpen, Calendar, FileText, Trophy, CheckCircle, Brain, User } from 'lucide-react';

export const studentNavItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/student/attendance', icon: CheckCircle },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/student/results', icon: Trophy },
  { name: 'AI Assistant', href: '/dashboard/student/ai-assistant', icon: Brain, requiredPlan: 'pro' as const },
  // { name: 'Profile', href: '/dashboard/student/profile', icon: User },
];
