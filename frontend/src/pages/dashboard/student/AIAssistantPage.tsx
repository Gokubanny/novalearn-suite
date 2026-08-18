import { useState, useRef, useEffect, Fragment } from 'react';
import {
  Brain, Send, Sparkles, Loader2, Upload, X,
  FileText, MessageSquare, List, Trash2, Clock,
  Plus, Menu, ChevronLeft, Settings, BookOpen, Star, Sliders
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { studentNavItems } from '@/constants/studentNav';
import { aiService, PdfSession, UserPreferences } from '@/services/ai.service';
import { useToast } from '@/hooks/use-toast';

const navItems = studentNavItems;

// ── Types ─────────────────────────────────────────────────────────────────────
type Msg = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

interface ChatSession {
  id: string;
  title: string;
  type: 'general' | 'pdf';
  pdfId?: string;
  pdfs?: Array<{ name: string; size: number }>;
  createdAt: string;
  updatedAt: string;
  messages: Msg[];
}

interface GeneratedQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  explanation: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateLabel(ts: string): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatChatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

const WELCOME_MESSAGE = "Hello! I'm NexFord AI, I can help you with coursework, explain concepts, and answer academic questions. How can I help you today?";

// ── Preferences Dialog ────────────────────────────────────────────────────────
function PreferencesDialog({ open, onOpenChange, onPreferencesSaved }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onPreferencesSaved: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (open) {
      loadPreferences();
    }
  }, [open]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const res = await aiService.getUserPreferences();
      setPreferences(res.data?.data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      await aiService.updateUserPreferences(preferences);
      toast({ title: 'Preferences saved', description: 'Your AI preferences have been updated.' });
      onPreferencesSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> AI Preferences
          </DialogTitle>
          <DialogDescription>
            Customize how the AI responds to you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4" /> Difficulty Preference
            </Label>
            <Select
              value={preferences?.learningStyle?.difficultyPreference || 'medium'}
              onValueChange={(val) => setPreferences(prev => ({
                ...prev!,
                learningStyle: { ...prev!.learningStyle, difficultyPreference: val as any }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (Simplified explanations)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="hard">Hard (Advanced, detailed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Explanation Detail
            </Label>
            <Select
              value={preferences?.learningStyle?.explanationDetail || 'detailed'}
              onValueChange={(val) => setPreferences(prev => ({
                ...prev!,
                learningStyle: { ...prev!.learningStyle, explanationDetail: val as any }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise (Short answers)</SelectItem>
                <SelectItem value="detailed">Detailed (Thorough explanations)</SelectItem>
                <SelectItem value="comprehensive">Comprehensive (In-depth with examples)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sliders className="h-4 w-4" /> Response Creativity
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[preferences?.aiSettings?.responseTemperature || 0.5]}
                onValueChange={(val) => setPreferences(prev => ({
                  ...prev!,
                  aiSettings: { ...prev!.aiSettings, responseTemperature: val[0] }
                }))}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm w-12">
                {preferences?.aiSettings?.responseTemperature === 0 ? 'Precise' :
                 preferences?.aiSettings?.responseTemperature === 1 ? 'Creative' : 'Balanced'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Context Length (messages to remember)</Label>
            <Select
              value={String(preferences?.aiSettings?.contextLength || 15)}
              onValueChange={(val) => setPreferences(prev => ({
                ...prev!,
                aiSettings: { ...prev!.aiSettings, contextLength: parseInt(val) }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 messages</SelectItem>
                <SelectItem value="10">10 messages</SelectItem>
                <SelectItem value="15">15 messages</SelectItem>
                <SelectItem value="20">20 messages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Study Reminders</Label>
            <Switch
              checked={preferences?.learningStyle?.studyReminders || false}
              onCheckedChange={(val) => setPreferences(prev => ({
                ...prev!,
                learningStyle: { ...prev!.learningStyle, studyReminders: val }
              }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── PDF Upload Dialog ─────────────────────────────────────────────────────────
function PdfUploadDialog({ open, onOpenChange, onUpload }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[], title: string) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 3) {
      toast({ title: 'Maximum 3 PDFs', description: 'You can upload up to 3 PDFs per chat.', variant: 'destructive' });
      return;
    }
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    await onUpload(files, title || files[0].name.replace('.pdf', ''));
    setFiles([]);
    setTitle('');
    setUploading(false);
    onOpenChange(false);
  };

  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Upload PDFs
          </DialogTitle>
          <DialogDescription>
            Upload up to 3 PDFs to create a new chat session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Chat Title (optional)</Label>
            <Input
              placeholder="e.g., Computer Science Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => document.getElementById('pdf-upload-input')?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">Click to select PDF files</p>
            <p className="text-xs text-muted-foreground">Max 20MB per file, up to 3 files</p>
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length}/3)</Label>
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Sidebar Component ─────────────────────────────────────────────────────────
function ChatSidebar({
  generalSessions,
  pdfSessions,
  currentSessionId,
  onNewChat,
  onNewPdfChat,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onToggle,
  onOpenPreferences,
}: {
  generalSessions: ChatSession[];
  pdfSessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onNewPdfChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, type: 'general' | 'pdf') => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenPreferences: () => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'general' | 'pdf' } | null>(null);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}

      <div className={`fixed lg:sticky top-0 left-0 h-full w-80 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col shadow-lg`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Chat History</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenPreferences} title="Preferences">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onNewChat} className="gap-1">
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* General Chats */}
          <div className="px-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1 px-2">General Chats</p>
            {generalSessions.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">No general chats yet</div>
            ) : (
              generalSessions.map((session) => (
                <div key={session.id} className={`group relative rounded-lg p-2 cursor-pointer transition-colors ${currentSessionId === session.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}`} onClick={() => onSelectSession(session.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-medium truncate">{session.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatChatTime(session.updatedAt)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: session.id, type: 'general' }); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PDF Chats */}
          <div className="px-2 pt-2 pb-2">
            <div className="flex items-center justify-between mb-1 px-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> PDF Chats
              </p>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onNewPdfChat}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {pdfSessions.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">No PDF chats yet</div>
            ) : (
              pdfSessions.map((session) => (
                <div key={session.id} className={`group relative rounded-lg p-2 cursor-pointer transition-colors ${currentSessionId === session.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}`} onClick={() => onSelectSession(session.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-primary" />
                        <p className="text-sm font-medium truncate">{session.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{session.pdfs?.length || 0} PDF(s) · {formatChatTime(session.updatedAt)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: session.id, type: 'pdf' }); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" onClick={onToggle} className="w-full gap-2 text-muted-foreground hover:text-foreground lg:hidden">
            <ChevronLeft className="h-4 w-4" /> Close sidebar
          </Button>
        </div>

        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chat?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete this conversation. This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive" onClick={() => { if (deleteConfirm) onDeleteSession(deleteConfirm.id, deleteConfirm.type); setDeleteConfirm(null); }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {!isOpen && (
        <Button variant="outline" size="icon" className="fixed bottom-4 left-4 z-40 lg:hidden rounded-full shadow-lg" onClick={onToggle}>
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}

// ── Main Chat Tab ─────────────────────────────────────────────────────────────
function ChatTab() {
  const { toast } = useToast();
  const [generalSessions, setGeneralSessions] = useState<ChatSession[]>([]);
  const [pdfSessions, setPdfSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [pdfUploadOpen, setPdfUploadOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allSessions = [...generalSessions, ...pdfSessions];
  const currentSession = allSessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadAllSessions();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadAllSessions = async () => {
    setLoadingSessions(true);
    try {
      const [generalRes, pdfRes] = await Promise.all([
        aiService.getChatHistory(),
        aiService.getPdfSessions()
      ]);

      const generalHistory = generalRes.data?.data || [];
      const pdfSessionsData = pdfRes.data?.data || [];

      if (generalHistory.length > 0) {
        setGeneralSessions([{
          id: 'default',
          title: generalHistory[0]?.content?.slice(0, 50) || 'Chat',
          type: 'general',
          createdAt: new Date().toISOString(),
          updatedAt: generalHistory[generalHistory.length - 1]?.timestamp || new Date().toISOString(),
          messages: generalHistory,
        }]);
        setCurrentSessionId('default');
      } else {
        setGeneralSessions([{
          id: 'welcome',
          title: 'New Chat',
          type: 'general',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        }]);
        setCurrentSessionId('welcome');
      }

      setPdfSessions(pdfSessionsData.map((s: any) => ({
        id: s._id,
        title: s.title,
        type: 'pdf',
        pdfId: s._id,
        pdfs: s.pdfs,
        messages: s.messages || [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })));
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      type: 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setGeneralSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleNewPdfChat = () => {
    setPdfUploadOpen(true);
  };

  const handlePdfUpload = async (files: File[], title: string) => {
    try {
      const res = await aiService.createPdfSession(files, title);
      const newSession: ChatSession = {
        id: res.data?.data._id,
        title: res.data?.data.title,
        type: 'pdf',
        pdfId: res.data?.data._id,
        pdfs: res.data?.data.pdfs,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPdfSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      toast({ title: 'PDF chat created', description: `${files.length} PDF(s) uploaded.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message, variant: 'destructive' });
    }
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleDeleteSession = async (id: string, type: 'general' | 'pdf') => {
    if (type === 'pdf') {
      try {
        await aiService.deletePdfSession(id);
        setPdfSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
          const remaining = [...generalSessions, ...pdfSessions.filter(s => s.id !== id)];
          setCurrentSessionId(remaining[0]?.id || null);
        }
        toast({ title: 'PDF chat deleted' });
      } catch (error: any) {
        toast({ title: 'Error', description: error?.message, variant: 'destructive' });
      }
    } else {
      if (id === 'welcome' && generalSessions.length === 1) {
        const updated = generalSessions.map(s => s.id === id ? { ...s, messages: [], title: 'New Chat', updatedAt: new Date().toISOString() } : s);
        setGeneralSessions(updated);
        await aiService.clearChatHistory();
        toast({ title: 'Chat cleared' });
      } else {
        setGeneralSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
          const remaining = generalSessions.filter(s => s.id !== id);
          setCurrentSessionId(remaining[0]?.id || null);
        }
      }
    }
  };

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    setGeneralSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s));
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading || !currentSessionId) return;

    const userMsg: Msg = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    let updatedMessages = [...messages, userMsg];

    if (currentSession?.type === 'general') {
      setGeneralSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() } : s));
    } else {
      setPdfSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() } : s));
    }

    setInput('');
    setIsLoading(true);

    const session = allSessions.find(s => s.id === currentSessionId);
    if (session && (session.title === 'New Chat' || session.title === 'Chat') && updatedMessages.length === 1) {
      updateSessionTitle(currentSessionId, text.trim());
    }

    try {
      const contextHistory = updatedMessages.slice(-15).map(m => ({ role: m.role, content: m.content }));
      let answer: string;

      if (currentSession?.type === 'pdf' && currentSession.pdfId) {
        const res = await aiService.chatWithPdfSession(currentSession.pdfId, text.trim());
        answer = res.data?.data?.answer ?? 'Sorry, I could not generate a response.';
      } else {
        const res = await aiService.chat(text.trim(), undefined, contextHistory);
        answer = res.data?.data?.answer ?? 'Sorry, I could not generate a response.';
      }

      const assistantMsg: Msg = { role: 'assistant', content: answer, timestamp: new Date().toISOString() };
      updatedMessages = [...updatedMessages, assistantMsg];

      if (currentSession?.type === 'general') {
        setGeneralSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() } : s));
        aiService.saveChatHistory(updatedMessages).catch(() => {});
      } else if (currentSession?.type === 'pdf' && currentSession.pdfId) {
        setPdfSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() } : s));
      }
    } catch (err: any) {
      toast({ title: 'AI Error', description: err?.message ?? 'Failed to get a response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const displayMessages = messages.length === 0 && !isLoading
    ? [{ role: 'assistant' as const, content: WELCOME_MESSAGE, timestamp: new Date().toISOString() }]
    : messages;

  const showDateSeparator = (i: number) => i === 0 || new Date(displayMessages[i].timestamp).toDateString() !== new Date(displayMessages[i - 1].timestamp).toDateString();

  if (loadingSessions) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[600px] relative">
      <ChatSidebar
        generalSessions={generalSessions}
        pdfSessions={pdfSessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onNewPdfChat={handleNewPdfChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenPreferences={() => setPreferencesOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col rounded-none lg:rounded-lg shadow-none lg:shadow">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!sidebarOpen && (
                  <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {currentSession?.type === 'pdf' ? <FileText className="h-4 w-4 text-primary" /> : <Brain className="h-4 w-4 text-primary" />}
                </div>
                <div>
                  <CardTitle className="text-base">{currentSession?.title || 'NexFord AI'}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                    {currentSession?.type === 'pdf' && currentSession?.pdfs && (
                      <span className="ml-1">· {currentSession.pdfs.length} PDF(s)</span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Live</Badge>
            </div>
          </CardHeader>

          <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1" style={{ maxHeight: '460px' }}>
            {displayMessages.map((msg, i) => (
              <Fragment key={i}>
                {showDateSeparator(i) && (
                  <div className="flex items-center gap-2 py-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] text-muted-foreground px-2 font-medium">{formatDateLabel(msg.timestamp)}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </Fragment>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t space-y-3">
            <div className="flex flex-wrap gap-2">
              {['Explain binary search algorithm', 'Help me understand recursion', 'What is the difference between TCP and UDP?', 'Explain polymorphism in OOP'].map(prompt => (
                <Button key={prompt} variant="outline" size="sm" className="text-xs h-7" onClick={() => send(prompt)} disabled={isLoading}>
                  {prompt}
                </Button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={e => { e.preventDefault(); send(input); }}>
              <Input placeholder="Ask me anything about your coursework…" value={input} onChange={e => setInput(e.target.value)} className="flex-1" disabled={isLoading} />
              <Button size="icon" type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <PdfUploadDialog open={pdfUploadOpen} onOpenChange={setPdfUploadOpen} onUpload={handlePdfUpload} />
      <PreferencesDialog open={preferencesOpen} onOpenChange={setPreferencesOpen} onPreferencesSaved={loadAllSessions} />
    </div>
  );
}

// ── PDF Q&A Tab (Legacy) ──────────────────────────────────────────────────────
function PDFQATab() {
  const { toast } = useToast();
  const [pdf, setPdf] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAsk = async () => {
    if (!pdf || !question.trim()) return;
    setIsLoading(true);
    try {
      const convHistory = history.flatMap(h => [{ role: 'user' as const, content: h.question }, { role: 'assistant' as const, content: h.answer }]);
      const res = await aiService.chatWithPDF(pdf, question.trim(), convHistory);
      setHistory(prev => [...prev, { question: question.trim(), answer: res.data?.data?.answer || 'No answer generated.' }]);
      setQuestion('');
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarise = async () => {
    if (!pdf) return;
    setIsLoading(true);
    try {
      const res = await aiService.summarisePDF(pdf);
      setHistory(prev => [...prev, { question: '📋 Summarise this document', answer: res.data?.data?.summary || 'No summary generated.' }]);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Chat with PDF</CardTitle>
          <CardDescription>Upload a course PDF and ask questions about it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${pdf ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/50'}`} onClick={() => fileRef.current?.click()}>
            {pdf ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-primary mx-auto" />
                <p className="font-medium text-sm">{pdf.name}</p>
                <p className="text-xs text-muted-foreground">{(pdf.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={e => { e.stopPropagation(); setPdf(null); setHistory([]); }}><X className="h-4 w-4 mr-1" /> Remove</Button>
              </div>
            ) : (
              <div className="space-y-2"><Upload className="h-8 w-8 text-muted-foreground mx-auto" /><p className="text-sm font-medium">Click to upload a PDF</p><p className="text-xs text-muted-foreground">Max 20MB</p></div>
            )}
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPdf(f); setHistory([]); } }} />
          </div>
          {pdf && (<><Button variant="outline" className="w-full gap-2" onClick={handleSummarise} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Summarise Document</Button>
          <div className="space-y-2"><Label>Ask a question</Label><Textarea placeholder="What is the main topic of chapter 2?" value={question} onChange={e => setQuestion(e.target.value)} rows={3} disabled={isLoading} />
          <Button className="w-full gap-2" onClick={handleAsk} disabled={isLoading || !question.trim()}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Ask AI</Button></div></>)}
          {!pdf && <p className="text-center py-4 text-sm text-muted-foreground">Upload a PDF to get started</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Answers</CardTitle><CardDescription>AI responses based on your document</CardDescription></CardHeader>
        <CardContent className="overflow-y-auto" style={{ maxHeight: '450px' }}>
          {history.length === 0 ? (<div className="flex flex-col items-center justify-center py-12 text-center space-y-3"><Brain className="h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">{pdf ? 'Ask a question or summarise the document' : 'Upload a PDF first'}</p></div>) : (
            <div className="space-y-4">{history.map((item, i) => (<div key={i} className="rounded-lg border p-4 space-y-3"><div className="flex items-start gap-2"><Badge variant="outline" className="text-xs mt-0.5">Q</Badge><p className="text-sm font-medium">{item.question}</p></div><div className="flex items-start gap-2"><Badge className="text-xs mt-0.5">A</Badge><p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.answer}</p></div></div>))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Practice Questions Tab ────────────────────────────────────────────────────
function PracticeQuestionsTab() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState('5');
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<Record<number, string>>({});

  const generate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuestions([]);
    setSelected({});
    try {
      const res = await aiService.generateQuestions(topic.trim(), difficulty, parseInt(count));
      setQuestions(res.data?.data?.questions || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><List className="h-5 w-5 text-primary" /> Generate Practice Questions</CardTitle><CardDescription>AI-generated MCQ questions to prepare for your exams</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-2"><Label>Topic</Label><Input placeholder="e.g. Data Structures, Thermodynamics..." value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()} /></div>
            <div className="space-y-2"><Label>Difficulty</Label><Select value={difficulty} onValueChange={setDifficulty}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Questions</Label><Select value={count} onValueChange={setCount}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">3</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem></SelectContent></Select></div>
          </div>
          <Button className="mt-4 gap-2" onClick={generate} disabled={isLoading || !topic.trim()}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Questions</Button>
        </CardContent>
      </Card>
      {isLoading && (<div className="flex justify-center py-12"><div className="text-center space-y-3"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /><p className="text-sm text-muted-foreground">Generating questions on "{topic}"…</p></div></div>)}
      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => {
            const pickedLetter = selected[i];
            const answered = pickedLetter !== undefined;
            const isCorrect = answered && pickedLetter === q.answer;
            return (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5 flex-shrink-0">{i + 1}</Badge>
                    <p className="font-medium text-sm">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                    {Object.entries(q.options || {}).map(([letter, text]) => {
                      const isPicked = pickedLetter === letter;
                      const isRightAnswer = letter === q.answer;
                      let stateClass = 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50 cursor-pointer';
                      if (answered) {
                        if (isRightAnswer) {
                          stateClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium';
                        } else if (isPicked) {
                          stateClass = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium';
                        } else {
                          stateClass = 'border-border bg-muted/20 opacity-60';
                        }
                      }
                      return (
                        <button
                          key={letter}
                          type="button"
                          disabled={answered}
                          onClick={() => !answered && setSelected(s => ({ ...s, [i]: letter }))}
                          className={`text-left text-sm p-2 rounded-lg border transition-colors w-full disabled:cursor-default ${stateClass}`}
                        >
                          <span className="font-medium mr-2">{letter}.</span>{text}
                          {answered && isRightAnswer && <span className="ml-1">✓</span>}
                          {answered && isPicked && !isRightAnswer && <span className="ml-1">✗</span>}
                        </button>
                      );
                    })}
                  </div>
                  {answered && (
                    <div className={`ml-8 text-sm rounded-lg p-3 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted/50'}`}>
                      <p className="font-medium text-foreground mb-1">
                        {isCorrect ? '✅ Correct!' : `❌ Not quite — the correct answer is ${q.answer}.`}
                      </p>
                      <p className="text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentAIAssistantPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">Dashboard / <span className="text-foreground font-medium">AI Assistant</span></div>
        <div><h1 className="text-2xl font-bold">AI Learning Assistant</h1><p className="text-muted-foreground">ask questions, analyse PDFs, generate practice tests</p></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[{ icon: MessageSquare, label: 'General Chat', desc: 'Saved chat history with sidebar' }, { icon: FileText, label: 'PDF Q&A', desc: 'Upload & query your notes' }, { icon: List, label: 'Practice Quiz', desc: 'AI-generated MCQs' }].map(item => (
            <Card key={item.label} className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30"><CardContent className="pt-4 pb-3 text-center"><item.icon className="h-6 w-6 text-primary mx-auto mb-2" /><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></CardContent></Card>
          ))}
        </div>
        <Tabs defaultValue="chat">
          <TabsList><TabsTrigger value="chat" className="gap-2"><MessageSquare className="h-4 w-4" /> General Chat</TabsTrigger><TabsTrigger value="pdf" className="gap-2"><FileText className="h-4 w-4" /> PDF Q&A</TabsTrigger><TabsTrigger value="questions" className="gap-2"><List className="h-4 w-4" /> Practice Questions</TabsTrigger></TabsList>
          <TabsContent value="chat" className="mt-4"><ChatTab /></TabsContent>
          <TabsContent value="pdf" className="mt-4"><PDFQATab /></TabsContent>
          <TabsContent value="questions" className="mt-4"><PracticeQuestionsTab /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}