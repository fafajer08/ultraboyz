import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { attachUser } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import membersRouter from './routes/members.js';
import eventsRouter from './routes/events.js';
import uploadsRouter from './routes/uploads.js';

dotenv.config();

const app = express();

// Needed behind a reverse proxy (Render, Railway, etc.) so req.protocol
// correctly reports "https" instead of "http" — otherwise uploaded photo
// URLs would be built with the wrong scheme.
app.set('trust proxy', 1);

// In dev this is wide open (undefined -> reflects any origin). In production,
// set CORS_ORIGIN to your deployed frontend's exact URL so only your own
// site can call this API with credentials.
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(attachUser); // populates req.user when a valid token is sent, for every route
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // serves uploaded photos

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/uploads', uploadsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Ultraboyz API running on http://localhost:${PORT}`);
});
