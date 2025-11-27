import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/txt-to-pdf', async (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Missing filePath parameter' });
    }
    const fullPath = path.join(__dirname, '../../uploads', path.basename(filePath as string));
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const textContent = fs.readFileSync(fullPath, 'utf-8');
    const doc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    doc.pipe(res);
    doc
      .fontSize(12)
      .font('Courier')
      .text(textContent, {
        width: 500,
        align: 'left'
      });

    doc.end();
  } catch (error) {
    console.error('TXT to PDF conversion error:', error);
    res.status(500).json({ error: 'Failed to convert TXT to PDF' });
  }
});

export default router;
