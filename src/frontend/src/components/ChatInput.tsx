import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  isPending?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type a message...",
  isPending = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled && !isPending;

  return (
    <div className="flex gap-2 p-2 bg-card border border-border rounded-2xl focus-within:border-ring transition-smooth">
      <textarea
        ref={textareaRef}
        data-ocid="chat-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 min-h-[40px] max-h-32 bg-transparent border-0 outline-none resize-none",
          "text-sm text-foreground placeholder:text-muted-foreground/50 py-2 px-2",
          "focus:outline-none focus:ring-0",
          disabled && "cursor-not-allowed opacity-50",
        )}
      />
      <Button
        type="button"
        data-ocid="send-btn"
        onClick={onSend}
        disabled={!canSend}
        size="icon"
        className={cn(
          "h-9 w-9 rounded-xl flex-shrink-0 self-end bg-primary hover:bg-primary/90 text-primary-foreground",
          "disabled:opacity-30 disabled:cursor-not-allowed transition-smooth",
        )}
        aria-label="Send message"
      >
        {isPending ? (
          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
