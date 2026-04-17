import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ConversationId = bigint;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type SendMessageResult = {
    __kind__: "ok";
    ok: Message;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "unauthorized";
    unauthorized: null;
} | {
    __kind__: "freeTierLimitReached";
    freeTierLimitReached: null;
};
export interface Message {
    content: string;
    role: MessageRole;
    timestamp: Timestamp;
}
export interface ConversationSummary {
    id: bigint;
    title: string;
    createdAt: bigint;
    updatedAt: bigint;
    messageCount: bigint;
}
export interface Conversation {
    id: ConversationId;
    title: string;
    messages: Array<Message>;
    owner: Principal;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum MessageRole {
    user = "user",
    assistant = "assistant"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createConversation(): Promise<ConversationId>;
    deleteConversation(id: ConversationId): Promise<boolean>;
    getAnonymousMessageCount(): Promise<bigint>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(id: ConversationId): Promise<Conversation | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listConversations(): Promise<Array<ConversationSummary>>;
    sendMessage(conversationId: ConversationId, text: string): Promise<SendMessageResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateConversationTitle(conversationId: ConversationId, newTitle: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
