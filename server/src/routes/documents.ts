import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest, authenticateToken, optionalAuth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search, limit = '20', offset = '0' } = req.query;

    let query = `
      SELECT d.*, 
             u.full_name as uploader_name,
             u.role as uploader_role
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      query += ' AND (d.title LIKE ? OR d.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [documents] = await pool.query(query, params);

    res.json({
      documents,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách tài liệu' });
  }
});
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [documents] = await pool.query(
      `SELECT d.*, 
              u.full_name as uploader_name,
              u.email as uploader_email,
              u.role as uploader_role
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.id = ?`,
      [id]
    );

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài liệu' });
    }

    res.json(documents[0]);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin tài liệu' });
  }
});

router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('file_path').notEmpty(),
    body('file_type').optional()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.userRole !== 'teacher') {
        return res.status(403).json({ error: 'Chỉ giảng viên mới có thể upload tài liệu' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        file_path,
        file_type
      } = req.body;

      console.log('[Duplicate Check]', { title, userId: req.userId });

      const [existing] = await pool.query(
        'SELECT id FROM documents WHERE title = ? AND uploaded_by = ?',
        [title, req.userId]
      );

      console.log('[Duplicate Check] Found:', existing);

      if (Array.isArray(existing) && existing.length > 0) {
        console.log('[Duplicate Check] BLOCKED - duplicate title detected');
        return res.status(409).json({ error: 'Bạn đã có tài liệu với tiêu đề này rồi' });
      }

      const [result] = await pool.query(
        `INSERT INTO documents (
          title, description, file_path, file_type, uploaded_by
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          title,
          description || null,
          file_path,
          file_type || null,
          req.userId
        ]
      );

      const documentId = (result as any).insertId;

      res.status(201).json({ 
        id: documentId, 
        message: 'Upload tài liệu thành công' 
      });
    } catch (error) {
      console.error('Create document error:', error);
      res.status(500).json({ error: 'Upload tài liệu thất bại' });
    }
  }
);

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.userRole !== 'teacher') {
      return res.status(403).json({ error: 'Chỉ giảng viên mới có thể sửa tài liệu' });
    }

    const [documents] = await pool.query(
      'SELECT uploaded_by FROM documents WHERE id = ?',
      [id]
    );

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài liệu' });
    }

    const document = documents[0] as any;
    if (document.uploaded_by !== req.userId) {
      return res.status(403).json({ error: 'Bạn không có quyền sửa tài liệu này' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    const allowedFields = ['title', 'description', 'file_path', 'file_type'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Không có thông tin để cập nhật' });
    }

    params.push(id);

    await pool.query(
      `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Cập nhật tài liệu thành công' });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Cập nhật tài liệu thất bại' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.userRole !== 'teacher') {
      return res.status(403).json({ error: 'Chỉ giảng viên mới có thể xóa tài liệu' });
    }

    const [documents] = await pool.query(
      'SELECT uploaded_by FROM documents WHERE id = ?',
      [id]
    );

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài liệu' });
    }

    const document = documents[0] as any;
    if (document.uploaded_by !== req.userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa tài liệu này' });
    }

    await pool.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Xóa tài liệu thành công' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Xóa tài liệu thất bại' });
  }
});

router.post('/:id/download', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query(
      'INSERT INTO downloads (document_id, user_id) VALUES (?, ?)',
      [id, req.userId]
    );

    res.json({ message: 'Đã ghi nhận lượt tải. Sinh viên có thể tải không giới hạn!' });
  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({ error: 'Không thể ghi nhận lượt tải' });
  }
});

router.get('/teacher/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ error: 'Chỉ giảng viên mới xem được thống kê' });
    }

    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_documents,
        (SELECT COUNT(*) FROM downloads WHERE document_id IN 
          (SELECT id FROM documents WHERE uploaded_by = ?)) as total_downloads
       FROM documents
       WHERE uploaded_by = ?`,
      [req.userId, req.userId]
    );

    const [recentDocs] = await pool.query(
      `SELECT d.id, d.title, d.created_at,
        (SELECT COUNT(*) FROM downloads WHERE document_id = d.id) as downloads_count
       FROM documents d
       WHERE d.uploaded_by = ?
       ORDER BY d.created_at DESC
       LIMIT 10`,
      [req.userId]
    );

    res.json({
      stats: (stats as any)[0],
      recent_documents: recentDocs
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Không thể lấy thống kê' });
  }
});

export default router;
