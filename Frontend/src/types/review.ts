export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
