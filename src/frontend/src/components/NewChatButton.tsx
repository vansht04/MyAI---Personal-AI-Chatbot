import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface NewChatButtonProps {
  onClick: () => void;
  collapsed?: boolean;
  className?: string;
}

export function NewChatButton({
  onClick,
  collapsed = false,
  className,
}: NewChatButtonProps) {
  return (
    <Button
      data-ocid="new-chat-btn"
      onClick={onClick}
      size="sm"
      className={cn(
        "gap-2 bg-primary hover:bg-primary/85 text-primary-foreground font-medium transition-smooth",
        "shadow-sm hover:shadow-md active:scale-[0.97]",
        collapsed ? "w-9 h-9 p-0 justify-center" : "w-full",
        className,
      )}
      aria-label={collapsed ? "New chat" : undefined}
    >
      <Plus className={cn("h-4 w-4 flex-shrink-0", !collapsed && "-ml-0.5")} />
      {!collapsed && <span>New Chat</span>}
    </Button>
  );
}
