import { useState, useEffect } from 'react';
import { MessageSquare, Pin, Send, Reply, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Discussion {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  author: { first_name: string; last_name: string } | null;
  reply_count: number;
}

interface DiscussionReply {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: { first_name: string; last_name: string } | null;
}

interface CourseDiscussionsProps {
  courseId: string;
  courseName: string;
}

export function CourseDiscussions({ courseId, courseName }: CourseDiscussionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  // Reply state
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('discussions')
      .select('id, title, content, is_pinned, created_at, author:profiles!discussions_author_id_fkey(first_name, last_name)')
      .eq('course_id', courseId)
      .is('parent_id', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      const withCounts = await Promise.all(
        data.map(async (d) => {
          const { count } = await supabase
            .from('discussions')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', d.id);
          return {
            ...d,
            author: d.author as { first_name: string; last_name: string } | null,
            reply_count: count ?? 0,
          };
        })
      );
      setDiscussions(withCounts);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setCreating(true);

    const { error } = await supabase.from('discussions').insert({
      course_id: courseId,
      title: newTitle.trim(),
      content: newContent.trim(),
      author_id: user.id,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Posted', description: 'Discussion created successfully.' });
      setNewTitle('');
      setNewContent('');
      setCreateOpen(false);
      fetchDiscussions();
    }
    setCreating(false);
  };

  const openThread = async (discussionId: string) => {
    setActiveThread(discussionId);
    setRepliesLoading(true);
    const { data } = await supabase
      .from('discussions')
      .select('id, title, content, created_at, author:profiles!discussions_author_id_fkey(first_name, last_name)')
      .eq('parent_id', discussionId)
      .order('created_at', { ascending: true });

    setReplies(
      (data || []).map((r) => ({
        ...r,
        author: r.author as { first_name: string; last_name: string } | null,
      }))
    );
    setRepliesLoading(false);
  };

  const handleReply = async () => {
    if (!user || !activeThread || !replyContent.trim()) return;
    setSubmittingReply(true);

    const { error } = await supabase.from('discussions').insert({
      course_id: courseId,
      parent_id: activeThread,
      title: 'Re: reply',
      content: replyContent.trim(),
      author_id: user.id,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setReplyContent('');
      openThread(activeThread);
      fetchDiscussions();
    }
    setSubmittingReply(false);
  };

  const activeDiscussion = discussions.find((d) => d.id === activeThread);

  if (activeThread && activeDiscussion) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveThread(null)}>
          ← Back to discussions
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-2">
              {activeDiscussion.is_pinned && <Pin className="h-4 w-4 text-primary mt-1" />}
              <div>
                <CardTitle className="text-lg">{activeDiscussion.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {activeDiscussion.author?.first_name} {activeDiscussion.author?.last_name} ·{' '}
                  {format(new Date(activeDiscussion.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{activeDiscussion.content}</p>
          </CardContent>
        </Card>

        <Separator />

        <h3 className="font-semibold text-sm text-muted-foreground">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>

        {repliesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <Card key={reply.id} className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium">
                    {reply.author?.first_name} {reply.author?.last_name}
                    <span className="text-muted-foreground font-normal ml-2">
                      {format(new Date(reply.created_at), 'MMM d, h:mm a')}
                    </span>
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{reply.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleReply} disabled={submittingReply || !replyContent.trim()}>
            {submittingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Discussions – {courseName}</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-2" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Discussion title" />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="What's on your mind?" rows={5} />
              </div>
              <Button onClick={handleCreate} disabled={creating || !newTitle.trim() || !newContent.trim()} className="w-full">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Post Discussion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : discussions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No discussions yet. Start the conversation!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {discussions.map((d) => (
            <Card
              key={d.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openThread(d.id)}
            >
              <CardContent className="py-4 flex items-start justify-between">
                <div className="flex items-start gap-2 min-w-0">
                  {d.is_pinned && <Pin className="h-4 w-4 text-primary mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{d.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.author?.first_name} {d.author?.last_name} · {format(new Date(d.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 ml-2">
                  <Reply className="h-3 w-3 mr-1" /> {d.reply_count}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
