export interface User {
  login: string;
  password: string;
  id?: string | null;
  avatarUrl?: string | null;
}