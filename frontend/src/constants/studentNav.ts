import {
  Home, BookOpen, Calendar, FileText,
  Trophy, CheckCircle, Brain, User, ScrollText,
} from 'lucide-react';

export const studentNavItems = [
  { name: 'Dashboard',    href: '/dashboard/student',              icon: Home        },
  { name: 'My Courses',   href: '/dashboard/student/courses',      icon: BookOpen    },
  { name: 'Attendance',   href: '/dashboard/student/attendance',   icon: CheckCircle },
  { name: 'Schedule',     href: '/dashboard/student/schedule',     icon: Calendar    },
  { name: 'Assignments',  href: '/dashboard/student/assignments',  icon: FileText    },
  { name: 'Results',      href: '/dashboard/student/results',      icon: Trophy      },
  { name: 'Transcript',   href: '/dashboard/student/transcript',   icon: ScrollText  },
  { name: 'AI Assistant', href: '/dashboard/student/ai-assistant', icon: Brain       },
  { name: 'Profile',      href: '/dashboard/student/profile',      icon: User        },
];