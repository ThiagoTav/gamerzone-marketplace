export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  rating: number;
  createdAt: string;
}
