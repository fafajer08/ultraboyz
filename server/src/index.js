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
app.use(cors());
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
