-- ============================================
-- DỮ LIỆU MẪU - HỆ THỐNG ĐƠN GIẢN (3 BẢNG)
-- ============================================

USE studocu;

-- Giảng viên
INSERT INTO users (email, password, full_name, role) VALUES
('teacher1@university.edu.vn', 'password123', 'TS. Nguyễn Văn A', 'teacher'),
('teacher2@university.edu.vn', 'password123', 'ThS. Trần Thị B', 'teacher');

-- Sinh viên  
INSERT INTO users (email, password, full_name, role) VALUES
('student1@student.edu.vn', 'password123', 'Nguyễn Văn A', 'student'),
('student2@student.edu.vn', 'password123', 'Trần Thị B', 'student'),
('student3@student.edu.vn', 'password123', 'Lê Văn C', 'student');

-- Admin
INSERT INTO users (email, password, full_name, role) VALUES
('admin@university.edu.vn', 'password123', 'Administrator', 'admin');

SET @teacher1_id = (SELECT id FROM users WHERE email = 'teacher1@university.edu.vn');
SET @teacher2_id = (SELECT id FROM users WHERE email = 'teacher2@university.edu.vn');

-- Tài liệu từ giáo viên 1
INSERT INTO documents (title, description, file_path, file_type, uploaded_by) VALUES
('Bài giảng Tuần 1 - Giới thiệu HTML', 'Tổng quan về HTML và cấu trúc cơ bản', '/uploads/week1_html.pdf', 'pdf', @teacher1_id),
('Bài tập Tuần 1', 'Bài tập thực hành HTML', '/uploads/week1_ex.pdf', 'pdf', @teacher1_id),
('Bài giảng Tuần 2 - CSS', 'Styling với CSS', '/uploads/week2_css.pptx', 'pptx', @teacher1_id),
('Video hướng dẫn CSS', 'Video bài giảng CSS nâng cao', '/uploads/css_video.mp4', 'mp4', @teacher1_id);

-- Tài liệu từ giáo viên 2
INSERT INTO documents (title, description, file_path, file_type, uploaded_by) VALUES
('Chương 1 - Giới thiệu CSDL', 'Các khái niệm cơ bản về CSDL', '/uploads/db_ch1.pdf', 'pdf', @teacher2_id),
('SQL Commands Reference', 'Tài liệu tham khảo các lệnh SQL', '/uploads/sql_ref.pdf', 'pdf', @teacher2_id),
('Đề thi giữa kỳ năm trước', 'Đề thi tham khảo', '/uploads/midterm.pdf', 'pdf', @teacher2_id);

SET @student1_id = (SELECT id FROM users WHERE email = 'student1@student.edu.vn');
SET @student2_id = (SELECT id FROM users WHERE email = 'student2@student.edu.vn');

SET @doc1_id = (SELECT id FROM documents WHERE title = 'Bài giảng Tuần 1 - Giới thiệu HTML' LIMIT 1);
SET @doc2_id = (SELECT id FROM documents WHERE title = 'Bài giảng Tuần 2 - CSS' LIMIT 1);

INSERT INTO downloads (user_id, document_id) VALUES
(@student1_id, @doc1_id),
(@student2_id, @doc1_id),
(@student1_id, @doc2_id);
