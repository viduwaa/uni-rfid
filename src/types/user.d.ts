export type UserRole = 'USER' | 'STUDENT' | 'LECTURER' | 'ADMIN' | 'LIBRARIAN' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clerk_user_id: string;
  created_at: Date;
  updated_at: Date;
}