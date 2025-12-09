export type AppRole = 'comprador' | 'vendedor' | 'administrador';

export interface UserProfile {
  id: string;
  name: string | null;
  lastname: string | null;
  email: string | null;
  cell: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}
