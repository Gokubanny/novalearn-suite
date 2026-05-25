import { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2, Calendar, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { studentNavItems } from '@/constants/studentNav';
import { courseService } from '@/services/course.service';

const navItems = studentNavItems;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_DAYS = DAYS.slice(1, 6); // Mon–Fri

interface ClassEntry {
  id: string;
  dayIndex: number;
  day: string;
  startTime: string;
  endTime: string;
  venue: string | null;
  courseCode: string;
  courseTitle: string;
}

function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function ClassCard({ entry, accent = false }: { entry: ClassEntry; accent?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${accent ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/50'}`}>
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${accent ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{entry.courseCode}</p>
            <p className="text-xs text-muted-foreground truncate">{entry.courseTitle}</p>
          </div>
          {entry.venue && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              <MapPin className="h-2.5 w-2.5 mr-1" />{entry.venue}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatTime(entry.startTime)} — {formatTime(entry.endTime)}
        </div>
      </div>
    </div>
  );
}

export default function StudentSchedulePage() {
  const [entries, setEntries]   = useState<ClassEntry[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchSchedule(); }, []);

  async function fetchSchedule() {
    setLoading(true);
    try {
      const res = await courseService.getStudentCourses();
      const courses: any[] = res.data?.data ?? [];
      const list: ClassEntry[] = [];
      courses.forEach(c => {
        (c.schedule ?? []).forEach((s: any, i: number) => {
          const dayIdx = DAYS.indexOf(s.day);
          if (dayIdx < 0) return;
          list.push({
            id:          `${c._id ?? c.id}-${i}`,
            dayIndex:    dayIdx,
            day:         s.day,
            startTime:   s.startTime ?? '',
            endTime:     s.endTime   ?? '',
            venue:       s.venue     ?? null,
            courseCode:  c.code,
            courseTitle: c.title,
          });
        });
      });
      list.sort((a, b) => a.dayIndex - b.dayIndex || a.startTime.localeCompare(b.startTime));
      setEntries(list);
    } finally {
      setLoading(false);
    }
  }

  const todayIndex   = new Date().getDay();
  const todayName    = DAYS[todayIndex];
  const todayClasses = entries.filter(e => e.dayIndex === todayIndex);

  // Find next class today (by start time vs now)
  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nextClass = todayClasses.find(e => e.startTime > nowTime);

  const totalClasses = entries.length;

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Schedule</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Class Schedule</h1>
            <p className="text-muted-foreground">Your weekly timetable from enrolled courses</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalClasses}</p>
            <p className="text-xs text-muted-foreground">classes/week</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                title="No schedule found"
                description="Enrol in courses that have timetable entries to see your schedule here."
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Full Week</TabsTrigger>
            </TabsList>

            {/* ── Today ── */}
            <TabsContent value="today" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {todayName}
                  </CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                    {nextClass && (
                      <span className="ml-3 text-primary font-medium">
                        · Next: {nextClass.courseCode} at {formatTime(nextClass.startTime)}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayClasses.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No classes scheduled for today.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayClasses.map(e => (
                        <ClassCard key={e.id} entry={e} accent={e === nextClass} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Full Week ── */}
            <TabsContent value="week" className="mt-4 space-y-3">
              {WEEK_DAYS.map(day => {
                const dayClasses = entries.filter(e => e.day === day);
                const isToday    = day === todayName;
                return (
                  <Card key={day} className={isToday ? 'border-primary/40' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                          {day}
                          {isToday && (
                            <Badge className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                              Today
                            </Badge>
                          )}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dayClasses.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-1">No classes</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {dayClasses.map(e => (
                            <ClassCard key={e.id} entry={e} accent={isToday && e === nextClass} />
                          ))}
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