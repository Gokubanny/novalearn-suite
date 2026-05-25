import { useState, useEffect, useRef } from 'react';
import {
  Clock, CheckCircle, AlertCircle, Upload,
  Loader2, FileText, ExternalLink, X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { studentNavItems } from '@/constants/studentNav';
import { assignmentService } from '@/services/assignment.service';

const navItems = studentNavItems;

interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  totalMarks: number;
  courseTitle: string;
  courseCode: string;
  isOverdue: boolean;
  attachments: string[];
  submission: {
    status: string;
    score: number | null;
    feedback: string | null;
    fileUrl: string | null;
    submittedAt: string | null;
    isLate: boolean;
  } | null;
}

function formatDue(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Overdue';
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0)  return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return 'Due soon';
}

export default function StudentAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [submitDialog, setSubmitDialog] = useState<AssignmentRow | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAssignments(); }, []);

  async function fetchAssignments() {
    setLoading(true);
    try {
      const res = await assignmentService.getStudentAssignments();
      const list: any[] = res.data?.data ?? [];
      setAssignments(list.map(a => {
        const sub = a.mySubmission;
        return {
          id:          a._id ?? a.id,
          title:       a.title,
          description: a.description ?? null,
          dueDate:     a.dueDate,
          totalMarks:  a.totalMarks ?? 100,
          courseTitle: a.course?.title ?? '',
          courseCode:  a.course?.code  ?? '',
          isOverdue:   a.isOverdue ?? false,
          attachments: a.attachments ?? [],
          submission: sub ? {
            status:      sub.score != null ? 'graded' : sub.status ?? 'submitted',
            score:       sub.score    ?? null,
            feedback:    sub.feedback ?? null,
            fileUrl:     sub.fileUrl  ?? null,
            submittedAt: sub.submittedAt ?? null,
            isLate:      sub.status === 'late',
          } : null,
        };
      }));
    } catch (err: any) {
      toast({ title: 'Failed to load assignments', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!submitDialog || !selectedFile) {
      toast({ title: 'Please attach a file', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(submitDialog.id, selectedFile);
      toast({ title: 'Submitted successfully!' });
      setSubmitDialog(null);
      setSelectedFile(null);
      fetchAssignments();
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  }

  const pending   = assignments.filter(a => !a.submission);
  const submitted = assignments.filter(a => a.submission && a.submission.status !== 'graded');
  const graded    = assignments.filter(a => a.submission?.status === 'graded');

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Assignments</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Track and submit your course assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pending.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Submitted</CardTitle>
              <Upload className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{submitted.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Graded</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{graded.length}</div></CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : assignments.length === 0 ? (
          <Card><CardContent className="pt-6">
            <EmptyState title="No assignments yet" description="Your assignments will appear here once lecturers post them." />
          </CardContent></Card>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
              <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
            </TabsList>

            {/* ── Pending ── */}
            <TabsContent value="pending" className="mt-4 space-y-3">
              {pending.length === 0
                ? <Card><CardContent className="pt-6"><EmptyState title="All caught up!" description="No pending assignments." /></CardContent></Card>
                : pending.map(a => (
                  <Card key={a.id} className={a.isOverdue ? 'border-red-200 dark:border-red-900' : ''}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            a.isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            <FileText className={`h-5 w-5 ${a.isOverdue ? 'text-red-600' : 'text-orange-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{a.title}</h3>
                              {a.isOverdue && (
                                <Badge variant="destructive" className="text-xs">Overdue</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{a.courseCode} — {a.courseTitle}</p>
                            {a.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className={`flex items-center gap-1 ${a.isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                                <AlertCircle className="h-3 w-3" />
                                Due: {formatDue(a.dueDate)}
                              </span>
                              {!a.isOverdue && (
                                <span className="text-orange-600 font-medium">{timeUntil(a.dueDate)}</span>
                              )}
                              <span className="text-muted-foreground">Max: {a.totalMarks} marks</span>
                            </div>
                            {a.attachments.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                {a.attachments.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noreferrer"
                                    className="text-xs text-primary underline flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" />Attachment {i + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => { setSubmitDialog(a); setSelectedFile(null); }}
                          variant={a.isOverdue ? 'destructive' : 'default'}
                        >
                          Submit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </TabsContent>

            {/* ── Submitted ── */}
            <TabsContent value="submitted" className="mt-4 space-y-3">
              {submitted.length === 0
                ? <Card><CardContent className="pt-6"><EmptyState title="No submissions awaiting grading" description="" /></CardContent></Card>
                : submitted.map(a => (
                  <Card key={a.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{a.title}</h3>
                            {a.submission?.isLate && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">Late</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{a.courseCode} — {a.courseTitle}</p>
                          {a.submission?.submittedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted: {new Date(a.submission.submittedAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          )}
                          <p className="text-sm text-blue-600 mt-1 font-medium">Awaiting grade…</p>
                        </div>
                        {a.submission?.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={a.submission.fileUrl} target="_blank" rel="noreferrer" className="gap-1">
                              <ExternalLink className="h-3.5 w-3.5" /> View
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </TabsContent>

            {/* ── Graded ── */}
            <TabsContent value="graded" className="mt-4 space-y-3">
              {graded.length === 0
                ? <Card><CardContent className="pt-6"><EmptyState title="No graded assignments yet" description="" /></CardContent></Card>
                : graded.map(a => {
                  const pct = a.submission?.score != null
                    ? Math.round((a.submission.score / a.totalMarks) * 100) : null;
                  return (
                    <Card key={a.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{a.title}</h3>
                            <p className="text-sm text-muted-foreground">{a.courseCode} — {a.courseTitle}</p>
                            <div className="mt-2 flex items-center gap-3">
                              <span className={`text-lg font-bold ${
                                pct != null && pct >= 70 ? 'text-green-600'
                                : pct != null && pct >= 50 ? 'text-yellow-600'
                                : 'text-red-600'
                              }`}>
                                {a.submission?.score ?? '—'} / {a.totalMarks}
                              </span>
                              {pct != null && (
                                <Badge variant="outline" className={`text-xs ${
                                  pct >= 70 ? 'text-green-700 border-green-200'
                                  : pct >= 50 ? 'text-yellow-700 border-yellow-200'
                                  : 'text-red-700 border-red-200'
                                }`}>
                                  {pct}%
                                </Badge>
                              )}
                            </div>
                            {a.submission?.feedback && (
                              <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Lecturer feedback:</p>
                                <p>{a.submission.feedback}</p>
                              </div>
                            )}
                          </div>
                          {a.submission?.fileUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={a.submission.fileUrl} target="_blank" rel="noreferrer" className="gap-1">
                                <ExternalLink className="h-3.5 w-3.5" /> View
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              }
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Submit Dialog */}
      <Dialog open={!!submitDialog} onOpenChange={v => { if (!v) { setSubmitDialog(null); setSelectedFile(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {submitDialog?.title} — {submitDialog?.courseCode}
              {submitDialog?.isOverdue && (
                <span className="ml-2 text-red-600 font-medium">(Submission will be marked late)</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {submitDialog?.description && (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {submitDialog.description}
              </div>
            )}

            {/* File drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                selectedFile ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
              onClick={() => fileRef.current?.click()}
            >
              {selectedFile ? (
                <div className="space-y-1">
                  <FileText className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                  >
                    <X className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium">Click to attach your file</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, ZIP, images — any format</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialog(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !selectedFile}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {submitting ? 'Submitting…' : 'Submit Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}