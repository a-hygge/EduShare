# 📚 HỆ THỐNG SIÊU ĐƠN GIẢN: GIẢNG VIÊN - SINH VIÊN

## 🎯 MỤC ĐÍCH

Hệ thống **CỰC KỲ ĐƠN GIẢN** cho phép:
- ✅ **Giảng viên** upload tài liệu
- ✅ **Sinh viên** tải tài liệu **KHÔNG GIỚI HẠN**

Không có gì phức tạp. Chỉ vậy thôi!

---

## 📊 DATABASE (6 BẢNG DUY NHẤT)

```
1. profiles          - Users (teacher/student/admin)
2. subjects          - Môn học
3. subject_teachers  - Giảng viên dạy môn nào
4. subject_students  - Sinh viên đăng ký môn nào
5. documents         - Tài liệu
6. downloads         - Log tải tài liệu
```

**Không có:**
- ❌ Likes, Comments, Chat
- ❌ AI features
- ❌ Premium, Points, Earnings
- ❌ Views count, Ratings
- ❌ Universities, Instructors (riêng biệt)

---

## 🚀 CÀI ĐẶT (3 BƯỚC)

### 1. Setup Database

```bash
# Chạy trong MySQL
mysql -u root -p < server/database/schema-simple.sql
mysql -u root -p < server/database/sample-data-ultra-simple.sql
```

### 2. Config Backend

```bash
cd server
cp .env.example .env
# Sửa password MySQL trong .env
```

File `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=studocu

JWT_SECRET=any-random-string
PORT=3000
```

### 3. Chạy

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
npm install
npm run dev
```

**Done!** Mở http://localhost:6868

---

## 📡 API (Cực đơn giản)

### Auth
```
POST /api/auth/register    # email, password, full_name, role
POST /api/auth/login       # email, password
GET  /api/auth/me
```

### Documents
```
GET    /api/documents           # List (student chỉ thấy môn đã đăng ký)
POST   /api/documents           # Upload (teacher only)
PUT    /api/documents/:id       # Update (owner only)
DELETE /api/documents/:id       # Delete (owner only)
POST   /api/documents/:id/download  # Tải (KHÔNG GIỚI HẠN)
```

### Subjects
```
GET    /api/subjects                # All
GET    /api/subjects/my-subjects    # Student's enrolled
GET    /api/subjects/teaching       # Teacher's teaching
POST   /api/subjects/:id/enroll     # Enroll (student)
DELETE /api/subjects/:id/enroll     # Unenroll
```

---

## 🔑 PHÂN QUYỀN ĐƠN GIẢN

### 👨‍🏫 Teacher (Giảng viên)
- Upload tài liệu
- Sửa/Xóa tài liệu của mình
- Xem thống kê downloads

### 👨‍🎓 Student (Sinh viên)
- Đăng ký môn học
- Xem tài liệu (chỉ môn đã đăng ký)
- **Tải KHÔNG GIỚI HẠN**

### 🔧 Admin
- (Dự phòng cho sau)

---

## 💡 FLOW ĐƠN GIẢN

```
1. Sinh viên đăng ký tài khoản (role: student)
2. Sinh viên đăng ký môn học
3. Giảng viên upload tài liệu vào môn học
4. Sinh viên vào môn học → Thấy tài liệu
5. Sinh viên tải tài liệu (không giới hạn, không cần điểm)
```

**Không có:**
- Không cần like/comment
- Không cần premium
- Không cần tích điểm
- Chỉ cần: Upload và Download!

---

## 🗂️ CẤU TRÚC FILES

```
server/
├── database/
│   ├── schema-simple.sql              ← DATABASE CHÍNH
│   └── sample-data-ultra-simple.sql   ← DỮ LIỆU MẪU
├── src/
│   ├── routes/
│   │   ├── auth-ultra-simple.ts       ← AUTH
│   │   ├── documents-ultra-simple.ts  ← DOCUMENTS
│   │   └── subjects-ultra-simple.ts   ← SUBJECTS
│   ├── middleware/auth.ts
│   ├── config/database.ts
│   └── index-ultra-simple.ts          ← SERVER ENTRY
└── .env.example
```

---

## 🧪 TEST

Tài khoản mẫu trong sample-data:

```javascript
// Teacher
email: teacher1@university.edu.vn
// Student  
email: student1@student.edu.vn

// Password cần tạo qua /api/auth/register
// vì chưa có trong sample data (cần hash bcrypt)
```

### Test flow:

1. **Đăng ký** tài khoản teacher và student mới
2. **Giảng viên** upload tài liệu vào môn
3. **Sinh viên** đăng ký môn học
4. **Sinh viên** xem và tải tài liệu (unlimited!)

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Password Storage
Schema hiện tại **KHÔNG có cột password_hash** trong bảng `profiles` (để đơn giản).

**Cách xử lý:**

**Option 1 (Khuyến nghị):** Thêm cột password
```sql
ALTER TABLE profiles ADD COLUMN password_hash VARCHAR(255);
```

**Option 2:** Tạo bảng credentials riêng
```sql
CREATE TABLE credentials (
  user_id VARCHAR(36) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
```

**Option 3 (Dev only):** Tạm bỏ qua password check trong `auth-ultra-simple.ts`

---

## 📝 TO-DO (Nếu muốn hoàn thiện)

- [ ] Thêm column `password_hash` vào `profiles`
- [ ] Hoàn thiện auth login với bcrypt
- [ ] Setup file upload (Multer + Local storage hoặc S3)
- [ ] Thêm preview PDF/PPTX
- [ ] Frontend pages: Auth, Upload, Documents List

---

## 🎉 KẾT LUẬN

Đây là phiên bản **SIÊU ĐƠN GIẢN NHẤT** có thể:

```
Teacher → Upload
Student → Download (Unlimited)
```

**Không có gì phức tạp hơn!**

---

**Bắt đầu từ file:** `schema-simple.sql`
**Chạy server:** `index-ultra-simple.ts`
**Routes:** `*-ultra-simple.ts`

Good luck! 🚀
