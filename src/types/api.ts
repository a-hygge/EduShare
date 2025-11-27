export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_type?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  uploader_name?: string;
  uploader_role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}
