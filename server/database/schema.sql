DROP DATABASE IF EXISTS studocu;

CREATE DATABASE IF NOT EXISTS studocu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE studocu;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  file_type VARCHAR(255),
  uploaded_by VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (uploaded_by) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_title (title),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at),
  UNIQUE KEY unique_document (title, uploaded_by)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS downloads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  document_id VARCHAR(36) NOT NULL,
  downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
        
  FOREIGN KEY (document_id) REFERENCES documents(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  INDEX idx_user_id (user_id),
  INDEX idx_document_id (document_id),
  INDEX idx_downloaded_at (downloaded_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
