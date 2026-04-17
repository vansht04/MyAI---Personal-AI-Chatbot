import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Check, Loader2, MessageSquare, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ConversationSummary } from "../types";

interface ConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRenameTitle: (id: string, newTitle: string) => Promise<void>;
}

function formatTime(timestamp: bigint): string {
  try {
    const ms = Number(timestamp / 1_000_000n);
    return formatDistanceToNow(new Date(ms), { addSuffix: true });
  } catch {
    return "";
  }
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRenameTitle,
}: ConversationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(conversation.title);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external title changes while not in edit mode
  useEffect(() => {
    if (!isEditing) {
      setEditValue(conversation.title);
    }
  }, [conversation.title, isEditing]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(conversation.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(conversation.title);
    setSaveError(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditValue(conversation.title);
    setIsEditing(false);
    setSaveError(false);
  };

  const commitEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === conversation.title) {
      cancelEdit();
      return;
    }
    setIsSaving(true);
    setSaveError(false);
    try {
      await onRenameTitle(conversation.id, trimmed);
      setIsEditing(false);
    } catch {
      setSaveError(true);
      setEditValue(conversation.title);
      setIsEditing(false);
      // Clear error indicator after 2s
      setTimeout(() => setSaveError(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div
      data-ocid="conversation-item"
      className={cn(
        "group relative flex items-start gap-2 px-2 py-2.5 rounded-lg transition-smooth cursor-pointer",
        "hover:bg-secondary/70",
        isActive
          ? "bg-secondary border border-primary/30 shadow-sm"
          : "border border-transparent",
        saveError && "border-destructive/40",
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-primary" />
      )}

      {/* Title area / edit input */}
      <div className="flex items-start gap-2.5 flex-1 min-w-0 pl-1">
        {isSaving ? (
          <Loader2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary animate-spin" />
        ) : (
          <MessageSquare
            className={cn(
              "mt-0.5 h-3.5 w-3.5 flex-shrink-0 transition-smooth",
              isActive ? "text-primary" : "text-muted-foreground",
              saveError && "text-destructive",
            )}
          />
        )}

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              data-ocid="conversation-title-input"
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitEdit}
              disabled={isSaving}
              className={cn(
                "w-full text-sm font-medium leading-tight rounded px-1 py-0.5 -mx-1",
                "bg-background border border-primary/50 text-foreground",
                "focus:outline-none focus:ring-1 focus:ring-primary",
                "transition-smooth",
                isSaving && "opacity-60 cursor-not-allowed",
              )}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <button
              type="button"
              data-ocid="conversation-title-btn"
              onClick={() => onSelect(conversation.id)}
              onDoubleClick={startEdit}
              title="Click to open · Double-click to rename"
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "text-sm font-medium truncate leading-tight transition-smooth text-left w-full",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded",
                isActive ? "text-foreground" : "text-foreground/80",
                saveError && "text-destructive",
              )}
            >
              {conversation.title}
            </button>
          )}

          {conversation.messageCount > 0n && (
            <p className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
              {String(conversation.messageCount)} message
              {conversation.messageCount === 1n ? "" : "s"}
            </p>
          )}
          <p className="text-xs text-muted-foreground/50 mt-1">
            {formatTime(conversation.updatedAt)}
          </p>
        </div>
      </div>

      {/* Action buttons — shown on hover or when editing */}
      <div
        className={cn(
          "flex items-center gap-0.5 flex-shrink-0 transition-smooth",
          isEditing
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        )}
      >
        {isEditing ? (
          <>
            {/* Cancel edit */}
            <button
              type="button"
              data-ocid="conversation-edit-cancel"
              aria-label="Cancel rename"
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                cancelEdit();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Confirm edit */}
            <button
              type="button"
              data-ocid="conversation-edit-confirm"
              aria-label="Save rename"
              onMouseDown={(e) => {
                e.preventDefault();
                commitEdit();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            {/* Rename button */}
            <button
              type="button"
              data-ocid="conversation-rename-btn"
              aria-label="Rename conversation"
              onClick={startEdit}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>

            {/* Delete button with confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  data-ocid="delete-conversation-btn"
                  aria-label="Delete conversation"
                  disabled={isDeleting}
                  className={cn(
                    "p-1.5 rounded-md text-muted-foreground transition-smooth",
                    "hover:text-destructive-foreground hover:bg-destructive/20",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isDeleting && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Delete conversation?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    &ldquo;{conversation.title}&rdquo; will be permanently
                    deleted. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    data-ocid="delete-cancel-btn"
                    className="bg-secondary border-border text-foreground hover:bg-secondary/80"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="delete-confirm-btn"
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
