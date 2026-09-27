export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ListingDraft {
  title: string;
  description: string;
  specs: { key: string; value: string }[];
}

export interface ReviewSummary {
  pros: string[];
  cons: string[];
  reviewCount: number;
  generatedAt: string;
}
