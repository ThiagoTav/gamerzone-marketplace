import { z } from "zod";

export interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  { label: "Mínimo de 8 caracteres", test: (pw) => pw.length >= 8 },
  { label: "Uma letra maiúscula", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Uma letra minúscula", test: (pw) => /[a-z]/.test(pw) },
  { label: "Um caractere especial", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export const passwordSchema = z.string().refine((pw) => passwordRules.every((rule) => rule.test(pw)), {
  message: "A senha não atende aos requisitos mínimos",
});
