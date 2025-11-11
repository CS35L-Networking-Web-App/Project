import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string()
      .min(8)
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
  name: z.string().min(1).optional()
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});
const verifySchema = z.object({
  email: z.email(),
  code: z.string().length(6)
});

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Sign Up
router.post('/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, name } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const code = genCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  const user = await User.create({
    email, passwordHash, name,
    isVerified: false,
    verificationCode: code,
    verificationExpiresAt: expires
  });

  console.log(`[VERIFY] ${email} -> code: ${code} (valid 15m)`);
  res.status(201).json({ id: user.id, email: user.email });
});

// Email Verification
router.post('/verify', authLimiter, async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, code } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const now = new Date();
  if (user.isVerified) return res.json({ ok: true });
  if (!user.verificationCode || !user.verificationExpiresAt)
    return res.status(400).json({ error: 'No verification pending' });
  if (user.verificationExpiresAt < now)
    return res.status(400).json({ error: 'Code expired' });
  if (user.verificationCode !== code)
    return res.status(400).json({ error: 'Invalid code' });

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpiresAt = undefined;
  await user.save();

  res.json({ ok: true });
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid Email or Password' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid Email or Password' });

 // if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });

  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: user.id, expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
