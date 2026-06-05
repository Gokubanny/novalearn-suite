import type { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

let io: IOServer | null = null;

export function initSocket(httpServer: HttpServer): IOServer {
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
    : ['*'];

  io = new IOServer(httpServer, {
    cors: {
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Allow long-poll fallback automatically
    transports: ['websocket', 'polling'],
  });

  // JWT handshake auth
  io.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth && (socket.handshake.auth as any).token) ||
        (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/i, '');

      if (!token) return next(new Error('No auth token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      (socket.data as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket.data as any).user as JwtPayload | undefined;
    if (!user) {
      socket.disconnect(true);
      return;
    }
    socket.join(`user:${user.id}`);
    if (user.school) socket.join(`school:${user.school}`);

    socket.emit('connected', { userId: user.id });
  });

  console.log('✅ Socket.IO realtime initialised');
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  if (!io || !userId) return;
  io.to(`user:${String(userId)}`).emit(event, payload);
}

export function emitToSchool(schoolId: string, event: string, payload: unknown): void {
  if (!io || !schoolId) return;
  io.to(`school:${String(schoolId)}`).emit(event, payload);
}

export function getIO(): IOServer | null {
  return io;
}
