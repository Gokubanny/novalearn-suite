import { useState, useEffect } from 'react';
import {
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3,
  Settings, Calendar, PlusCircle, MapPin, Monitor, Hash,
  Trash2, Bell, Loader2, Video,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/dashboard/EmptyState';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { schoolService } from '@/services/school.service';
import { timetableService, ScheduleEntry } from '@/services/timetable.service';

const navItems = [
  { name: 'Dashboard',     href: '/dashboard/admin',               icon: Home          },
  { name: 'Students',      href: '/dashboard/admin/students',      icon: GraduationCap },
  { name: 'Lecturers',     href: '/dashboard/admin/lecturers',     icon: Users         },
  { name: 'Departments',   href: '/dashboard/admin/departments',   icon: Building2     },
  { name: 'Matric Config', href: '/dashboard/admin/matric-config', icon: Hash          },
  { name: 'Timetable',     href: '/dashboard/admin/timetable',     icon: Calendar      },
  { name: 'Subscription',  href: '/dashboard/admin/subscription',  icon: CreditCard    },
  { name: 'Attendance',    href: '/dashboard/admin/attendance',    icon: BarChart3     },
  { name: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell          },
  { name: 'Settings',      href: '/dashboard/admin/settings',      icon: Settings      },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const TIME_SLOTS = [
  '07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
];

interface GridEntry {
  courseId:     string;
  courseCode:   string;
  courseTitle:  string;
  lecturerName: string;
  department:   string;
  level:        number;
  day:          string;
  startTime:    string;
  endTime:      string;
  venue:        string;
  classType:    'physical' | 'online';
  zoomLink:     string;
  slotIndex:    number;
}

interface CourseOption {
  id:           string;
  code:         string;
  title:        string;
  level:        number;
  department:   string;
  lecturerName: string;
  schedule:     ScheduleEntry[];
}

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function TimetableManagementPage() {
  const [courses, setCourses]         = useState<CourseOption[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  const [selectedDept,  setSelectedDept]  = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Dialog state
  const [addOpen,      setAddOpen]      = useState(false);
  const [addCourseId,  setAddCourseId]  = useState('');
  const [addDay,       setAddDay]       = useState('');
  const [addStart,     setAddStart]     = useState('');
  const [addEnd,       setAddEnd]       = useState('');
  const [addVenue,     setAddVenue]     = useState('');
  const [addClassType, setAddClassType] = useState<'physical' | 'online'>('physical');
  const [addZoomLink,  setAddZoomLink]  = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [deptsRes, coursesRes] = await Promise.all([
        schoolService.getDepartments(),
        timetableService.getCourses(),
      ]);

      setDepartments((deptsRes.data?.data ?? []).map((d: any) => ({
        id: d._id ?? d.id, name: d.name,
      })));

      setCourses((coursesRes.data?.data ?? []).map((c: any) => ({
        id:           c._id ?? c.id,
        code:         c.code,
        title:        c.title,
        level:        c.level,
        department:   c.department?.name ?? '',
        lecturerName: c.lecturer?.user
          ? `${c.lecturer.user.firstName} ${c.lecturer.user.lastName}`
          : '—',
        schedule: (c.schedule ?? []).map((s: any) => ({
          day:       s.day,
          startTime: s.startTime,
          endTime:   s.endTime,
          venue:     s.venue ?? '',
          classType: s.classType ?? 'physical',
          zoomLink:  s.zoomLink ?? '',
        })),
      })));
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data');
    }
    setLoading(false);
  }

  // Flat grid entries
  const allEntries: GridEntry[] = courses.flatMap(c =>
    c.schedule.map((s, idx) => ({
      courseId:    c.id,
      courseCode:  c.code,
      courseTitle: c.title,
      lecturerName: c.lecturerName,
      department:  c.department,
      level:       c.level,
      day:         s.day,
      startTime:   s.startTime,
      endTime:     s.endTime,
      venue:       s.venue,
      classType:   s.classType,
      zoomLink:    s.zoomLink ?? '',
      slotIndex:   idx,
    }))
  );

  const filtered = allEntries.filter(e =>
    (selectedDept  === 'all' || e.department === selectedDept) &&
    (selectedLevel === 'all' || String(e.level) === selectedLevel)
  );

  const getEntry = (day: string, time: string) =>
    filtered.find(e => e.day === day && e.startTime === time);

  const dialogCourses = courses.filter(c =>
    (selectedDept  === 'all' || c.department === selectedDept) &&
    (selectedLevel === 'all' || String(c.level) === selectedLevel)
  );

  function resetDialog() {
    setAddCourseId(''); setAddDay(''); setAddStart('');
    setAddEnd(''); setAddVenue(''); setAddClassType('physical'); setAddZoomLink('');
  }

  // ── Add ──────────────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!addCourseId || !addDay || !addStart || !addEnd) {
      toast.error('Please fill in all required fields.'); return;
    }
    if (addClassType === 'physical' && !addVenue) {
      toast.error('Please enter a venue for the physical class.'); return;
    }
    if (addClassType === 'online' && !addZoomLink) {
      toast.error('Please enter a Zoom link for the online class.'); return;
    }

    const course = courses.find(c => c.id === addCourseId);
    if (!course) return;

    if (course.schedule.some(s => s.day === addDay && s.startTime === addStart)) {
      toast.error(`${course.code} already has a class on ${addDay} at ${formatTime(addStart)}.`);
      return;
    }

    const newEntry: ScheduleEntry = {
      day:       addDay as any,
      startTime: addStart,
      endTime:   addEnd,
      venue:     addClassType === 'online' ? 'Online' : addVenue,
      classType: addClassType,
      zoomLink:  addClassType === 'online' ? addZoomLink : '',
    };

    setSaving(true);
    try {
      await timetableService.updateSchedule(addCourseId, [...course.schedule, newEntry]);
      toast.success(`${course.code} scheduled for ${addDay} at ${formatTime(addStart)}.`);
      setAddOpen(false);
      resetDialog();
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save schedule');
    }
    setSaving(false);
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  async function handleDelete(entry: GridEntry) {
    const course = courses.find(c => c.id === entry.courseId);
    if (!course) return;
    const newSchedule = course.schedule.filter((_, i) => i !== entry.slotIndex);
    setSaving(true);
    try {
      await timetableService.updateSchedule(entry.courseId, newSchedule);
      toast.success(`Removed ${entry.courseCode} from ${entry.day} ${formatTime(entry.startTime)}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove entry');
    }
    setSaving(false);
  }

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Timetable Management</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground">
              Set class schedules — students and lecturers see these automatically
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Class
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {[100, 200, 300, 400, 500].map(l => (
                <SelectItem key={l} value={String(l)}>{l} Level</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="outline" className="py-2 px-3">
            {filtered.length} class{filtered.length !== 1 ? 'es' : ''} scheduled
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-200 inline-block" /> Physical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" /> Online
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Grid */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDept === 'all' ? 'All Departments' : selectedDept}
                  {selectedLevel !== 'all' && ` — ${selectedLevel} Level`}
                </CardTitle>
                <CardDescription>Click an empty cell to quickly add a class there.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Header */}
                  <div className="grid grid-cols-[90px_repeat(5,1fr)] gap-1 mb-1">
                    <div className="p-2 text-xs font-medium text-muted-foreground text-center">Time</div>
                    {DAYS.map(day => (
                      <div key={day} className="p-2 text-xs font-semibold text-center bg-muted rounded-t-lg">
                        {day}
                      </div>
                    ))}
                  </div>

                  {TIME_SLOTS.map(time => (
                    <div key={time} className="grid grid-cols-[90px_repeat(5,1fr)] gap-1 mb-1">
                      <div className="p-2 text-xs font-medium text-muted-foreground flex items-center justify-center">
                        {formatTime(time)}
                      </div>
                      {DAYS.map(day => {
                        const entry = getEntry(day, time);
                        if (!entry) return (
                          <div
                            key={`${day}-${time}`}
                            className="p-2 rounded-lg border border-dashed border-border min-h-[72px] hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => { setAddDay(day); setAddStart(time); setAddOpen(true); }}
                          />
                        );

                        const isOnline = entry.classType === 'online';
                        return (
                          <div
                            key={`${day}-${time}`}
                            className={`group p-2 rounded-lg min-h-[72px] text-xs space-y-0.5 relative ${
                              isOnline
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            }`}
                          >
                            <p className="font-bold truncate">{entry.courseCode}</p>
                            <p className="text-muted-foreground truncate leading-tight">{entry.courseTitle}</p>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              {isOnline
                                ? <Video className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                : <MapPin className="h-3 w-3 text-green-600 flex-shrink-0" />}
                              <span className="truncate">{isOnline ? 'Online' : entry.venue}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1 ${isOnline ? 'border-blue-300 text-blue-700' : 'border-green-300 text-green-700'}`}
                              >
                                {isOnline ? 'Online' : 'Physical'}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] px-1">{entry.level}L</Badge>
                            </div>

                            <button
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-destructive/80 text-white"
                              onClick={() => handleDelete(entry)}
                              disabled={saving}
                              title="Remove"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* List view */}
            <Card>
              <CardHeader>
                <CardTitle>All Scheduled Classes</CardTitle>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <EmptyState title="No classes scheduled" description="Click 'Add Class' or an empty grid cell to get started." />
                ) : (
                  <div className="space-y-2">
                    {[...filtered]
                      .sort((a, b) => DAYS.indexOf(a.day as any) - DAYS.indexOf(b.day as any) || a.startTime.localeCompare(b.startTime))
                      .map((entry, i) => {
                        const isOnline = entry.classType === 'online';
                        return (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isOnline ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                              }`}>
                                {isOnline
                                  ? <Video className="h-5 w-5 text-blue-600" />
                                  : <MapPin className="h-5 w-5 text-green-600" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{entry.courseCode} — {entry.courseTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.day} · {formatTime(entry.startTime)}–{formatTime(entry.endTime)} · {entry.lecturerName}
                                  {isOnline ? ' · Online' : ` · ${entry.venue}`}
                                </p>
                                {isOnline && entry.zoomLink && (
                                  
                                    href={entry.zoomLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    {entry.zoomLink}
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${isOnline ? 'text-blue-600 border-blue-200' : 'text-green-600 border-green-200'}`}>
                                {isOnline ? 'Online' : 'Physical'}
                              </Badge>
                              <Badge variant="outline">{entry.level}L</Badge>
                              <Button variant="outline" size="sm" disabled={saving} onClick={() => handleDelete(entry)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Add Class Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { if (!v) { setAddOpen(false); resetDialog(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Class to Timetable</DialogTitle>
            <DialogDescription>
              Select a course, set its schedule, and choose online or physical.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Course */}
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={addCourseId} onValueChange={setAddCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {dialogCourses.length === 0
                    ? <SelectItem value="_none" disabled>No courses found</SelectItem>
                    : dialogCourses.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} — {c.title} ({c.level}L)
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Class type — prominent toggle */}
            <div className="space-y-2">
              <Label>Class Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAddClassType('physical')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    addClassType === 'physical'
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <MapPin className="h-4 w-4" /> Physical
                </button>
                <button
                  type="button"
                  onClick={() => setAddClassType('online')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    addClassType === 'online'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <Video className="h-4 w-4" /> Online
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Day */}
              <div className="space-y-2">
                <Label>Day</Label>
                <Select value={addDay} onValueChange={setAddDay}>
                  <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Venue or Zoom */}
              {addClassType === 'physical' ? (
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input
                    placeholder="e.g. LT1, Lab 2"
                    value={addVenue}
                    onChange={e => setAddVenue(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Zoom Link</Label>
                  <Input
                    placeholder="https://zoom.us/j/..."
                    value={addZoomLink}
                    onChange={e => setAddZoomLink(e.target.value)}
                  />
                </div>
              )}

              {/* Start */}
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select value={addStart} onValueChange={setAddStart}>
                  <SelectTrigger><SelectValue placeholder="Start" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => (
                      <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* End */}
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select value={addEnd} onValueChange={setAddEnd}>
                  <SelectTrigger><SelectValue placeholder="End" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.filter(t => t > addStart).map(t => (
                      <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); resetDialog(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving || !addCourseId || !addDay || !addStart || !addEnd}
            >
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <PlusCircle className="h-4 w-4 mr-2" />}
              {saving ? 'Saving…' : 'Add to Timetable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}