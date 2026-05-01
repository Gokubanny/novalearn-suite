import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║        NexFord Edu API Server          ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║  Status  : Running ✅                  ║`);
      console.log(`║  Port    : ${PORT}                        ║`);
      console.log(`║  Mode    : ${process.env.NODE_ENV || 'development'}               ║`);
      console.log(`║  URL     : http://localhost:${PORT}/api   ║`);
      console.log('╚════════════════════════════════════════╝');
      console.log('');
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('UNHANDLED REJECTION:', err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
