import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

function formatTime(timestamp: bigint): string {
  try {
    return formatDistanceToNow(new Date(Number(timestamp / 1_000_000n)), {
      addSuffix: true,
    });
  } catch {
    return "";
  }
}

/** Compact MyAI logo icon for message bubbles */
function MyAIBubbleIcon() {
  return (
    <div
      className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center mt-1 shadow-sm overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.68 0.22 300), oklch(0.55 0.26 310))",
      }}
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M5 20V8l4.5 6 4.5-6 4.5 6 4.5-6v12"
          stroke="oklch(0.78 0.18 68)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="22"
          cy="7"
          r="1.5"
          fill="oklch(0.78 0.18 68)"
          opacity="0.9"
        />
        <circle
          cx="22"
          cy="7"
          r="2.5"
          fill="oklch(0.78 0.18 68)"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time = formatTime(message.timestamp);

  return (
    <div
      data-ocid="message-bubble"
      className={cn(
        "flex gap-3 max-w-3xl group",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {!isUser && <MyAIBubbleIcon />}

      <div
        className={cn(
          "flex flex-col gap-1.5",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
              : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm",
          )}
        >
          <p className="whitespace-pre-wrap break-words min-w-0">
            {message.content}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-1",
            isUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          {!isUser && (
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.68 0.22 300 / 0.8)" }}
            >
              MyAI
            </span>
          )}
          {!isUser && time && (
            <span className="text-muted-foreground/40">·</span>
          )}
          {time && (
            <span className="text-xs text-muted-foreground/50">{time}</span>
          )}
          {isUser && time && (
            <span className="text-muted-foreground/40">·</span>
          )}
          {isUser && (
            <span className="text-xs font-medium text-muted-foreground/60">
              You
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
