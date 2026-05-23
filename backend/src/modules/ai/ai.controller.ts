import { Response } from 'express';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { AuthRequest, UserRole } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import Student from '../student/student.model';
import Course from '../course/course.model';
import AiChatHistory from './ai-chat-history.model';
import AiPdfSession from './ai-pdf-session.model';
import UserPreferences from './user-preferences.model';

const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY || 'placeholder-key',
  baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
});

const MODEL = process.env.GROK_MODEL || 'llama-3.3-70b-versatile';

// ── Helper: Get Student Context ──────────────────────────────────────────────
async function getStudentContext(userId: string) {
  const student = await Student.findOne({ user: userId })
    .populate('enrolledCourses', 'title code creditUnits level')
    .populate('preferences');
  
  if (!student) return null;

  const preferences = student.preferences as any;
  
  return {
    level: student.level,
    gpa: student.gpa,
    cgpa: student.cgpa,
    enrolledCourses: student.enrolledCourses || [],
    learningStyle: preferences?.learningStyle || {
      difficultyPreference: 'medium',
      explanationDetail: 'detailed',
      preferredSubjects: [],
    },
    aiSettings: preferences?.aiSettings || {
      responseTemperature: 0.5,
      maxTokens: 1024,
      contextLength: 15,
    },
  };
}

// ── Helper: Build System Prompt with Context ─────────────────────────────────
async function buildSystemPrompt(userId: string, hasPdf: boolean = false, pdfText?: string): Promise<string> {
  const context = await getStudentContext(userId);
  
  let prompt = `You are NexFord AI, an intelligent academic study assistant for university students.

STUDENT CONTEXT:
- Level: ${context?.level || 'University'} level student
- Current GPA: ${context?.gpa || 'N/A'}
- Enrolled Courses: ${context?.enrolledCourses.map((c: any) => `${c.code} (${c.title})`).join(', ') || 'None'}

LEARNING PREFERENCES:
- Difficulty Preference: ${context?.learningStyle?.difficultyPreference || 'medium'}
- Explanation Detail: ${context?.learningStyle?.explanationDetail || 'detailed'}

IMPORTANT RULES:
1. Tailor your responses to match the student's level (${context?.level || 'university'} level)
2. Use ${context?.learningStyle?.explanationDetail || 'detailed'} explanations
3. Adjust difficulty to ${context?.learningStyle?.difficultyPreference || 'medium'} level
4. If the student asks about courses they're enrolled in, use that context
5. Be educational, clear, and encouraging
6. Use examples relevant to their courses when possible`;

  if (hasPdf && pdfText) {
    prompt += `\n\nCOURSE DOCUMENT CONTENT (answer based ONLY on this):
---
${pdfText.slice(0, 48000)}
---`;
  }

  return prompt;
}

// ── CREATE NEW PDF CHAT SESSION ──────────────────────────────────────────────
export const createPdfSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError('At least one PDF file is required.', 400);
  }
  if (files.length > 3) {
    throw new AppError('Maximum 3 PDF files per session.', 400);
  }

  const pdfsData = [];
  let combinedText = '';

  for (const file of files) {
    try {
      const pdfBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(pdfBuffer);
      pdfsData.push({
        name: file.originalname,
        size: file.size,
        text: pdfData.text.slice(0, 48000),
        uploadedAt: new Date(),
      });
      combinedText += `\n\n--- ${file.originalname} ---\n${pdfData.text.slice(0, 48000)}`;
      fs.unlinkSync(file.path);
    } catch (err) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new AppError(`Failed to read PDF: ${file.originalname}`, 400);
    }
  }

  const session = await AiPdfSession.create({
    user: req.user?.id,
    school: req.user?.school,
    title: title || files[0].originalname.replace('.pdf', ''),
    pdfs: pdfsData,
    messages: [],
  });

  res.status(201).json({
    success: true,
    message: 'PDF chat session created.',
    data: session,
  });
};

// ── GET ALL PDF CHAT SESSIONS ────────────────────────────────────────────────
export const getPdfSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  const sessions = await AiPdfSession.find({ user: req.user?.id })
    .sort({ updatedAt: -1 })
    .select('_id title pdfs messages updatedAt createdAt');
  
  res.status(200).json({
    success: true,
    data: sessions,
  });
};

// ── GET SINGLE PDF CHAT SESSION ──────────────────────────────────────────────
export const getPdfSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  
  const session = await AiPdfSession.findOne({
    _id: sessionId,
    user: req.user?.id,
  });
  
  if (!session) {
    throw new AppError('PDF session not found.', 404);
  }
  
  res.status(200).json({
    success: true,
    data: session,
  });
};

// ── CHAT WITH PDF SESSION ────────────────────────────────────────────────────
export const chatWithPdfSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const { question } = req.body;

  if (!question) throw new AppError('Question is required.', 400);

  const session = await AiPdfSession.findOne({
    _id: sessionId,
    user: req.user?.id,
  });
  
  if (!session) throw new AppError('PDF session not found.', 404);
  if (!session.pdfs || session.pdfs.length === 0) {
    throw new AppError('No PDFs in this session. Please upload PDFs first.', 400);
  }

  // Combine all PDF texts
  const combinedText = session.pdfs.map(pdf => 
    `--- ${pdf.name} ---\n${pdf.text}`
  ).join('\n\n');

  const systemPrompt = await buildSystemPrompt(req.user!.id, true, combinedText);
  const context = await getStudentContext(req.user!.id);
  const contextLength = context?.aiSettings?.contextLength || 15;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history
  session.messages.slice(-contextLength).forEach((msg: any) => {
    messages.push({ role: msg.role, content: msg.content });
  });

  messages.push({ role: 'user', content: question });

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: context?.aiSettings?.maxTokens || 1024,
    temperature: context?.aiSettings?.responseTemperature || 0.5,
  });

  const answer = completion.choices[0]?.message?.content || 'I could not generate a response.';

  // Save messages to session
  session.messages.push(
    { role: 'user', content: question, timestamp: new Date() },
    { role: 'assistant', content: answer, timestamp: new Date() }
  );
  await session.save();

  res.status(200).json({
    success: true,
    data: { question, answer },
  });
};

// ── DELETE PDF CHAT SESSION ──────────────────────────────────────────────────
export const deletePdfSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  
  const result = await AiPdfSession.findOneAndDelete({
    _id: sessionId,
    user: req.user?.id,
  });
  
  if (!result) {
    throw new AppError('PDF session not found.', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'PDF session deleted.',
  });
};

// ── UPDATE USER PREFERENCES ──────────────────────────────────────────────────
export const updateUserPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  const { learningStyle, aiSettings } = req.body;

  let preferences = await UserPreferences.findOne({ user: req.user?.id });
  
  if (!preferences) {
    preferences = await UserPreferences.create({
      user: req.user?.id,
      school: req.user?.school,
      learningStyle: learningStyle || {},
      aiSettings: aiSettings || {},
    });
    
    // Link to student
    await Student.findOneAndUpdate(
      { user: req.user?.id },
      { preferences: preferences._id }
    );
  } else {
    if (learningStyle) {
      Object.assign(preferences.learningStyle, learningStyle);
    }
    if (aiSettings) {
      Object.assign(preferences.aiSettings, aiSettings);
    }
    await preferences.save();
  }

  res.status(200).json({
    success: true,
    message: 'Preferences updated.',
    data: preferences,
  });
};

// ── GET USER PREFERENCES ─────────────────────────────────────────────────────
export const getUserPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  const preferences = await UserPreferences.findOne({ user: req.user?.id });
  
  res.status(200).json({
    success: true,
    data: preferences || {
      learningStyle: {
        difficultyPreference: 'medium',
        explanationDetail: 'detailed',
        preferredSubjects: [],
        studyReminders: false,
      },
      aiSettings: {
        responseTemperature: 0.5,
        maxTokens: 1024,
        contextLength: 15,
      },
    },
  });
};

// ── CHAT WITHOUT PDF (Updated with context) ──────────────────────────────────
export const chatGeneral = async (req: AuthRequest, res: Response): Promise<void> => {
  const { question, subject, conversationHistory } = req.body;
  if (!question) throw new AppError('Question is required.', 400);

  const systemPrompt = await buildSystemPrompt(req.user!.id, false);
  const context = await getStudentContext(req.user!.id);
  const contextLength = context?.aiSettings?.contextLength || 15;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.slice(-contextLength).forEach((msg: { role: string; content: string }) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
  }

  messages.push({ role: 'user', content: question });

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: context?.aiSettings?.maxTokens || 1024,
    temperature: context?.aiSettings?.responseTemperature || 0.5,
  });

  const answer = completion.choices[0]?.message?.content || 'I could not generate a response.';

  res.status(200).json({
    success: true,
    message: 'Response generated.',
    data: { question, answer },
  });
};

// ── CHAT WITH SINGLE PDF (Legacy - kept for compatibility) ───────────────────
export const chatWithPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  const { question, conversationHistory } = req.body;
  if (!question) throw new AppError('Question is required.', 400);
  if (!req.file) throw new AppError('PDF file is required.', 400);

  let pdfText = '';
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    pdfText = pdfData.text;
    fs.unlinkSync(req.file.path);
  } catch {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw new AppError('Failed to read PDF file.', 400);
  }

  const systemPrompt = await buildSystemPrompt(req.user!.id, true, pdfText);
  const context = await getStudentContext(req.user!.id);
  const contextLength = context?.aiSettings?.contextLength || 15;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.slice(-contextLength).forEach((msg: { role: string; content: string }) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
  }

  messages.push({ role: 'user', content: question });

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: context?.aiSettings?.maxTokens || 1024,
    temperature: context?.aiSettings?.responseTemperature || 0.3,
  });

  const answer = completion.choices[0]?.message?.content || 'I could not generate a response.';

  res.status(200).json({
    success: true,
    message: 'Response generated.',
    data: { question, answer, usage: completion.usage },
  });
};

// ── SUMMARISE PDF (Updated) ──────────────────────────────────────────────────
export const summarisePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('PDF file is required.', 400);

  let pdfText = '';
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    pdfText = pdfData.text;
    fs.unlinkSync(req.file.path);
  } catch {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw new AppError('Failed to read PDF.', 400);
  }

  const context = await getStudentContext(req.user!.id);
  const truncatedText = pdfText.slice(0, 48000);

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are NexFord AI, an academic study assistant. Summarise academic documents for a ${context?.level || 'university'} level student. Use ${context?.learningStyle?.explanationDetail || 'detailed'} explanations.`,
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
    max_tokens: context?.aiSettings?.maxTokens || 1500,
    temperature: 0.3,
  });

  const summary = completion.choices[0]?.message?.content || 'Could not generate summary.';

  res.status(200).json({
    success: true,
    message: 'Summary generated.',
    data: { summary },
  });
};

// ── GENERATE PRACTICE QUESTIONS (Updated) ────────────────────────────────────
export const generateQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { topic, difficulty, count } = req.body;
  if (!topic) throw new AppError('Topic is required.', 400);

  const context = await getStudentContext(req.user!.id);
  const numQuestions = Math.min(Number(count) || 5, 10);
  const difficultyLevel = difficulty || context?.learningStyle?.difficultyPreference || 'medium';

  const completion = await grok.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are NexFord AI, an academic study assistant. Generate practice questions for a ${context?.level || 'university'} level student.`,
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
    max_tokens: context?.aiSettings?.maxTokens || 2000,
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

// ── STUDENT PERFORMANCE INSIGHTS (Keep existing) ─────────────────────────────
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
    data: { gpa: student.gpa, cgpa: student.cgpa, insights },
  });
};

// ── GET CHAT HISTORY (Keep existing) ─────────────────────────────────────────
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const history = await AiChatHistory.findOne({ user: req.user?.id });
  res.status(200).json({
    success: true,
    data: history?.messages ?? [],
  });
};

// ── SAVE CHAT HISTORY (Keep existing) ────────────────────────────────────────
export const saveChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) throw new AppError('messages must be an array.', 400);

  const trimmed = messages.slice(-300);
  await AiChatHistory.findOneAndUpdate(
    { user: req.user?.id },
    {
      user: req.user?.id,
      school: req.user?.school,
      messages: trimmed,
    },
    { upsert: true, new: true }
  );

  res.status(200).json({ success: true, message: 'History saved.' });
};

// ── CLEAR CHAT HISTORY (Keep existing) ───────────────────────────────────────
export const clearChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  await AiChatHistory.findOneAndUpdate(
    { user: req.user?.id },
    { messages: [] },
    { upsert: true }
  );
  res.status(200).json({ success: true, message: 'History cleared.' });
};