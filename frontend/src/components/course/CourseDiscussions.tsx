import { useEffect, useState } from 'react';
import { MessageSquare, Loader2, Pin, PinOff, Send, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { discussionService } from '@/services/discussion.service';

interface Reply {
  _id?: string;
  body: string;
  createdAt: string;
  author?: { firstName?: string; lastName?: string; role?: string };
}

interface Discussion {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  author?: { firstName?: string; lastName?: string; role?: string };
  replies: Reply[];
}

interface CourseDiscussionsProps {
  courseId: string;
  courseName: string;
}

export function CourseDiscussions({ courseId, courseName }: CourseDiscussionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const canModerate = user?.role === 'lecturer' || user?.role === 'school_admin';

  const load = async () => {
    setLoading(true);
    try {
      const res = await discussionService.list(courseId);
      const list: any[] = res.data?.data ?? [];
      setDiscussions(list.map((d) => ({ ...d, id: d._id ?? d.id, replies: d.replies ?? [] })));
    } catch (e: any) {
      toast({ title: 'Failed to load discussions', description: e.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId]);

  const handleCreate = async () => {
    if (!title || !body) return;
    setBusy(true);
    try {
      await discussionService.create(courseId, { title, body });
      toast({ title: 'Topic posted' });
      setOpen(false); setTitle(''); setBody('');
      load();
    } catch (e: any) {
      toast({ title: 'Could not post', description: e.message, variant: 'destructive' });
    }
    setBusy(false);
  };

  const handleReply = async (id: string) => {
    const text = (replyDrafts[id] || '').trim();
    if (!text) return;
    try {
      await discussionService.reply(id, text);
      setReplyDrafts((p) => ({ ...p, [id]: '' }));
      load();
    } catch (e: any) {
      toast({ title: 'Reply failed', description: e.message, variant: 'destructive' });
    }
  };

  const handlePin = async (id: string) => {
    try {
      await discussionService.togglePin(id);
      load();
    } catch (e: any) {
      toast({ title: 'Pin failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discussion?')) return;
    try {
      await discussionService.remove(id);
      setDiscussions((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const authorName = (a?: { firstName?: string; lastName?: string }) =>
    [a?.firstName, a?.lastName].filter(Boolean).join(' ') || 'User';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Discussions</CardTitle>
          <CardDescription>{courseName}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Topic</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
              <DialogDescription>Ask a question or share an idea with the class.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : discussions.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No discussions yet" description="Start the first topic for this course." />
        ) : (
          <div className="space-y-4">
            {discussions.map((d) => (
              <div key={d.id} className={`rounded-lg border p-4 ${d.pinned ? 'bg-primary/5 border-primary/30' : 'bg-background'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{d.title}</h3>
                      {d.pinned && <Badge variant="secondary" className="gap-1"><Pin className="h-3 w-3" /> Pinned</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {authorName(d.author)} · {new Date(d.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{d.body}</p>
                  </div>
                  <div className="flex gap-1">
                    {canModerate && (
                      <Button size="icon" variant="ghost" onClick={() => handlePin(d.id)} title={d.pinned ? 'Unpin' : 'Pin'}>
                        {d.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                    )}
                    {canModerate && (
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>

                {d.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-l-2 border-muted pl-3">
                    {d.replies.map((r, i) => (
                      <div key={r._id ?? i} className="text-sm">
                        <p className="text-xs text-muted-foreground">
                          {authorName(r.author)} · {new Date(r.createdAt).toLocaleString()}
                        </p>
                        <p className="whitespace-pre-wrap">{r.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Write a reply…"
                    value={replyDrafts[d.id] || ''}
                    onChange={(e) => setReplyDrafts((p) => ({ ...p, [d.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleReply(d.id); }}
                  />
                  <Button size="sm" onClick={() => handleReply(d.id)} className="gap-1">
                    <Send className="h-3 w-3" /> Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
