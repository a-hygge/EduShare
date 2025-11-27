import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').notEmpty().trim(),
    body('role').isIn(['teacher', 'student'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, full_name, role } = req.body;
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(400).json({ error: 'Email đã được đăng ký' });
      }

      // Insert user with plain password
      const [result] = await pool.query(
        `INSERT INTO users (email, password, full_name, role) 
         VALUES (?, ?, ?, ?)`,
        [email, password, full_name, role]
      );

      const userId = (result as any).insertId;

      // Generate token
      const secret = process.env.JWT_SECRET || 'default-secret-key';
      const token = jwt.sign(
        { userId, email, role },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      res.status(201).json({
        user: { 
          id: userId, 
          email, 
          full_name, 
          role
        },
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Đăng ký thất bại' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user with plain password
      const [users] = await pool.query(
        `SELECT id, email, password, full_name, role 
         FROM users WHERE email = ?`,
        [email]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }

      const user = users[0] as any;
      if (password !== user.password) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }
      const secret = process.env.JWT_SECRET || 'default-secret-key';
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Đăng nhập thất bại' });
    }
  }
);

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, full_name, role 
       FROM users WHERE id = ?`,
      [req.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin người dùng' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Đăng xuất thành công' });
});

export default router;
