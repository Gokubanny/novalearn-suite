import { useState, useRef, useEffect } from 'react';
import {
  Brain, Send, Sparkles, GraduationCap,
  Loader2, Upload, X, FileText, MessageSquare, List, RefreshCw,
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
import { studentNavItems } from '@/constants/studentNav';
import { aiService } from '@/services/ai.service';
import { useToast } from '@/hooks/use-toast';

const navItems = studentNavItems;

type Msg = { role: 'user' | 'assistant'; content: string };

interface GeneratedQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  explanation: string;
}

const suggestedPrompts = [
  'Explain binary search algorithm step by step',
  'Help me understand recursion with examples',
  'What is the difference between TCP and UDP?',
  'Explain polymorphism in OOP with examples',
];

// ── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm NexFord AI, I can help you with coursework, explain concepts, and answer academic questions. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const res = await aiService.chat(text.trim(), undefined, history);
      const answer = res.data?.data?.answer || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err: any) {
      toast({
        title: 'AI Error',
        description: err?.message || 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! I'm ready to help. What would you like to know?",
    }]);
  };

  return (
    <Card className="flex flex-col" style={{ minHeight: '500px' }}>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">NexFord AI</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Live
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearChat} title="Clear chat">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '420px' }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Brain className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
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
          {suggestedPrompts.map(prompt => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => send(prompt)}
              disabled={isLoading}
            >
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
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}

// ── PDF Q&A Tab ───────────────────────────────────────────────────────────────
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
      const convHistory = history.flatMap(h => [
        { role: 'user' as const, content: h.question },
        { role: 'assistant' as const, content: h.answer },
      ]);
      const res = await aiService.chatWithPDF(pdf, question.trim(), convHistory);
      const ans = res.data?.data?.answer || 'No answer generated.';
      setHistory(prev => [...prev, { question: question.trim(), answer: ans }]);
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
      const summary = res.data?.data?.summary || 'No summary generated.';
      setHistory(prev => [...prev, { question: '📋 Summarise this document', answer: summary }]);
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Chat with PDF
          </CardTitle>
          <CardDescription>Upload a course PDF and ask questions about it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              pdf ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/50'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            {pdf ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-primary mx-auto" />
                <p className="font-medium text-sm">{pdf.name}</p>
                <p className="text-xs text-muted-foreground">{(pdf.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={e => { e.stopPropagation(); setPdf(null); setHistory([]); }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium">Click to upload a PDF</p>
                <p className="text-xs text-muted-foreground">Max 20MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setPdf(f); setHistory([]); }
              }}
            />
          </div>

          {pdf && (
            <>
              <Button variant="outline" className="w-full gap-2" onClick={handleSummarise} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Summarise Document
              </Button>
              <div className="space-y-2">
                <Label>Ask a question</Label>
                <Textarea
                  placeholder="What is the main topic of chapter 2?"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
                <Button className="w-full gap-2" onClick={handleAsk} disabled={isLoading || !question.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Ask AI
                </Button>
              </div>
            </>
          )}
          {!pdf && (
            <p className="text-center py-4 text-sm text-muted-foreground">Upload a PDF to get started</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Answers
          </CardTitle>
          <CardDescription>AI responses based on your document</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto" style={{ maxHeight: '450px' }}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <Brain className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {pdf ? 'Ask a question or summarise the document' : 'Upload a PDF first'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs mt-0.5">Q</Badge>
                    <p className="text-sm font-medium">{item.question}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="text-xs mt-0.5">A</Badge>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
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
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const generate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuestions([]);
    setRevealed({});
    try {
      const res = await aiService.generateQuestions(topic.trim(), difficulty, parseInt(count));
      const qs: GeneratedQuestion[] = res.data?.data?.questions || [];
      setQuestions(qs);
      if (qs.length === 0) {
        toast({ title: 'No questions generated', description: 'Try a more specific topic.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" /> Generate Practice Questions
          </CardTitle>
          <CardDescription>AI-generated MCQ questions to prepare for your exams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label>Topic</Label>
              <Input
                placeholder="e.g. Data Structures, Thermodynamics..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Questions</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4 gap-2" onClick={generate} disabled={isLoading || !topic.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Questions
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Generating questions on "{topic}"…</p>
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <Card key={i}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="mt-0.5 flex-shrink-0">{i + 1}</Badge>
                  <p className="font-medium text-sm">{q.question}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                  {Object.entries(q.options || {}).map(([letter, text]) => (
                    <div
                      key={letter}
                      className={`text-sm p-2 rounded-lg border transition-colors ${
                        revealed[i] && letter === q.answer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <span className="font-medium mr-2">{letter}.</span>{text}
                    </div>
                  ))}
                </div>
                {!revealed[i] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-8"
                    onClick={() => setRevealed(r => ({ ...r, [i]: true }))}
                  >
                    Reveal Answer
                  </Button>
                ) : (
                  <div className="ml-8 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <p className="font-medium text-foreground mb-1">✅ Answer: {q.answer}</p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">AI Assistant</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">AI Learning Assistant</h1>
          <p className="text-muted-foreground">
            Powered by Groq (llama-3.3-70b) — ask questions, analyse PDFs, generate practice tests
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: MessageSquare, label: 'General Chat',      desc: 'Ask any academic question' },
            { icon: FileText,      label: 'PDF Q&A',           desc: 'Upload & query your notes'  },
            { icon: List,          label: 'Practice Quiz',     desc: 'AI-generated MCQs'          },
          ].map(item => (
            <Card key={item.label} className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
              <CardContent className="pt-4 pb-3 text-center">
                <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat"      className="gap-2"><MessageSquare className="h-4 w-4" /> General Chat</TabsTrigger>
            <TabsTrigger value="pdf"       className="gap-2"><FileText      className="h-4 w-4" /> PDF Q&A</TabsTrigger>
            <TabsTrigger value="questions" className="gap-2"><List          className="h-4 w-4" /> Practice Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="chat"      className="mt-4"><ChatTab /></TabsContent>
          <TabsContent value="pdf"       className="mt-4"><PDFQATab /></TabsContent>
          <TabsContent value="questions" className="mt-4"><PracticeQuestionsTab /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}