import { useState, useEffect, useRef } from 'react';
import {
  Clock, CheckCircle, AlertCircle, Upload, Loader2, FileText
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { studentNavItems } from '@/constants/studentNav';
import { assignmentService } from '@/services/assignment.service';

const navItems = studentNavItems;

interface AssignmentWithSubmission {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number | null;
  course_title: string;
  course_code: string;
  submission: {
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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.getStudentAssignments();
      const list: any[] = res.data?.data ?? [];
      setAssignments(list.map((a) => {
        const sub = a.mySubmission;
        return {
          id: a._id ?? a.id,
          title: a.title,
          description: a.description ?? null,
          due_date: a.dueDate,
          max_score: a.totalMarks ?? 100,
          course_title: a.course?.title ?? 'Unknown',
          course_code: a.course?.code ?? '',
          submission: sub ? {
            status: sub.score != null ? 'graded' : 'submitted',
            score: sub.score ?? null,
            feedback: sub.feedback ?? null,
            file_url: sub.fileUrl ?? sub.file_url ?? null,
            submitted_at: sub.submittedAt ?? sub.submitted_at ?? null,
          } : null,
        };
      }));
    } catch (err: any) {
      toast({ title: 'Failed to load assignments', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSubmit = async (assignmentId: string) => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast({ title: 'File required', description: 'Please attach a file to submit.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(assignmentId, file);
      toast({ title: 'Submitted successfully!' });
      setSubmitDialog(null);
      fetchAssignments();
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
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
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
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
                    {a.submission?.file_url && (
                      <Button variant="outline" asChild>
                        <a href={a.submission.file_url} target="_blank" rel="noreferrer">View Submission</a>
                      </Button>
                    )}
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
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={!!submitDialog} onOpenChange={() => setSubmitDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Attach File</label>
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
