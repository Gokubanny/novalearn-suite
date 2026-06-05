import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

function resolveSocketUrl(): string {
  const apiUrl =
    (import.meta as any).env?.VITE_API_URL || 'https://nexford-backend.onrender.com';
  // Strip trailing /api if present — socket.io attaches at server root
  return apiUrl.replace(/\/api\/?$/, '');
}

export function getSocket(): Socket | null {
  const token = localStorage.getItem('nexford_token');
  if (!token) {
    disconnectSocket();
    return null;
  }

  // Reconnect if token changed
  if (socket && currentToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    currentToken = token;
    socket = io(resolveSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      timeout: 10000,
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
