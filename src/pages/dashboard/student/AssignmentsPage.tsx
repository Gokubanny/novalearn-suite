import { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, Calendar, FileText, Trophy, MessageSquare,
  Clock, CheckCircle, AlertCircle, Upload, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Grades', href: '/dashboard/student/grades', icon: Trophy },
  { name: 'Messages', href: '/dashboard/student/messages', icon: MessageSquare },
];

interface AssignmentWithSubmission {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number | null;
  course_title: string;
  course_code: string;
  submission: {
    id: string;
    status: string | null;
    score: number | null;
    feedback: string | null;
    file_url: string | null;
    submitted_at: string | null;
  } | null;
}

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitDialog, setSubmitDialog] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);

    // Get enrolled course IDs
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id);

    if (!enrollments || enrollments.length === 0) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);

    // Get published assignments for enrolled courses
    const { data: assignmentsData } = await supabase
      .from('assignments')
      .select('*, course:courses!assignments_course_id_fkey(title, code)')
      .in('course_id', courseIds)
      .eq('is_published', true)
      .order('due_date', { ascending: true });

    if (!assignmentsData) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    // Get submissions for these assignments
    const assignmentIds = assignmentsData.map(a => a.id);
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', user.id)
      .in('assignment_id', assignmentIds);

    const submissionMap = new Map(submissions?.map(s => [s.assignment_id, s]) ?? []);

    const enriched: AssignmentWithSubmission[] = assignmentsData.map(a => {
      const sub = submissionMap.get(a.id);
      const course = a.course as { title: string; code: string } | null;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        due_date: a.due_date,
        max_score: a.max_score,
        course_title: course?.title ?? 'Unknown',
        course_code: course?.code ?? '',
        submission: sub ? {
          id: sub.id,
          status: sub.status,
          score: sub.score,
          feedback: sub.feedback,
          file_url: sub.file_url,
          submitted_at: sub.submitted_at,
        } : null,
      };
    });

    setAssignments(enriched);
    setLoading(false);
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!user) return;
    setSubmitting(true);

    let fileUrl: string | null = null;
    const file = fileRef.current?.files?.[0];

    if (file) {
      const filePath = `${user.id}/${assignmentId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      fileUrl = filePath;
    }

    const { error } = await supabase.from('submissions').insert({
      assignment_id: assignmentId,
      student_id: user.id,
      content: content || null,
      file_url: fileUrl,
      status: 'submitted',
    });

    if (error) {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Submitted successfully!' });
      setSubmitDialog(null);
      setContent('');
      fetchAssignments();
    }
    setSubmitting(false);
  };

  const getStatus = (a: AssignmentWithSubmission) => {
    if (a.submission?.status === 'graded') return 'graded';
    if (a.submission) return 'submitted';
    return 'pending';
  };

  const pending = assignments.filter(a => getStatus(a) === 'pending');
  const submitted = assignments.filter(a => getStatus(a) === 'submitted');
  const graded = assignments.filter(a => getStatus(a) === 'graded');

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Track and submit your assignments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pending.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
              <Upload className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{submitted.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{graded.length}</div></CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState title="No assignments" description="You have no assignments yet." icon={FileText} />
        ) : (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
              <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pending.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{a.course_title} ({a.course_code})</p>
                        <span className="text-sm text-orange-600 flex items-center gap-1 mt-2">
                          <AlertCircle className="h-3 w-3" />
                          Due: {new Date(a.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => setSubmitDialog(a.id)}>Submit</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {submitted.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{a.course_title}</p>
                        <p className="text-sm text-blue-600 mt-2">Awaiting grade</p>
                      </div>
                    </div>
                    <Button variant="outline">View Submission</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="graded" className="space-y-4">
              {graded.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{a.course_title}</p>
                        <p className="text-sm text-green-600 font-medium mt-2">
                          Grade: {a.submission?.score ?? '-'}/{a.max_score ?? 100}
                        </p>
                        {a.submission?.feedback && (
                          <p className="text-sm text-muted-foreground mt-1">Feedback: {a.submission.feedback}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline">View Feedback</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Submit Dialog */}
      <Dialog open={!!submitDialog} onOpenChange={() => { setSubmitDialog(null); setContent(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes or content (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium">Attach File (optional)</label>
              <input ref={fileRef} type="file" className="mt-1 block w-full text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialog(null)}>Cancel</Button>
            <Button onClick={() => submitDialog && handleSubmit(submitDialog)} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
