import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
// allow frontend dev servers to access backend
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// auth routes
app.use('/api/auth', authRoutes);

// user routes
app.use('/api/users', userRoutes);

// post routes
app.use('/api/posts', postRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json('Internal server error');
});

const port = Number(process.env.PORT) || 4000;

async function start() {

    let mongoUri = process.env.MONGODB_URI;
    console.log("Mongo URI:", mongoUri);

    // If MONGODB_URI points to localhost, use in-memory instead (MongoDB likely not running)
    if (!mongoUri || mongoUri.includes('localhost:27017')) {
        let mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.info('Using in-memory MongoDB');

        // Auto-seed the database when using in-memory
        await mongoose.connect(mongoUri, { autoIndex: true });
        console.log('MongoDB connected');

        // Import and run seeding
        const { seedTestData } = await import('./seedData.js');
        await seedTestData();
    } else {
        await mongoose.connect(mongoUri, { autoIndex: true });
        console.log('MongoDB connected');
    }

  app.listen(port, () => console.log(`API listening on :${port}`));
}
start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
