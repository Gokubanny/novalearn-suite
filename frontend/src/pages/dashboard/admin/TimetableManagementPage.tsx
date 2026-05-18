import { useState } from 'react';
import {
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Calendar, PlusCircle, Clock, MapPin, Monitor, Hash, ChevronLeft, ChevronRight, Trash2, Bell
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Matric Config', href: '/dashboard/admin/matric-config', icon: Hash },
  { name: 'Timetable', href: '/dashboard/admin/timetable', icon: Calendar },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

interface TimetableEntry {
  id: number;
  day: string;
  time: string;
  course: string;
  courseCode: string;
  lecturer: string;
  venue: string;
  type: 'physical' | 'online';
  level: string;
  department: string;
}

const sampleEntries: TimetableEntry[] = [
  { id: 1, day: 'Monday', time: '08:00', course: 'Intro to CS', courseCode: 'CSC101', lecturer: 'Dr. Adebayo', venue: 'LT1', type: 'physical', level: '100', department: 'Computer Science' },
  { id: 2, day: 'Monday', time: '10:00', course: 'Calculus I', courseCode: 'MTH101', lecturer: 'Prof. Okonkwo', venue: 'LT3', type: 'physical', level: '100', department: 'Computer Science' },
  { id: 3, day: 'Tuesday', time: '09:00', course: 'Data Structures', courseCode: 'CSC201', lecturer: 'Dr. Eze', venue: 'Online', type: 'online', level: '200', department: 'Computer Science' },
  { id: 4, day: 'Wednesday', time: '11:00', course: 'Web Development', courseCode: 'CSC301', lecturer: 'Dr. Adebayo', venue: 'Lab 2', type: 'physical', level: '300', department: 'Computer Science' },
  { id: 5, day: 'Thursday', time: '08:00', course: 'Database Systems', courseCode: 'CSC401', lecturer: 'Prof. Nnamdi', venue: 'LT2', type: 'physical', level: '400', department: 'Computer Science' },
  { id: 6, day: 'Friday', time: '14:00', course: 'AI Fundamentals', courseCode: 'CSC402', lecturer: 'Dr. Fatima', venue: 'Online', type: 'online', level: '400', department: 'Computer Science' },
  { id: 7, day: 'Monday', time: '09:00', course: 'Business Law', courseCode: 'BUS201', lecturer: 'Dr. Abubakar', venue: 'LT5', type: 'physical', level: '200', department: 'Business Administration' },
  { id: 8, day: 'Wednesday', time: '08:00', course: 'Accounting 101', courseCode: 'BUS101', lecturer: 'Mrs. Ibrahim', venue: 'LT4', type: 'physical', level: '100', department: 'Business Administration' },
];

export default function TimetableManagementPage() {
  const [selectedDept, setSelectedDept] = useState('Computer Science');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filtered = sampleEntries.filter(e =>
    e.department === selectedDept && (selectedLevel === 'all' || e.level === selectedLevel)
  );

  const getEntry = (day: string, time: string) => filtered.find(e => e.day === day && e.time === time);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Timetable Management</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground">Create and manage class schedules per department and level</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button><PlusCircle className="h-4 w-4 mr-2" /> Add Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Timetable Entry</DialogTitle>
                <DialogDescription>Schedule a new class for a department and level</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label>Department</Label>
                  <Select defaultValue="Computer Science">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Business Administration">Business Administration</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select defaultValue="100">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Course</Label>
                  <Input placeholder="e.g. Intro to CS" className="mt-1" />
                </div>
                <div>
                  <Label>Course Code</Label>
                  <Input placeholder="e.g. CSC101" className="mt-1" />
                </div>
                <div>
                  <Label>Day</Label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select day" /></SelectTrigger>
                    <SelectContent>
                      {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time</Label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select time" /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lecturer</Label>
                  <Input placeholder="e.g. Dr. Adebayo" className="mt-1" />
                </div>
                <div>
                  <Label>Venue</Label>
                  <Input placeholder="e.g. LT1 or Online" className="mt-1" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button>Add to Timetable</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Business Administration">Business Administration</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="100">100 Level</SelectItem>
              <SelectItem value="200">200 Level</SelectItem>
              <SelectItem value="300">300 Level</SelectItem>
              <SelectItem value="400">400 Level</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="py-2 px-3">
            {filtered.length} classes scheduled
          </Badge>
        </div>

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedDept} — {selectedLevel === 'all' ? 'All Levels' : `${selectedLevel} Level`}</CardTitle>
            <CardDescription>Weekly class schedule</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1">
                <div className="p-2 text-xs font-medium text-muted-foreground">Time</div>
                {days.map(day => (
                  <div key={day} className="p-2 text-xs font-semibold text-center bg-muted rounded-t-lg">{day}</div>
                ))}
              </div>
              {/* Rows */}
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1">
                  <div className="p-2 text-xs font-medium text-muted-foreground flex items-center">{time}</div>
                  {days.map(day => {
                    const entry = getEntry(day, time);
                    if (!entry) return (
                      <div key={`${day}-${time}`} className="p-2 rounded-lg border border-dashed border-border min-h-[60px] hover:bg-muted/30 transition-colors" />
                    );
                    return (
                      <div
                        key={`${day}-${time}`}
                        className={`p-2 rounded-lg min-h-[60px] text-xs space-y-1 ${
                          entry.type === 'online'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        }`}
                      >
                        <p className="font-semibold truncate">{entry.courseCode}</p>
                        <p className="text-muted-foreground truncate">{entry.course}</p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {entry.type === 'online' ? <Monitor className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          <span>{entry.venue}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{entry.level}L</Badge>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* List View */}
        <Card>
          <CardHeader>
            <CardTitle>All Scheduled Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="space-y-2">
                {filtered.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.type === 'online' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {entry.type === 'online' ? <Monitor className="h-5 w-5 text-blue-600" /> : <MapPin className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entry.courseCode} — {entry.course}</p>
                        <p className="text-xs text-muted-foreground">{entry.day} • {entry.time} • {entry.lecturer} • {entry.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.level}L</Badge>
                      <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Calendar} title="No classes scheduled" description="Add classes to the timetable using the button above." actionLabel="Add Class" onAction={() => {}} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
