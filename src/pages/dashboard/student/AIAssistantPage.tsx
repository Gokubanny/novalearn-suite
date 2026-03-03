import { Home, BookOpen, Calendar, FileText, Trophy, CheckCircle, Brain, User, Send, Sparkles, BookMarked, GraduationCap, Lightbulb } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: Home },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/student/attendance', icon: CheckCircle },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/student/results', icon: Trophy },
  { name: 'AI Assistant', href: '/dashboard/student/ai-assistant', icon: Brain },
  { name: 'Profile', href: '/dashboard/student/profile', icon: User },
];

const suggestedPrompts = [
  'Explain binary search algorithm',
  'Help me solve this calculus integral',
  'Summarize my notes on thermodynamics',
  'Create a study plan for finals',
];

const chatHistory = [
  { role: 'assistant' as const, message: 'Hello! I\'m your NexfordEdu AI assistant. I can help you with coursework, study plans, and academic questions. How can I help you today?' },
  { role: 'user' as const, message: 'Can you explain the difference between a stack and a queue?' },
  { role: 'assistant' as const, message: 'Great question! A **Stack** follows LIFO (Last In, First Out) — think of a stack of plates. The last element added is the first removed. A **Queue** follows FIFO (First In, First Out) — like a line at a store. The first element added is the first removed.\n\nKey operations:\n- Stack: push() and pop()\n- Queue: enqueue() and dequeue()' },
];

const learningInsights = [
  { title: 'Strongest Subject', value: 'English Composition', icon: BookMarked, detail: '95% avg score' },
  { title: 'Needs Improvement', value: 'Physics 101', icon: Lightbulb, detail: '58% avg score' },
  { title: 'Study Streak', value: '12 days', icon: Sparkles, detail: 'Keep it up!' },
  { title: 'Recommended Focus', value: 'Calculus II', icon: GraduationCap, detail: 'Exam in 2 weeks' },
];

export default function StudentAIAssistantPage() {
  const [inputValue, setInputValue] = useState('');

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
          {/* Chat Panel */}
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
                <Badge className="ml-auto" variant="secondary">Beta</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2 mb-3 flex-wrap">
                {suggestedPrompts.map((prompt) => (
                  <Button key={prompt} variant="outline" size="sm" className="text-xs" onClick={() => setInputValue(prompt)}>
                    {prompt}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask me anything about your coursework..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Adaptive Learning Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Learning Insights</CardTitle>
                <CardDescription>AI-powered analysis of your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {learningInsights.map((insight) => (
                  <div key={insight.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <insight.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{insight.title}</p>
                      <p className="text-sm font-medium">{insight.value}</p>
                      <p className="text-xs text-muted-foreground">{insight.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Sparkles className="h-4 w-4 mr-2" /> Generate Study Notes
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <BookMarked className="h-4 w-4 mr-2" /> Create Flashcards
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <GraduationCap className="h-4 w-4 mr-2" /> Practice Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
