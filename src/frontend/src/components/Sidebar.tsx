import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Menu, MessageSquarePlus, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { useConversations } from "../hooks/useConversations";
import { ConversationItem } from "./ConversationItem";
import { NewChatButton } from "./NewChatButton";
import { UserSection } from "./UserSection";

interface SidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

/** MyAI logo mark — used in sidebar header */
function MyAILogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className={cn("flex items-center gap-2.5", collapsed && "justify-center")}
    >
      <div
        className="flex-shrink-0 h-7 w-7 rounded-lg overflow-hidden shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.68 0.22 300), oklch(0.55 0.26 310))",
        }}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
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
      {!collapsed && (
        <span
          className="font-display font-bold text-foreground tracking-tight flex-1"
          style={{ letterSpacing: "-0.02em" }}
        >
          My<span style={{ color: "oklch(0.68 0.22 300)" }}>AI</span>
        </span>
      )}
    </div>
  );
}

/** Compact sun/moon theme toggle button */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      data-ocid="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
        "transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      )}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 flex-shrink-0 text-accent" />
          <span>Light mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 flex-shrink-0 text-primary" />
          <span>Dark mode</span>
        </>
      )}
    </button>
  );
}

/** Search bar for filtering conversations */
function ConversationSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        data-ocid="conversation-search-input"
        type="search"
        placeholder="Search conversations…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full pl-8 pr-7 py-1.5 text-sm rounded-lg",
          "bg-secondary/60 border border-border/60 text-foreground placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50",
          "transition-smooth",
        )}
      />
      {value && (
        <button
          type="button"
          data-ocid="conversation-search-clear"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function Sidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isOpen = true,
  onToggle,
}: SidebarProps) {
  const {
    conversations,
    isLoading,
    deleteConversation,
    updateConversationTitle,
  } = useConversations();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  // Close sidebar when navigating on mobile
  const handleSelect = (id: string) => {
    onSelectConversation(id);
    if (isMobile && onToggle) onToggle();
  };

  const handleNewChat = () => {
    onNewChat();
    if (isMobile && onToggle) onToggle();
  };

  // Close on Escape (only when not searching)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && isOpen && onToggle) onToggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isMobile, isOpen, onToggle]);

  const sidebarVisible = isMobile ? isOpen : true;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm w-full cursor-default border-none"
          onClick={onToggle}
          onKeyDown={(e) => e.key === "Escape" && onToggle?.()}
        />
      )}

      {/* Mobile hamburger toggle */}
      {isMobile && !isOpen && (
        <button
          type="button"
          data-ocid="sidebar-toggle"
          aria-label="Open sidebar"
          onClick={onToggle}
          className="fixed top-3 left-3 z-40 p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth shadow-sm"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Sidebar panel */}
      <aside
        data-ocid="sidebar"
        aria-label="Conversation sidebar"
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border flex-shrink-0 transition-all duration-300",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 z-40 w-72 shadow-2xl",
                sidebarVisible ? "translate-x-0" : "-translate-x-full",
              )
            : "w-64",
        )}
      >
        {/* Header: Logo + close on mobile */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
          <MyAILogo />
          {isMobile && (
            <button
              type="button"
              data-ocid="sidebar-close"
              aria-label="Close sidebar"
              onClick={onToggle}
              className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* New Chat button */}
        <div className="px-3 pt-3 pb-2">
          <NewChatButton onClick={handleNewChat} />
        </div>

        {/* Search bar — only show when there are conversations or a query is active */}
        {(conversations.length > 0 || searchQuery) && (
          <div className="px-3 pb-2">
            <ConversationSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        )}

        {/* Conversation list */}
        <ScrollArea className="flex-1 px-2 py-1">
          {isLoading ? (
            <div className="space-y-1.5 px-1 pt-1">
              {(["sk1", "sk2", "sk3", "sk4"] as const).map((key) => (
                <Skeleton
                  key={key}
                  className="h-[60px] rounded-lg bg-secondary/60"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div
              data-ocid="empty-conversations"
              className="flex flex-col items-center justify-center py-14 px-4 text-center"
            >
              <div className="h-12 w-12 rounded-2xl bg-secondary/60 flex items-center justify-center mb-3">
                <MessageSquarePlus className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1 leading-relaxed">
                Hit New Chat to start your first conversation
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div
              data-ocid="no-search-results"
              className="flex flex-col items-center justify-center py-10 px-4 text-center"
            >
              <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                No conversations found
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 py-1">
              {filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  onSelect={handleSelect}
                  onDelete={deleteConversation}
                  onRenameTitle={(id, newTitle) =>
                    updateConversationTitle({ id, newTitle })
                  }
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Theme toggle */}
        <div className="px-3 pb-1 border-t border-sidebar-border pt-2">
          <ThemeToggle />
        </div>

        {/* User / auth section */}
        <UserSection />
      </aside>
    </>
  );
}
