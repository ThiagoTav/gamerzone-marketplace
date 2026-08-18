import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve ter ao menos uma letra minúscula")
  .regex(/[^A-Za-z0-9]/, "A senha deve ter ao menos um caractere especial");

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  // Não reaplica a política de força aqui: contas antigas podem ter senha
  // fora do padrão atual, e quem decide se está certa é o bcrypt.compare.
  password: z.string().min(1),
});

export const checkEmailSchema = z.object({
  email: z.string().email(),
});
