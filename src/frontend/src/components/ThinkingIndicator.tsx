import { Bot } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <div
      data-ocid="thinking-indicator"
      className="flex gap-3 mr-auto max-w-3xl"
    >
      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary flex items-center justify-center mt-1 shadow-sm">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          <span
            className="h-2 w-2 rounded-full bg-primary/70 animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary/70 animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "1s" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary/70 animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "1s" }}
          />
        </div>
      </div>
    </div>
  );
}
