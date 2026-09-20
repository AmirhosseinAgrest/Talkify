// src/index.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import routes from './routes/index.js';
import { initializeSocket } from './socket/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { ensureUploadDirs } from './middleware/upload.middleware.js';
import {
  apiLimiter,
  createOriginChecker,
  isOriginAllowed,
  resolveAllowedOrigins,
} from './middleware/security.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const allowedOrigins = resolveAllowedOrigins();
const checkOrigin = createOriginChecker(allowedOrigins);
const originAllowed = (origin) => isOriginAllowed(allowedOrigins, origin);

const corsOptions = {
  origin: checkOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

const io = initializeSocket(httpServer, { checkOrigin, originAllowed });
app.set('io', io);

const PORT = process.env.PORT || 3001;

try {
  await ensureUploadDirs();
} catch (error) {
  console.error('Failed to prepare upload directories:', error.message);
  process.exit(1);
}

httpServer.listen(PORT, () => {
  console.log(`
  🚀 Talkify Backend is running!
  📡 Server: http://localhost:${PORT}
  🔌 Socket: ws://localhost:${PORT}
  📁 Uploads: http://localhost:${PORT}/uploads
  `);
});
