import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";

export function AdminPage() {
  const navigate = useNavigate();

  return (
    <div data-ocid="admin-page" className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0 flex items-center gap-3">
        <Button
          data-ocid="admin-back-btn"
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/" })}
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to chat"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            About MyAI
          </h1>
          <p className="text-xs text-muted-foreground">
            Powered by a free AI service
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              No configuration needed
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              MyAI is powered by a free AI service — no API keys, no setup, no
              fees. Just start chatting.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
            {[
              {
                icon: Zap,
                label: "Instant responses",
                desc: "AI replies with no wait time",
              },
              {
                icon: Sparkles,
                label: "Free to use",
                desc: "No API key or billing required",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Back CTA */}
          <Button
            data-ocid="admin-back-chat-link"
            onClick={() => navigate({ to: "/" })}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Button>
        </div>
      </div>
    </div>
  );
}
