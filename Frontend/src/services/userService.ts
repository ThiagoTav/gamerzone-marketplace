/**
 * userService — perfil do usuário logado e busca pública de vendedores.
 *
 * Contrato:
 *   searchSellers(search?)               -> Promise<User[]>
 *   updateProfile(patch)                 -> Promise<User>
 *   changePassword(current, newPassword) -> Promise<void>
 *   uploadAvatar(file)                   -> Promise<string> (URL relativa)
 */

import { apiFetch } from "@/lib/api";
import type { User } from "@/types/user";

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  avatar?: string;
}

export const userService = {
  async searchSellers(search = ""): Promise<User[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiFetch<User[]>(`/users${qs}`);
  },

  async updateProfile(patch: UpdateProfileInput): Promise<User> {
    return apiFetch<User>("/users/me", { method: "PUT", body: patch });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiFetch<void>("/users/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    });
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { url } = await apiFetch<{ url: string }>("/uploads/avatar", {
      method: "POST",
      body: formData,
    });
    return url;
  },
};
