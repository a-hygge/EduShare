# EduShare - Hệ Thống Chia Sẻ Tài Liệu Giáo Dục

## Giới Thiệu

EduShare là nền tảng đơn giản cho phép giảng viên upload và chia sẻ tài liệu học tập với sinh viên.

**Tính năng chính:**
- ✅ Giảng viên upload tài liệu (PDF, DOC, PPT, video, audio, etc.)
- ✅ Sinh viên tải tài liệu không giới hạn
- ✅ Preview tài liệu trực tiếp (PDF, Office, video, audio)
- ✅ Duplicate check tự động (cùng tiêu đề)
- ✅ Delete tài liệu (chỉ chủ sở hữu)

---

## Database Structure

```
1. users      - Người dùng (teacher/student/admin)
2. documents  - Tài liệu
3. downloads  - Tracking lượt tải
```

**Simple & Clean!**

---

## 🚀 Cài Đặt

### 1. Cài đặt Database

```bash
mysql -u root -p < server/database/schema.sql
mysql -u root -p < server/database/sample-data.sql
```

**Hoặc dùng MySQL Workbench:**
- Import `schema.sql`
- Import `sample-data.sql`

### 2. Cấu hình Backend

```bash
cd server
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=studocu

JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

### 3. Chạy Ứng Dụng

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

**Truy cập:** http://localhost:6868

---

## 📡 API Documentation

Xem chi tiết tại: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Postman Collection:** Import file `EduShare_Postman_Collection.json`

### Quick Reference

**Authentication:**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

**Documents:**
```
GET    /api/documents
GET    /api/documents/:id
POST   /api/documents          (teacher only)
PUT    /api/documents/:id      (owner only)
DELETE /api/documents/:id      (owner only)
POST   /api/documents/:id/download
```

**Upload:**
```
POST /api/uploads/upload       (multipart/form-data)
GET  /api/uploads/:filename
```

**Stats:**
```
GET /api/stats
```

---

## 🔑 Phân Quyền

### 👨‍🏫 Teacher (Giảng viên)
- Upload tài liệu (max 100MB, 19 formats)
- Sửa/Xóa tài liệu của mình
- Không thể upload 2 tài liệu cùng tên

### 👨‍🎓 Student (Sinh viên)
- Xem danh sách tài liệu
- Tải tài liệu (không giới hạn)
- Preview tài liệu online

---

## 📦 File Formats Hỗ Trợ

**Documents:**
- PDF, DOC, DOCX, PPT, PPTX, TXT
- XLS, XLSX, CSV

**Archives:**
- ZIP, RAR

**Media:**
- Video: MP4, AVI, MOV, WMV, FLV, MKV
- Audio: MP3, WAV, AAC, FLAC, OGG, WMA

**Max size:** 100MB

---

## 🎨 Preview Features

- **PDF:** PDF.js viewer
- **Office Files:** Microsoft Office Viewer (embeds)
- **Video:** HTML5 video player
- **Audio:** HTML5 audio player
- **TXT:** Auto convert to PDF (PDFKit)
- **Universal:** PDFTron WebViewer (trial mode)

---

## 🗂️ Project Structure

```
├── server/
│   ├── database/
│   │   ├── schema.sql
│   │   └── sample-data.sql
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── documents.ts
│   │   │   ├── upload.ts
│   │   │   ├── convert.ts
│   │   │   └── stats.ts
│   │   ├── middleware/auth.ts
│   │   ├── config/database.ts
│   │   └── index.ts
│   └── uploads/           (file storage)
├── src/
│   ├── pages/
│   │   ├── Index.tsx      (document list)
│   │   ├── Document.tsx   (preview page)
│   │   ├── Upload.tsx     (teacher only)
│   │   └── Auth.tsx       (login/register)
│   ├── components/
│   │   ├── Layout/Header.tsx
│   │   └── WebViewer/WebViewerComponent.tsx
│   └── lib/api.ts
├── public/
│   └── webviewer/         (PDFTron library)
├── API_DOCUMENTATION.md
└── EduShare_Postman_Collection.json
```

---

## 🧪 Test Accounts

Tài khoản mẫu (password: `password123`):

**Teacher:**
```
teacher1@university.edu.vn
teacher2@university.edu.vn
```

**Student:**
```
student1@student.edu.vn
student2@student.edu.vn
student3@student.edu.vn
```

**Admin:**
```
admin@university.edu.vn
```

---

## 🔧 Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- MySQL2
- JWT Authentication
- Multer (file upload)
- PDFKit (TXT to PDF conversion)

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- Axios
- PDFTron WebViewer

---

## 🚦 Running in Production

### Environment Variables

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=studocu
JWT_SECRET=strong-secret-key
```

### Security Notes

⚠️ **IMPORTANT:**
- Passwords are stored as **plain text** in current version
- For production, implement `bcrypt` hashing
- Update CORS settings in `server/src/index.ts`
- Use strong JWT_SECRET

### Build Commands

```bash
# Frontend
npm run build

# Backend
cd server
npm run build
```

---

## 📝 Features Checklist

- [x] User authentication (JWT)
- [x] Document upload (teacher only)
- [x] Document list with search
- [x] Document preview (multiple formats)
- [x] Download tracking
- [x] Delete documents (owner only)
- [x] Duplicate title prevention
- [x] System stats

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use for educational purposes

---

## 🆘 Support

For issues and questions:
- Create GitHub Issue
- Check API Documentation
- Test with Postman collection

---

**Made with ❤️ for Education**
