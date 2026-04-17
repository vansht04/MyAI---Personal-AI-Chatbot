import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogIn, LogOut } from "lucide-react";
import { useAnonymousQuota } from "../hooks/useAnonymousQuota";
import { useAuth } from "../hooks/useAuth";

interface UserSectionProps {
  collapsed?: boolean;
}

export function UserSection({ collapsed = false }: UserSectionProps) {
  const { isAuthenticated, principal, login, logout } = useAuth();
  const { quota } = useAnonymousQuota();

  const principalStr = principal?.toText() ?? "";
  const shortPrincipal =
    principalStr.length > 10
      ? `${principalStr.slice(0, 5)}...${principalStr.slice(-4)}`
      : principalStr;

  const avatarInitials = shortPrincipal.slice(0, 2).toUpperCase() || "AI";

  return (
    <div className="border-t border-border p-3 space-y-2">
      {/* Anonymous quota bar */}
      {!isAuthenticated && !collapsed && (
        <div data-ocid="quota-indicator" className="px-1 pb-1">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
            <span className="font-medium">Free messages</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                quota.isExceeded
                  ? "text-destructive-foreground"
                  : quota.remaining <= 5
                    ? "text-warning"
                    : "text-foreground",
              )}
            >
              {quota.remaining} / {quota.limit} left
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                quota.isExceeded
                  ? "bg-destructive"
                  : quota.remaining <= 5
                    ? "bg-warning"
                    : "bg-primary",
              )}
              style={{
                width: `${Math.min(100, (quota.used / quota.limit) * 100)}%`,
              }}
            />
          </div>
          {quota.isExceeded && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-tight">
              Sign in to continue chatting
            </p>
          )}
        </div>
      )}

      {/* Auth section */}
      {isAuthenticated ? (
        collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              data-ocid="logout-btn"
              aria-label="Logout"
              onClick={logout}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            data-ocid="user-info"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-smooth group"
          >
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                {shortPrincipal || "User"}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                Logged in
              </p>
            </div>
            <button
              type="button"
              data-ocid="logout-btn"
              aria-label="Logout"
              onClick={logout}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      ) : (
        <Button
          data-ocid="login-btn"
          onClick={login}
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 border-border text-foreground hover:bg-secondary hover:border-primary/40 transition-smooth",
            collapsed ? "w-9 h-9 p-0 justify-center" : "w-full",
          )}
          aria-label={collapsed ? "Sign in" : undefined}
        >
          <LogIn className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign in</span>}
        </Button>
      )}
    </div>
  );
}
