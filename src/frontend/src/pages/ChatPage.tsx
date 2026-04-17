import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "../components/ChatInput";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { MessageBubble } from "../components/MessageBubble";
import { QuotaBanner } from "../components/QuotaBanner";
import { ThinkingIndicator } from "../components/ThinkingIndicator";
import { useAnonymousQuota } from "../hooks/useAnonymousQuota";
import { useAuth } from "../hooks/useAuth";
import { useConversation, useSendMessage } from "../hooks/useChat";
import type { Message } from "../types";

interface ChatPageProps {
  conversationId: string | null;
}

const SUGGESTION_PROMPTS = [
  "Build me an app",
  "Write a Python function to sort a list",
  "What are the best practices for React performance?",
  "Help me draft a professional email",
  "Give me ideas for a side project",
  "Explain how neural networks work",
];

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

/** MyAI welcome icon */
function MyAIWelcomeIcon() {
  return (
    <div
      className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-md overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.68 0.22 300 / 0.15), oklch(0.68 0.22 300 / 0.05))",
        border: "1px solid oklch(0.68 0.22 300 / 0.3)",
      }}
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 w-9"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M5 20V8l4.5 6 4.5-6 4.5 6 4.5-6v12"
          stroke="oklch(0.68 0.22 300)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="22"
          cy="7"
          r="1.5"
          fill="oklch(0.78 0.18 68)"
          opacity="0.95"
        />
        <circle
          cx="22"
          cy="7"
          r="2.8"
          fill="oklch(0.78 0.18 68)"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}

function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  return (
    <div
      data-ocid="welcome-screen"
      className="flex flex-col items-center justify-center h-full px-6 py-16 text-center"
    >
      <MyAIWelcomeIcon />
      <h1 className="font-display text-3xl font-semibold text-foreground mb-3">
        How can I help you today?
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm mb-10 leading-relaxed">
        Ask me anything — I can help with coding, writing, analysis, and much
        more.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
        {SUGGESTION_PROMPTS.map((prompt) => (
          <button
            type="button"
            key={prompt}
            data-ocid="prompt-suggestion"
            onClick={() => onSelectPrompt(prompt)}
            className="text-left px-4 py-3 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-secondary transition-smooth"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      data-ocid="error-notice"
      className="flex items-start gap-3 mx-4 mb-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20"
    >
      <AlertTriangle className="h-4 w-4 text-destructive-foreground mt-0.5 flex-shrink-0" />
      <p className="text-sm text-destructive-foreground">{message}</p>
    </div>
  );
}

export function ChatPage({ conversationId }: ChatPageProps) {
  const { isAuthenticated, login } = useAuth();
  const { quota } = useAnonymousQuota();
  const { data: conversation, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage(conversationId);

  const [inputValue, setInputValue] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Ref to the scrollable native div — not a shadcn wrapper
  const scrollRef = useRef<HTMLDivElement>(null);
  // Sentinel element at the bottom of message list for scrollIntoView
  const bottomRef = useRef<HTMLDivElement>(null);

  const allMessages = [
    ...(conversation?.messages ?? []),
    ...optimisticMessages,
  ];

  // Auto-scroll to bottom only when new messages arrive or AI starts/stops thinking.
  // Using setTimeout ensures the DOM has painted before we scroll.
  const messageCount = allMessages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally tracking messageCount and isThinking as scroll triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messageCount, isThinking]);

  // Clear optimistic messages when real messages arrive
  useEffect(() => {
    if (conversation?.messages.length) {
      setOptimisticMessages([]);
    }
  }, [conversation?.messages.length]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || sendMessage.isPending || isThinking) return;
    if (!conversationId) return;
    if (!isAuthenticated && quota.isExceeded) return;

    setInputValue("");
    setIsThinking(true);
    setSendError(null);

    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content: text,
      timestamp: BigInt(Date.now()) * 1_000_000n,
    };
    setOptimisticMessages((prev) => [...prev, userMsg]);

    try {
      await sendMessage.mutateAsync(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (
        msg.toLowerCase().includes("freetier") ||
        msg.toLowerCase().includes("free tier")
      ) {
        setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        setSendError("Something went wrong. Please try again.");
        setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } finally {
      setIsThinking(false);
    }
  };

  const showQuotaGate = !isAuthenticated && quota.isExceeded;
  const inputDisabled = !conversationId || showQuotaGate;

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {conversation ? (
            <>
              <h2 className="font-display font-semibold text-foreground text-sm truncate max-w-xs">
                {conversation.title}
              </h2>
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground flex-shrink-0"
              >
                {conversation.messages.length} msgs
              </Badge>
            </>
          ) : (
            <h2 className="font-display font-semibold text-foreground text-sm">
              {conversationId ? "Loading…" : "New Conversation"}
            </h2>
          )}
        </div>

        {!isAuthenticated && !quota.isExceeded && (
          <Badge
            data-ocid="quota-badge"
            variant="outline"
            className={cn(
              "text-xs border flex-shrink-0",
              quota.used / quota.limit >= 0.7
                ? "border-warning text-warning bg-warning-muted"
                : "border-border text-muted-foreground",
            )}
          >
            {quota.remaining} free msgs left
          </Badge>
        )}
      </div>

      {/* Message thread — native overflow scroll so height calculation works */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-4 md:px-8 py-6 space-y-5 max-w-4xl mx-auto">
          {!conversationId ? (
            <WelcomeScreen onSelectPrompt={setInputValue} />
          ) : isLoading ? (
            <div className="space-y-5">
              {(["a", "b", "c"] as const).map((k) => (
                <div key={k} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1 pt-1">
                    <Skeleton className="h-3.5 w-3/4 rounded-full" />
                    <Skeleton className="h-3.5 w-1/2 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : allMessages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={setInputValue} />
          ) : (
            allMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}

          {isThinking && <ThinkingIndicator />}

          {/* Invisible sentinel — scroll target at the bottom of message list */}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {/* Login prompt modal overlay */}
      {showQuotaGate && <LoginPromptModal onLogin={login} />}

      {/* Bottom area */}
      <div className="flex-shrink-0 bg-background">
        {/* Error notice */}
        {sendError && <ErrorNotice message={sendError} />}

        {/* Quota progress banner (anonymous only, not exceeded) */}
        {!isAuthenticated && !quota.isExceeded && quota.used > 0 && (
          <QuotaBanner quota={quota} />
        )}

        {/* Input */}
        {!showQuotaGate && (
          <div className="px-4 md:px-8 pb-4 pt-3">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                disabled={inputDisabled}
                placeholder={
                  conversationId
                    ? "Type a message… (Enter to send, Shift+Enter for newline)"
                    : "Select or start a new chat to begin"
                }
                isPending={sendMessage.isPending || isThinking}
              />
              <p className="text-center text-xs text-muted-foreground/30 mt-2">
                MyAI can make mistakes. Always verify important information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
