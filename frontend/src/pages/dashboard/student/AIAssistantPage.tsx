import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, BookMarked, GraduationCap, Lightbulb, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt';
import { studentNavItems } from '@/constants/studentNav';

const navItems = studentNavItems;

const suggestedPrompts = [
  'Explain binary search algorithm',
  'Help me solve this calculus integral',
  'Summarize my notes on thermodynamics',
  'Create a study plan for finals',
];

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

async function streamChat({ messages, onDelta, onDone, onError }: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'AI service error');
    return;
  }

  if (!resp.body) { onError('No response body'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { buffer = line + '\n' + buffer; break; }
    }
  }
  onDone();
}

export default function StudentAIAssistantPage() {
  const { plan, canAccess } = useSubscription();
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hello! I'm your NexfordEdu AI assistant. I can help you with coursework, study plans, and academic questions. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!canAccess('ai_assistant')) {
    return (
      <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
        <UpgradePrompt
          feature="AI Study Assistant"
          description="Get instant help with coursework, study plans, and academic questions using our AI-powered assistant."
          requiredPlan="pro"
          currentPlan={plan}
        />
      </DashboardLayout>
    );
  }

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length === newMessages.length + 1) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: newMessages,
      onDelta: upsert,
      onDone: () => setIsLoading(false),
      onError: (msg) => { toast.error(msg); setIsLoading(false); },
    });
  };

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">AI Assistant</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Learning Assistant</h1>
          <p className="text-muted-foreground">Your personal AI tutor powered by advanced language models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 flex flex-col" style={{ minHeight: '500px' }}>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">NexfordEdu AI</CardTitle>
                  <CardDescription className="text-xs">Powered by AI • Always ready to help</CardDescription>
                </div>
                <Badge className="ml-auto" variant="secondary">Live</Badge>
              </div>
            </CardHeader>
            <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2 mb-3 flex-wrap">
                {suggestedPrompts.map(prompt => (
                  <Button key={prompt} variant="outline" size="sm" className="text-xs" onClick={() => send(prompt)} disabled={isLoading}>
                    {prompt}
                  </Button>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={e => { e.preventDefault(); send(input); }}>
                <Input
                  placeholder="Ask me anything about your coursework..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button size="icon" type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => send('Generate study notes for my upcoming exam')}>
                  <Sparkles className="h-4 w-4 mr-2" /> Generate Study Notes
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => send('Create flashcards for key concepts I should know')}>
                  <BookMarked className="h-4 w-4 mr-2" /> Create Flashcards
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => send('Give me a practice quiz with 5 questions')}>
                  <GraduationCap className="h-4 w-4 mr-2" /> Practice Quiz
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => send('What topics should I focus on to improve my grades?')}>
                  <Lightbulb className="h-4 w-4 mr-2" /> Study Recommendations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
