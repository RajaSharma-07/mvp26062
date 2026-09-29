import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh';
const EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

function signTokens(payload: object) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const { accessToken, refreshToken } = signTokens(payload);

  res
    .cookie('access_token', accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 })
    .cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
});

// POST /auth/refresh
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refresh_token || req.body?.refreshToken;
  if (!token) { res.status(401).json({ error: 'No refresh token' }); return; }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const newPayload = { userId: payload.userId, email: payload.email, role: payload.role };
    const { accessToken } = signTokens(newPayload);
    res
      .cookie('access_token', accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 })
      .json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('access_token').clearCookie('refresh_token').json({ ok: true });
});

// GET /auth/me
router.get('/me', async (req, res) => {
  const token =
    req.cookies?.access_token ||
    req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, stationId: true },
    });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
