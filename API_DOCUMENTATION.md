# API Documentation - EduShare Backend

## Base URL
```
http://localhost:3000/api
```

## Authentication
Sử dụng JWT Bearer Token trong header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 1. Authentication APIs

### 1.1 Đăng ký (Register)
```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "teacher@university.edu.vn",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "role": "teacher" // hoặc "student"
}
```

**Response:** 
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "teacher@university.edu.vn",
    "full_name": "Nguyễn Văn A",
    "role": "teacher"
  }
}
```

---

### 1.2 Đăng nhập (Login)
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "teacher@university.edu.vn",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "teacher@university.edu.vn",
    "full_name": "Nguyễn Văn A",
    "role": "teacher"
  }
}
```

---

### 1.3 Lấy thông tin user hiện tại
```
GET /api/auth/me
```

**Headers:** Authorization required

**Response:**
```json
{
  "id": "uuid",
  "email": "teacher@university.edu.vn",
  "full_name": "Nguyễn Văn A",
  "role": "teacher",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

---

## 2. Document APIs

### 2.1 Lấy danh sách tài liệu
```
GET /api/documents?search=HTML&limit=20&offset=0
```

**Query params:**
- `search` (optional): Tìm kiếm theo title hoặc description
- `limit` (optional): Số lượng kết quả (default: 20)
- `offset` (optional): Vị trí bắt đầu (default: 0)

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Bài giảng HTML",
      "description": "Giới thiệu HTML cơ bản",
      "file_path": "/api/uploads/filename.pdf",
      "file_type": "application/pdf",
      "uploaded_by": "uuid",
      "uploader_name": "TS. Nguyễn Văn A",
      "uploader_role": "teacher",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "limit": 20,
  "offset": 0
}
```

---

### 2.2 Lấy chi tiết tài liệu
```
GET /api/documents/:id
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Bài giảng HTML",
  "description": "Giới thiệu HTML cơ bản",
  "file_path": "/api/uploads/filename.pdf",
  "file_type": "application/pdf",
  "uploaded_by": "uuid",
  "uploader_name": "TS. Nguyễn Văn A",
  "uploader_email": "teacher@university.edu.vn",
  "uploader_role": "teacher",
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

---

### 2.3 Upload tài liệu (Chỉ giáo viên)
**Bước 1: Upload file**
```
POST /api/uploads/upload
Content-Type: multipart/form-data
```

**Headers:** Authorization required (teacher only)

**Body (FormData):**
```javascript
const formData = new FormData();
formData.append('file', fileObject);
```

**Response:**
```json
{
  "success": true,
  "file": {
    "filename": "document-1234567890-123456789.pdf",
    "originalname": "document.pdf",
    "path": "/api/uploads/document-1234567890-123456789.pdf",
    "size": 1024000,
    "mimetype": "application/pdf"
  }
}
```

**Bước 2: Tạo document record**
```
POST /api/documents
```

**Headers:** Authorization required (teacher only)

**Body:**
```json
{
  "title": "Bài giảng HTML",
  "description": "Giới thiệu HTML cơ bản",
  "file_path": "/api/uploads/document-1234567890-123456789.pdf",
  "file_type": "application/pdf"
}
```

**Response:**
```json
{
  "id": "uuid",
  "message": "Upload tài liệu thành công"
}
```

**Lưu ý:**
- Duplicate check: Nếu giáo viên đã có tài liệu với cùng title → Error 409
- File types hỗ trợ: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, XLS, XLSX, CSV, MP4, AVI, MOV, WMV, FLV, MKV, MP3, WAV, AAC, FLAC, OGG, WMA
- Max size: 100MB

---

### 2.4 Cập nhật tài liệu (Chỉ chủ sở hữu)
```
PUT /api/documents/:id
```

**Headers:** Authorization required (teacher, owner only)

**Body:**
```json
{
  "title": "Bài giảng HTML - Updated",
  "description": "Nội dung mới"
}
```

**Response:**
```json
{
  "message": "Cập nhật tài liệu thành công"
}
```

---

### 2.5 Xóa tài liệu (Chỉ chủ sở hữu)
```
DELETE /api/documents/:id
```

**Headers:** Authorization required (teacher, owner only)

**Response:**
```json
{
  "message": "Xóa tài liệu thành công"
}
```

---

### 2.6 Tracking download
```
POST /api/documents/:id/download
```

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Đã ghi nhận lượt tải. Sinh viên có thể tải không giới hạn!"
}
```

**Lưu ý:** Chỉ để tracking, không giới hạn số lần download

---

### 2.7 Thống kê tài liệu của giáo viên
```
GET /api/documents/teacher/stats
```

**Headers:** Authorization required (teacher only)

**Response:**
```json
{
  "stats": {
    "total_documents": 10,
    "total_downloads": 150
  },
  "recent_documents": [
    {
      "id": "uuid",
      "title": "Bài giảng HTML",
      "created_at": "2025-01-01T00:00:00.000Z",
      "downloads_count": 25
    }
  ]
}
```

---

## 3. File Serving APIs

### 3.1 Download file
```
GET /api/uploads/:filename
```

**Response:** File download với headers:
```
Content-Disposition: attachment; filename="original-name.pdf"
Content-Type: application/octet-stream
```

---

## 4. Conversion APIs

### 4.1 Convert TXT to PDF
```
GET /api/convert/txt-to-pdf?filePath=/api/uploads/file.txt
```

**Query params:**
- `filePath`: Đường dẫn file TXT cần convert

**Response:** PDF stream
```
Content-Type: application/pdf
Content-Disposition: inline; filename="file.pdf"
```

**Lưu ý:** Dùng cho WebViewer preview TXT files

---

## 5. Stats APIs

### 5.1 Thống kê tổng quan hệ thống
```
GET /api/stats
```

**Response:**
```json
{
  "total_users": 100,
  "total_documents": 50,
  "total_downloads": 500,
  "total_teachers": 10,
  "total_students": 90
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Token không hợp lệ"
}
```

### 403 Forbidden
```json
{
  "error": "Chỉ giáo viên mới có thể upload tài liệu"
}
```

### 404 Not Found
```json
{
  "error": "Không tìm thấy tài liệu"
}
```

### 409 Conflict
```json
{
  "error": "Bạn đã có tài liệu với tiêu đề này rồi"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Example Frontend Integration

### Setup Axios
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Login Example
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Upload Document Example
```typescript
const handleUpload = async (file: File, title: string, description: string) => {
  try {
    // Step 1: Upload file
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadRes = await fetch('http://localhost:3000/api/uploads/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const uploadData = await uploadRes.json();
    
    // Step 2: Create document
    await api.post('/documents', {
      title,
      description,
      file_path: uploadData.file.path,
      file_type: uploadData.file.mimetype,
    });
    
    console.log('Upload successful!');
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Download Example
```typescript
const handleDownload = async (documentId: string, filePath: string) => {
  try {
    // Track download
    await api.post(`/documents/${documentId}/download`);
    
    // Download file
    const fileUrl = `http://localhost:3000${filePath}`;
    window.location.href = fileUrl;
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=studocu
```

---

## Notes

1. **Authentication**: Tất cả các route cần auth đều check JWT token
2. **File Upload**: Max size 100MB, 19 file formats hỗ trợ
3. **Duplicate Prevention**: Check title + uploaded_by (giáo viên không thể upload 2 tài liệu cùng tên)
4. **Download Tracking**: Không giới hạn, chỉ để thống kê
5. **CORS**: Enabled cho localhost:6868 và localhost:6869
