import { AlertTriangle, Inbox, Loader2, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiNotConnectedError } from "@/lib/api/client";
import { t } from "@/lib/i18n";

type Kind = "loading" | "empty" | "error" | "not-connected";

export function StateBlock({
  kind,
  title,
  hint,
  onRetry,
  compact,
}: {
  kind: Kind;
  title?: string | undefined;
  hint?: string | undefined;
  onRetry?: (() => unknown) | undefined;
  compact?: boolean | undefined;
}) {
  const Icon = { loading: Loader2, empty: Inbox, error: AlertTriangle, "not-connected": PlugZap }[kind];
  const defaults = {
    loading: [t("loading"), ""],
    empty: [t("empty"), t("emptyHint")],
    error: [t("error"), ""],
    "not-connected": [t("notConnected"), t("notConnectedHint")],
  }[kind];
  const tone =
    kind === "error"
      ? "bg-expired-bg text-expired"
      : kind === "not-connected"
        ? "bg-warning-bg text-warning"
        : "bg-primary-soft text-primary";
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center ${compact ? "gap-2 py-6" : "gap-3 py-12"} px-4`}
    >
      <span className={`grid size-10 place-items-center rounded-full ${tone}`}>
        <Icon className={`size-5 ${kind === "loading" ? "animate-spin" : ""}`} aria-hidden />
      </span>
      <p className="font-semibold text-foreground">{title ?? defaults[0]}</p>
      {(hint ?? defaults[1]) && (
        <p className="max-w-md text-sm text-muted-foreground">{hint ?? defaults[1]}</p>
      )}
      {onRetry && kind === "error" && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}

/** Maps a query state to the right StateBlock, or null when data is ready. */
export function QueryState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  compact,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  onRetry?: (() => unknown) | undefined;
  compact?: boolean | undefined;
}) {
  if (isLoading) return <StateBlock kind="loading" compact={compact} />;
  if (error instanceof ApiNotConnectedError) return <StateBlock kind="not-connected" compact={compact} />;
  if (error)
    return (
      <StateBlock
        kind="error"
        hint={error instanceof Error ? error.message : undefined}
        onRetry={onRetry}
        compact={compact}
      />
    );
  if (isEmpty) return <StateBlock kind="empty" compact={compact} />;
  return null;
}
