import { useState } from 'react';
import {
  Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, User,
  Camera, Scan, Shield, AlertTriangle, RefreshCw, Wifi, WifiOff, UserCheck, UserX, Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/lecturer/attendance', icon: CheckCircle },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/lecturer/results', icon: BarChart3 },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Schedule', href: '/dashboard/lecturer/schedule', icon: Calendar },
  { name: 'Profile', href: '/dashboard/lecturer/profile', icon: User },
];

const detectedStudents = [
  { id: 1, name: 'Adebayo Oluwaseun', matric: 'NEX/CSC/2024/001', confidence: 98.5, time: '09:01:23', status: 'verified' },
  { id: 2, name: 'Chinwe Okafor', matric: 'NEX/CSC/2024/002', confidence: 95.2, time: '09:01:45', status: 'verified' },
  { id: 3, name: 'Fatima Abdullahi', matric: 'NEX/CSC/2024/004', confidence: 92.8, time: '09:02:10', status: 'verified' },
  { id: 4, name: 'Grace Adeyemi', matric: 'NEX/CSC/2024/006', confidence: 97.1, time: '09:02:33', status: 'verified' },
  { id: 5, name: 'Yusuf Bello', matric: 'NEX/CSC/2024/007', confidence: 78.4, time: '09:03:01', status: 'low_confidence' },
  { id: 6, name: 'Blessing Eze', matric: 'NEX/CSC/2024/008', confidence: 94.6, time: '09:03:22', status: 'verified' },
];

const undetectedStudents = [
  { id: 7, name: 'Ibrahim Musa', matric: 'NEX/CSC/2024/003' },
  { id: 8, name: 'Emeka Nwankwo', matric: 'NEX/CSC/2024/005' },
];

export default function FacialRecognitionPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / Attendance / <span className="text-foreground font-medium">Facial Recognition</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">AI Facial Recognition Attendance</h1>
            <p className="text-muted-foreground">Automated attendance using facial recognition technology</p>
          </div>
          <Select defaultValue="cs101">
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs101">CS101 - Intro to Computer Science</SelectItem>
              <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
              <SelectItem value="web101">WEB101 - Web Development</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Detected</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{detectedStudents.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
              <UserX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{undetectedStudents.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Confidence</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(detectedStudents.reduce((a, s) => a + s.confidence, 0) / detectedStudents.length).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Camera</CardTitle>
              {isScanning ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <Badge variant={isScanning ? 'default' : 'secondary'}>{isScanning ? 'Live' : 'Offline'}</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" /> Camera Feed
                  </CardTitle>
                  <CardDescription>AI-powered facial recognition with real-time detection</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsScanning(false)}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Reset
                  </Button>
                  <Button onClick={() => setIsScanning(!isScanning)} variant={isScanning ? 'destructive' : 'default'}>
                    {isScanning ? 'Stop' : <><Scan className="h-4 w-4 mr-2" /> Start Scanning</>}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl relative overflow-hidden border-2 border-dashed border-border">
                {isScanning && (
                  <motion.div
                    className="absolute inset-0 bg-primary/5"
                    animate={{ opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                {/* Simulated face detection boxes */}
                <AnimatePresence>
                  {isScanning && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-[15%] left-[20%] w-24 h-28 border-2 border-green-500 rounded-lg"
                      >
                        <div className="absolute -bottom-6 left-0 right-0 bg-green-500 text-white text-[10px] text-center py-0.5 rounded">
                          Adebayo O. • 98.5%
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-[20%] right-[25%] w-24 h-28 border-2 border-green-500 rounded-lg"
                      >
                        <div className="absolute -bottom-6 left-0 right-0 bg-green-500 text-white text-[10px] text-center py-0.5 rounded">
                          Chinwe O. • 95.2%
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="absolute bottom-[25%] left-[35%] w-24 h-28 border-2 border-yellow-500 rounded-lg"
                      >
                        <div className="absolute -bottom-6 left-0 right-0 bg-yellow-500 text-white text-[10px] text-center py-0.5 rounded">
                          Yusuf B. • 78.4%
                        </div>
                      </motion.div>
                      {/* Scanning line */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-primary/60"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                    </>
                  )}
                </AnimatePresence>
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Camera className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Camera feed will appear here</p>
                    <p className="text-sm text-muted-foreground">Click "Start Scanning" to begin</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={autoSubmit} onCheckedChange={setAutoSubmit} />
                    <span className="text-sm">Auto-submit after scan</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Detection threshold: 85%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detected Students Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recognised Students</CardTitle>
                <CardDescription>{detectedStudents.length}/{detectedStudents.length + undetectedStudents.length} detected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {detectedStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      student.confidence >= 90 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      <UserCheck className={`h-4 w-4 ${student.confidence >= 90 ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.matric}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={student.confidence >= 90 ? 'default' : 'secondary'} className="text-xs">
                        {student.confidence}%
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{student.time}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Low Confidence / Manual Override */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Needs Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {detectedStudents.filter(s => s.confidence < 90).map(student => (
                  <div key={student.id} className="flex items-center justify-between p-2 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">Confidence: {student.confidence}%</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Reject</Button>
                      <Button size="sm" className="h-7 text-xs">Confirm</Button>
                    </div>
                  </div>
                ))}
                {detectedStudents.filter(s => s.confidence < 90).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">All clear — no low-confidence detections</p>
                )}
              </CardContent>
            </Card>

            {/* Absent */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserX className="h-4 w-4 text-destructive" />
                  Not Detected ({undetectedStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {undetectedStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.matric}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Mark Present</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Save as Draft</Button>
          <Button>Submit Attendance</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
