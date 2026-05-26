import { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2, Calendar, Users, BookOpen, Video, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { courseService } from '@/services/course.service';

const navItems = [
  { name: 'Dashboard',   href: '/dashboard/lecturer',             icon: BookOpen  },
  { name: 'My Courses',  href: '/dashboard/lecturer/courses',     icon: BookOpen  },
  { name: 'Attendance',  href: '/dashboard/lecturer/attendance',  icon: Clock     },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: BookOpen  },
  { name: 'Results',     href: '/dashboard/lecturer/results',     icon: BookOpen  },
  { name: 'Students',    href: '/dashboard/lecturer/students',    icon: Users     },
  { name: 'Schedule',    href: '/dashboard/lecturer/schedule',    icon: Calendar  },
  { name: 'Profile',     href: '/dashboard/lecturer/profile',     icon: BookOpen  },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_DAYS = DAYS.slice(1, 6);

interface ClassEntry {
  id:           string;
  dayIndex:     number;
  day:          string;
  startTime:    string;
  endTime:      string;
  venue:        string | null;
  courseCode:   string;
  courseTitle:  string;
  studentCount: number;
  classType:    'physical' | 'online';
  zoomLink:     string;
}

function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function ClassCard({ entry, accent = false }: { entry: ClassEntry; accent?: boolean }) {
  const isOnline = entry.classType === 'online';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
      accent ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/50'
    }`}>
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${accent ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{entry.courseCode}</p>
            <p className="text-xs text-muted-foreground truncate">{entry.courseTitle}</p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs flex-shrink-0 gap-1 ${
              isOnline
                ? 'border-blue-300 text-blue-700 dark:text-blue-400'
                : 'border-green-300 text-green-700 dark:text-green-400'
            }`}
          >
            {isOnline
              ? <><Video className="h-2.5 w-2.5" /> Online</>
              : <><MapPin className="h-2.5 w-2.5" /> {entry.venue || 'Physical'}</>}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(entry.startTime)} — {formatTime(entry.endTime)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {entry.studentCount} student{entry.studentCount !== 1 ? 's' : ''}
          </span>
        </div>

        {isOnline && entry.zoomLink && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            asChild
          >
            <a href={entry.zoomLink} target="_blank" rel="noreferrer">
              <Video className="h-3 w-3" /> Start / Join
              <ExternalLink className="h-2.5 w-2.5 ml-1" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function LecturerSchedulePage() {
  const [entries, setEntries] = useState<ClassEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSchedule(); }, []);

  async function fetchSchedule() {
    setLoading(true);
    try {
      const res = await courseService.getLecturerCourses();
      const courses: any[] = res.data?.data ?? [];
      const list: ClassEntry[] = [];
      courses.forEach(c => {
        const studentCount = Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0;
        (c.schedule ?? []).forEach((s: any, i: number) => {
          const dayIdx = DAYS.indexOf(s.day);
          if (dayIdx < 0) return;
          list.push({
            id:           `${c._id ?? c.id}-${i}`,
            dayIndex:     dayIdx,
            day:          s.day,
            startTime:    s.startTime ?? '',
            endTime:      s.endTime   ?? '',
            venue:        s.venue     ?? null,
            courseCode:   c.code,
            courseTitle:  c.title,
            studentCount,
            classType:    s.classType ?? 'physical',
            zoomLink:     s.zoomLink  ?? '',
          });
        });
      });
      list.sort((a, b) => a.dayIndex - b.dayIndex || a.startTime.localeCompare(b.startTime));
      setEntries(list);
    } finally {
      setLoading(false);
    }
  }

  const todayIndex         = new Date().getDay();
  const todayName          = DAYS[todayIndex];
  const todayClasses       = entries.filter(e => e.dayIndex === todayIndex);
  const nowTime            = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`;
  const nextClass          = todayClasses.find(e => e.startTime > nowTime);
  const totalStudentsToday = todayClasses.reduce((a, e) => a + e.studentCount, 0);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Schedule</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teaching Schedule</h1>
            <p className="text-muted-foreground">Your weekly class timetable</p>
          </div>
          {todayClasses.length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold">{totalStudentsToday}</p>
              <p className="text-xs text-muted-foreground">students today</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState title="No schedule found" description="Contact your school admin to add your class timetable." />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Full Week</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {todayName}
                  </CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {nextClass && (
                      <span className="ml-3 text-primary font-medium">
                        · Up next: {nextClass.courseCode} at {formatTime(nextClass.startTime)}
                        {nextClass.classType === 'online' ? ' (Online)' : ''}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayClasses.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No classes today.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayClasses.map(e => <ClassCard key={e.id} entry={e} accent={e === nextClass} />)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="mt-4 space-y-3">
              {WEEK_DAYS.map(day => {
                const dayClasses  = entries.filter(e => e.day === day);
                const isToday     = day === todayName;
                const dayStudents = dayClasses.reduce((a, e) => a + e.studentCount, 0);
                return (
                  <Card key={day} className={isToday ? 'border-primary/40' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                          {day}
                          {isToday && <Badge className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">Today</Badge>}
                        </CardTitle>
                        {dayClasses.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''} · {dayStudents} students
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dayClasses.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-1">No classes</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {dayClasses.map(e => <ClassCard key={e.id} entry={e} accent={isToday && e === nextClass} />)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}