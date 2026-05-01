import { Response } from 'express';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { AuthRequest, UserRole } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import Student from '../student/student.model';

// Grok uses OpenAI-compatible API
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
});

const MODEL = process.env.GROK_MODEL || 'grok-3-mini';

// ── CHAT WITH COURSE PDF ───────────────────────────────────────────────────────
export const chatWithPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  const { question, conversationHistory } = req.body;

  if (!question) throw new AppError('Question is required.', 400);
  if (!req.file) throw new AppError('PDF file is required.', 400);

  // Extract text from uploaded PDF
  let pdfText = '';
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    pdfText = pdfData.text;
    fs.unlinkSync(req.file.path);
  } catch {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new AppError('Failed to read PDF file. Please ensure it is a valid PDF.', 400);
  }

  if (!pdfText.trim()) {
    throw new AppError('The PDF appears to be empty or could not be read.', 400);
  }

  // Limit PDF text to avoid token overload (approx 12000 words)
  const truncatedText = pdfText.slice(0, 48000);

  // Build messages array
  const systemPrompt = `You are NexFord AI, an intelligent academic study assistant integrated into the NexFord Edu platform. 
You help students understand their course materials by answering questions based ONLY on the provided document content.

IMPORTANT RULES:
1. Answer questions based ONLY on the content of the provided course document below.
2. If the answer is not in the document, say "This information is not covered in the provided document."
3. Be clear, accurate, and educational in your explanations.
4. Use simple language appropriate for university students.
5. If asked for a summary, provide a structured and concise summary.
6. Do not make up information or draw from outside knowledge.

COURSE DOCUMENT CONTENT:
---
${truncatedText}
---`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history if provided
  if (conversationHistory && Array.isArray(conversationHistory)) {
    const historyMessages = conversationHistory.slice(-6); // Last 6 messages
    historyMessages.forEach((msg: { role: string; content: string }) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
  }

  messages.push({ role: 'user', content: question });

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.3, // Low temperature for factual accuracy
  });

  const answer = completion.choices[0]?.message?.content || 'I could not generate a response.';

  res.status(200).json({
    success: true,
    message: 'Response generated.',
    data: {
      question,
      answer,
      usage: completion.usage,
    },
  });
};

// ── CHAT WITHOUT PDF (General academic question) ──────────────────────────────
export const chatGeneral = async (req: AuthRequest, res: Response): Promise<void> => {
  const { question, subject, conversationHistory } = req.body;

  if (!question) throw new AppError('Question is required.', 400);

  const systemPrompt = `You are NexFord AI, an intelligent academic study assistant for university and polytechnic students in Nigeria. 
You help students understand academic concepts, explain theories, and support learning.
${subject ? `The student is studying: ${subject}.` : ''}

Be educational, clear, and helpful. Use examples where appropriate. 
If a question is not academic in nature, politely redirect to academic topics.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory && Array.isArray(conversationHistory)) {
    const historyMessages = conversationHistory.slice(-8);
    historyMessages.forEach((msg: { role: string; content: string }) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
  }

  messages.push({ role: 'user', content: question });

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.5,
  });

  const answer = completion.choices[0]?.message?.content || 'I could not generate a response.';

  res.status(200).json({
    success: true,
    message: 'Response generated.',
    data: { question, answer },
  });
};

// ── SUMMARISE PDF ─────────────────────────────────────────────────────────────
export const summarisePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('PDF file is required.', 400);

  let pdfText = '';
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    pdfText = pdfData.text;
    fs.unlinkSync(req.file.path);
  } catch {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new AppError('Failed to read PDF.', 400);
  }

  const truncatedText = pdfText.slice(0, 48000);

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are NexFord AI, an academic study assistant. Summarise academic documents clearly and concisely for students.',
      },
      {
        role: 'user',
        content: `Please provide a comprehensive but concise summary of this course document. 
Include: main topics covered, key concepts, and important points a student should know.
Format the summary with clear headings and bullet points where appropriate.

DOCUMENT:
${truncatedText}`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.3,
  });

  const summary = completion.choices[0]?.message?.content || 'Could not generate summary.';

  res.status(200).json({
    success: true,
    message: 'Summary generated.',
    data: { summary },
  });
};

// ── GENERATE PRACTICE QUESTIONS ───────────────────────────────────────────────
export const generateQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { topic, difficulty, count } = req.body;

  if (!topic) throw new AppError('Topic is required.', 400);

  const numQuestions = Math.min(Number(count) || 5, 10);
  const difficultyLevel = difficulty || 'medium';

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are NexFord AI, an academic study assistant. Generate practice questions to help students prepare for exams.',
      },
      {
        role: 'user',
        content: `Generate ${numQuestions} ${difficultyLevel}-difficulty practice questions on the topic: "${topic}".

For each question:
1. Write the question clearly
2. Provide 4 multiple choice options (A, B, C, D) 
3. Indicate the correct answer
4. Give a brief explanation of why that answer is correct

Format as JSON array with structure: { question, options: {A, B, C, D}, answer, explanation }`,
      },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  let questionsData;
  try {
    const content = completion.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    questionsData = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    questionsData = [];
  }

  res.status(200).json({
    success: true,
    message: 'Practice questions generated.',
    data: { topic, difficulty: difficultyLevel, questions: questionsData },
  });
};

// ── STUDENT PERFORMANCE INSIGHTS ──────────────────────────────────────────────
export const getPerformanceInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user?.role !== UserRole.STUDENT) {
    throw new AppError('Only students can access performance insights.', 403);
  }

  const student = await Student.findOne({ user: req.user?.id })
    .populate('enrolledCourses', 'title code creditUnits');

  if (!student) throw new AppError('Student profile not found.', 404);

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are NexFord AI, an academic advisor. Provide helpful, encouraging, and actionable academic performance insights to students.',
      },
      {
        role: 'user',
        content: `A student has the following academic data:
- Current GPA: ${student.gpa}
- CGPA: ${student.cgpa}
- Level: ${student.level} level student
- Number of enrolled courses: ${student.enrolledCourses.length}

Based on this data, provide:
1. A brief assessment of their academic standing
2. Specific advice to improve or maintain their GPA
3. Study tips tailored to their level
4. Encouragement to keep going

Keep the response warm, supportive, and practical.`,
      },
    ],
    max_tokens: 800,
    temperature: 0.6,
  });

  const insights = completion.choices[0]?.message?.content || 'Unable to generate insights.';

  res.status(200).json({
    success: true,
    message: 'Performance insights generated.',
    data: {
      gpa: student.gpa,
      cgpa: student.cgpa,
      insights,
    },
  });
};
