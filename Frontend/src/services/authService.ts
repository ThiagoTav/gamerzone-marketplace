/**
 * authService — autenticação mockada.
 *
 * Contrato:
 *   login(email, password) -> Promise<{ user, token }>
 *   register(data)         -> Promise<{ user, token }>
 *   logout()               -> Promise<void>
 *   getCurrentUser()       -> User | null (síncrono)
 *   getSellerById(id)      -> Promise<User | null>
 */

import { mockUsers, User } from "@/mocks/users";

const USERS_KEY = "marketplace_users";
const SESSION_KEY = "marketplace_session";
const LATENCY = 300;

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), LATENCY));

function loadUsers(): User[] {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  return mockUsers;
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export interface AuthResult {
  user: Omit<User, "password">;
  token: string;
}

function sanitize(u: User): Omit<User, "password"> {
  const { password, ...rest } = u;
  return rest;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const user = loadUsers().find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("E-mail ou senha inválidos");
    const result: AuthResult = { user: sanitize(user), token: `mock-token-${user.id}` };
    localStorage.setItem(SESSION_KEY, JSON.stringify(result));
    return delay(result);
  },

  async register(data: { name: string; email: string; password: string }): Promise<AuthResult> {
    const users = loadUsers();
    if (users.some((u) => u.email === data.email)) throw new Error("E-mail já cadastrado");
    const newUser: User = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.email}`,
      rating: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const result: AuthResult = { user: sanitize(newUser), token: `mock-token-${newUser.id}` };
    localStorage.setItem(SESSION_KEY, JSON.stringify(result));
    return delay(result);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
    return delay(undefined);
  },

  getCurrentUser(): Omit<User, "password"> | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return (JSON.parse(stored) as AuthResult).user;
    } catch {
      return null;
    }
  },

  async getSellerById(id: string): Promise<Omit<User, "password"> | null> {
    const user = loadUsers().find((u) => u.id === id);
    return delay(user ? sanitize(user) : null);
  },
};
