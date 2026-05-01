import { useState } from 'react';
import {
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Hash, Save, PlusCircle, Trash2, Eye, Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/dashboard/EmptyState';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Matric Config', href: '/dashboard/admin/matric-config', icon: Hash },
  { name: 'Timetable', href: '/dashboard/admin/timetable', icon: BarChart3 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

interface MatricFormat {
  id: number;
  department: string;
  deptCode: string;
  prefix: string;
  separator: string;
  yearFormat: 'full' | 'short';
  sequenceDigits: number;
  example: string;
}

const initialFormats: MatricFormat[] = [
  { id: 1, department: 'Computer Science', deptCode: 'CSC', prefix: 'NEX', separator: '/', yearFormat: 'full', sequenceDigits: 3, example: 'NEX/CSC/2026/001' },
  { id: 2, department: 'Business Administration', deptCode: 'BUS', prefix: 'NEX', separator: '/', yearFormat: 'full', sequenceDigits: 3, example: 'NEX/BUS/2026/001' },
  { id: 3, department: 'Engineering', deptCode: 'ENG', prefix: 'NEX', separator: '/', yearFormat: 'full', sequenceDigits: 3, example: 'NEX/ENG/2026/001' },
  { id: 4, department: 'Medicine', deptCode: 'MED', prefix: 'NEX', separator: '/', yearFormat: 'full', sequenceDigits: 4, example: 'NEX/MED/2026/0001' },
  { id: 5, department: 'Law', deptCode: 'LAW', prefix: 'NEX', separator: '/', yearFormat: 'short', sequenceDigits: 3, example: 'NEX/LAW/26/001' },
];

function generateExample(prefix: string, deptCode: string, separator: string, yearFormat: 'full' | 'short', digits: number) {
  const year = yearFormat === 'full' ? '2026' : '26';
  const seq = '1'.padStart(digits, '0');
  return `${prefix}${separator}${deptCode}${separator}${year}${separator}${seq}`;
}

export default function MatricConfigPage() {
  const [formats, setFormats] = useState(initialFormats);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Matriculation Number Configuration</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Matriculation Number Format</h1>
            <p className="text-muted-foreground">Configure the matric number style for each department</p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Department Format
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-4">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">How Matric Numbers Work</p>
              <p className="text-sm text-muted-foreground">
                Each department has a unique format: <strong>PREFIX/DEPT_CODE/YEAR/SEQUENCE</strong>. 
                New students are automatically assigned the next number in the sequence upon approval.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Format Cards */}
        <div className="space-y-4">
          {formats.map((fmt) => (
            <Card key={fmt.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{fmt.deptCode}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{fmt.department}</p>
                      <p className="text-sm text-muted-foreground">Department Code: {fmt.deptCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Preview</p>
                      <Badge variant="outline" className="font-mono text-sm px-3 py-1">{fmt.example}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === fmt.id ? null : fmt.id)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {editingId === fmt.id && (
                  <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-xs">Prefix</Label>
                      <Input defaultValue={fmt.prefix} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Dept Code</Label>
                      <Input defaultValue={fmt.deptCode} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Separator</Label>
                      <Select defaultValue={fmt.separator}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/">/</SelectItem>
                          <SelectItem value="-">-</SelectItem>
                          <SelectItem value=".">.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Year Format</Label>
                      <Select defaultValue={fmt.yearFormat}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full (2026)</SelectItem>
                          <SelectItem value="short">Short (26)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Sequence Digits</Label>
                      <Select defaultValue={String(fmt.sequenceDigits)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 digits (001)</SelectItem>
                          <SelectItem value="4">4 digits (0001)</SelectItem>
                          <SelectItem value="5">5 digits (00001)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-5 flex justify-end">
                      <Button size="sm"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
