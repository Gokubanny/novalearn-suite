import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import path from 'path';
import fs from 'fs';

import authRoutes from './modules/auth/auth.routes';
import superAdminRoutes from './modules/superadmin/superadmin.routes';
import schoolRoutes from './modules/school/school.routes';
import courseRoutes from './modules/course/course.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import resultRoutes from './modules/results/result.routes';
import assignmentRoutes from './modules/assignment/assignment.routes';
import aiRoutes from './modules/ai/ai.routes';
import notificationRoutes from './modules/notification/notification.routes';
import materialRoutes from './modules/material/material.routes';
import discussionRoutes from './modules/discussion/discussion.routes';

import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// ── ENSURE UPLOADS DIR EXISTS ─────────────────────────────────────────────────
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── SECURITY MIDDLEWARE ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── RATE LIMITING ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ── BODY PARSING ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── LOGGING ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'NexFord Edu API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/discussions', discussionRoutes);

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── API DOCS PLACEHOLDER ──────────────────────────────────────────────────────
app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'NexFord Edu API v1.0',
    documentation: 'See README.md for full API documentation.',
    endpoints: {
      auth: '/api/auth',
      superAdmin: '/api/super-admin',
      school: '/api/school',
      courses: '/api/courses',
      attendance: '/api/attendance',
      results: '/api/results',
      assignments: '/api/assignments',
      ai: '/api/ai',
      notifications: '/api/notifications',
    },
  });
});

// ── ERROR HANDLING ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
