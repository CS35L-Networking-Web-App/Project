import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json('Internal server error');
});

const port = Number(process.env.PORT) || 4000;

async function start() {
  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: true });
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`API listening on :${port}`));
}
start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
