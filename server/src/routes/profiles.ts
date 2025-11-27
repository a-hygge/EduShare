import { Router, Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      'SELECT id, email, full_name, avatar_url, bio, role, points, total_earnings, created_at FROM profiles WHERE id = ?',
      [id]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { full_name, avatar_url, bio } = req.body;

    await pool.query(
      'UPDATE profiles SET full_name = ?, avatar_url = ?, bio = ? WHERE id = ?',
      [full_name, avatar_url, bio, id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/:id/documents', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [documents] = await pool.query(
      'SELECT * FROM documents WHERE uploader_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json(documents);
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

export default router;
