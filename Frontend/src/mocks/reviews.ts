/**
 * Mock Reviews
 * Formato do objeto Review:
 * { id, productId, authorName, rating (1-5), comment, createdAt }
 */

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const mockReviews: Review[] = [
  { id: "r1", productId: "p1", authorName: "João Silva", rating: 5, comment: "Melhor teclado que já tive!", createdAt: "2024-09-10T10:00:00Z" },
  { id: "r2", productId: "p1", authorName: "Maria Souza", rating: 4, comment: "Muito bom, mas o software poderia ser melhor.", createdAt: "2024-09-12T10:00:00Z" },
  { id: "r3", productId: "p1", authorName: "Pedro Costa", rating: 5, comment: "Perfeito para jogos competitivos.", createdAt: "2024-09-15T10:00:00Z" },
  { id: "r4", productId: "p2", authorName: "Ana Lima", rating: 5, comment: "Mouse leve e preciso!", createdAt: "2024-09-11T10:00:00Z" },
  { id: "r5", productId: "p3", authorName: "Carlos Dias", rating: 4, comment: "Som muito bom, confortável.", createdAt: "2024-09-14T10:00:00Z" },
  { id: "r6", productId: "p4", authorName: "Roberto Alves", rating: 5, comment: "Monitor incrível, cores excelentes.", createdAt: "2024-09-16T10:00:00Z" },
  { id: "r7", productId: "p5", authorName: "Fernanda Rocha", rating: 5, comment: "Cadeira super confortável para longas horas.", createdAt: "2024-09-18T10:00:00Z" },
  { id: "r8", productId: "p8", authorName: "Lucas Mendes", rating: 5, comment: "Bateria dura muito!", createdAt: "2024-09-20T10:00:00Z" },
  { id: "r9", productId: "p10", authorName: "Julia Ferreira", rating: 5, comment: "Ultrawide vale muito a pena!", createdAt: "2024-09-22T10:00:00Z" },
];
