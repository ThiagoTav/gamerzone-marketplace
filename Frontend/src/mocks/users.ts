/**
 * Mock Users
 * Formato do objeto User (usado como referência p/ modelagem do backend):
 * {
 *   id: string,
 *   name: string,
 *   email: string,
 *   password: string,        // apenas mock, nunca fazer isso em produção
 *   avatar?: string,
 *   rating: number,          // média de avaliações do vendedor (0-5)
 *   createdAt: string (ISO)
 * }
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  rating: number;
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "GamerStore BR",
    email: "gamerstore@test.com",
    password: "123456",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=gamerstore",
    rating: 4.8,
    createdAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "u2",
    name: "TechPro Setups",
    email: "techpro@test.com",
    password: "123456",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=techpro",
    rating: 4.6,
    createdAt: "2023-03-22T10:00:00Z",
  },
  {
    id: "u3",
    name: "NeonGear",
    email: "neongear@test.com",
    password: "123456",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=neongear",
    rating: 4.9,
    createdAt: "2022-11-05T10:00:00Z",
  },
  {
    id: "u4",
    name: "Você (Teste)",
    email: "teste@test.com",
    password: "123456",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=teste",
    rating: 5.0,
    createdAt: "2024-06-01T10:00:00Z",
  },
];
