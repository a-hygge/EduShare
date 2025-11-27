import { Router, Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest, authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/system', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [docsCount] = await pool.query('SELECT COUNT(*) as total FROM documents');
    const [usersCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [teachersCount] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'teacher'");
    const [downloadsCount] = await pool.query('SELECT COUNT(*) as total FROM downloads');

    res.json({
      totalDocuments: (docsCount as any)[0]?.total || 0,
      totalUsers: (usersCount as any)[0]?.total || 0,
      totalTeachers: (teachersCount as any)[0]?.total || 0,
      totalDownloads: (downloadsCount as any)[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Không thể lấy thống kê hệ thống' });
  }
});

router.get('/teacher/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const [docsCount] = await pool.query(
      'SELECT COUNT(*) as total FROM documents WHERE uploaded_by = ?',
      [userId]
    );
    const [downloads] = await pool.query(
      `SELECT COUNT(*) as total
       FROM downloads d
       JOIN documents doc ON d.document_id = doc.id
       WHERE doc.uploaded_by = ?`,
      [userId]
    );

    res.json({
      totalDocuments: (docsCount as any)[0]?.total || 0,
      totalDownloads: (downloads as any)[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ error: 'Không thể lấy thống kê' });
  }
});

router.get('/student/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const [downloads] = await pool.query(
      'SELECT COUNT(*) as total FROM downloads WHERE user_id = ?',
      [userId]
    );

    res.json({
      totalDownloads: (downloads as any)[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ error: 'Không thể lấy thống kê' });
  }
});

export default router;
