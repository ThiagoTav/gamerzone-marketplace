/**
 * uploadService — envio de imagens pro Backend (multipart).
 *
 * Contrato:
 *   uploadImages(files) -> Promise<string[]> (URLs relativas)
 */

import { apiFetch } from "@/lib/api";

export const uploadService = {
  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const { urls } = await apiFetch<{ urls: string[] }>("/uploads", {
      method: "POST",
      body: formData,
    });
    return urls;
  },
};
