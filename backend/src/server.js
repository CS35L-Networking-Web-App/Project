import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const app = express();
// allow frontend (localhost:5173) to access backend (localhost:4000)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// auth routes
app.use('/api/auth', authRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json('Internal server error');
});

const port = Number(process.env.PORT) || 4000;

async function start() {
  console.log("Mongo URI:", process.env.MONGODB_URI);

  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: true });
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`API listening on :${port}`));
}
start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
