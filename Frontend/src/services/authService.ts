/**
 * authService — autenticação via API real (sessão em cookie httpOnly).
 *
 * Contrato:
 *   login(email, password) -> Promise<{ user }>
 *   register(data)         -> Promise<{ user }>
 *   logout()               -> Promise<void>
 *   getCurrentUser()       -> Promise<User | null>
 *   getSellerById(id)      -> Promise<User | null>
 */

import { apiFetch } from "@/lib/api";
import type { User } from "@/types/user";

export interface AuthResult {
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    return apiFetch<AuthResult>("/auth/login", { method: "POST", body: { email, password } });
  },

  async register(data: { name: string; email: string; password: string }): Promise<AuthResult> {
    return apiFetch<AuthResult>("/auth/register", { method: "POST", body: data });
  },

  async logout(): Promise<void> {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  },

  async getCurrentUser(): Promise<User | null> {
    const { user } = await apiFetch<{ user: User | null }>("/auth/me");
    return user;
  },

  async getSellerById(id: string): Promise<User | null> {
    try {
      return await apiFetch<User>(`/users/${id}`);
    } catch {
      return null;
    }
  },
};
