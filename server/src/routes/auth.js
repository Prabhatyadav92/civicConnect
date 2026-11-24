import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { sendResetEmail } from '../lib/mailer.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.env === 'test' ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes' },
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});
const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});

const sign = (user) =>
  jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const RESET_MINUTES = 30;

router.post(
  '/register',
  limiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);
    if (await User.exists({ email })) {
      throw new HttpError(409, 'An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    // Public sign-up always creates a citizen. Officials are created by an admin.
    const user = await User.create({ name, email, passwordHash, role: 'citizen' });
    res.status(201).json({ token: sign(user), user });
  })
);

router.post(
  '/login',
  limiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('+passwordHash').populate('department', 'name slug');
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw new HttpError(401, 'Email or password is incorrect');
    res.json({ token: sign(user), user });
  })
);

// Step 1: ask for a reset link. Always answers the same way, so nobody can use
// this endpoint to find out which emails have accounts.
router.post(
  '/forgot-password',
  limiter,
  asyncHandler(async (req, res) => {
    const { email } = forgotSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await User.updateOne(
        { _id: user._id },
        { $set: { resetTokenHash: sha256(token), resetTokenExpires: new Date(Date.now() + RESET_MINUTES * 60 * 1000) } }
      );
      const link = `${config.clientOrigin}/reset-password?token=${token}`;
      try {
        await sendResetEmail(user.email, link);
      } catch (err) {
        console.error('Could not send reset email:', err.message);
      }
    }

    res.json({ message: 'If an account exists for that email, a reset link is on its way.' });
  })
);

// Step 2: choose a new password with the emailed token.
router.post(
  '/reset-password',
  limiter,
  asyncHandler(async (req, res) => {
    const { token, password } = resetSchema.parse(req.body);
    const user = await User.findOne({
      resetTokenHash: sha256(token),
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) throw new HttpError(400, 'This reset link is invalid or has expired. Request a new one');

    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { _id: user._id },
      { $set: { passwordHash }, $unset: { resetTokenHash: '', resetTokenExpires: '' } }
    );
    res.json({ message: 'Your password has been updated. You can sign in now.' });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    await req.user.populate('department', 'name slug');
    res.json({ user: req.user });
  })
);

export default router;