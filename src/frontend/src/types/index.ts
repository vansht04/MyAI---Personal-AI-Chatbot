// Frontend ConversationId is always stored as string (converted from backend bigint)
export type ConversationId = string;

export interface Message {
  // id is synthetic — generated on frontend for React keys (timestamp + index based)
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: bigint;
}

export interface Conversation {
  id: ConversationId;
  title: string;
  messages: Message[];
  createdAt: bigint;
  updatedAt: bigint;
}

export interface ConversationSummary {
  id: ConversationId;
  title: string;
  messageCount: bigint;
  updatedAt: bigint;
}

export type SendMessageResult =
  | { __kind__: "ok"; ok: Message }
  | { __kind__: "notFound"; notFound: null }
  | { __kind__: "unauthorized"; unauthorized: null }
  | { __kind__: "freeTierLimitReached"; freeTierLimitReached: null };

export interface AnonymousQuota {
  used: number;
  limit: number;
  remaining: number;
  isExceeded: boolean;
}
