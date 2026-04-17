import { Button } from "@/components/ui/button";
import { LogIn, Sparkles, X } from "lucide-react";

interface LoginPromptModalProps {
  onLogin: () => void;
  onDismiss?: () => void;
}

export function LoginPromptModal({
  onLogin,
  onDismiss,
}: LoginPromptModalProps) {
  return (
    <div
      data-ocid="login-prompt-modal"
      className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="relative bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              You've reached the free limit
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You've used all 20 free messages. Sign in with Internet Identity
              to continue chatting with unlimited messages — it's fast and free.
            </p>
          </div>

          <Button
            data-ocid="modal-login-btn"
            onClick={onLogin}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <LogIn className="h-4 w-4" />
            Sign in with Internet Identity
          </Button>

          <p className="text-xs text-muted-foreground/50">
            No password needed — secure, private, decentralized identity
          </p>
        </div>
      </div>
    </div>
  );
}
