"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Undo2, X } from "lucide-react";

export interface ActionNotice {
  id: string;
  tone: "success" | "error";
  message: string;
  undo?: () => Promise<void> | void;
}

// Keeps the most recent action visible with an optional Undo. Only one
// notice shows at a time — a new action replaces the previous one rather than
// stacking, since these are settings mutations a user does one at a time.
export function useActionNotice() {
  const [notice, setNotice] = useState<ActionNotice | null>(null);
  const [undoing, setUndoing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const dismiss = () => {
    if (timer.current) clearTimeout(timer.current);
    setNotice(null);
  };

  const notify = (n: Omit<ActionNotice, "id">) => {
    if (timer.current) clearTimeout(timer.current);
    setNotice({ ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
  };

  const undo = async () => {
    if (!notice?.undo || undoing) return;
    setUndoing(true);
    try {
      await notice.undo();
      // The user asked for the message to clear once the action is reverted.
      dismiss();
    } catch {
      notify({ tone: "error", message: "Could not undo that change." });
    } finally {
      setUndoing(false);
    }
  };

  return { notice, notify, dismiss, undo, undoing };
}

export function ActionBanner({
  notice,
  onUndo,
  onDismiss,
  undoing = false,
}: {
  notice: ActionNotice;
  // Optional: notices for irreversible actions (deletes) render without Undo.
  onUndo?: () => void;
  onDismiss: () => void;
  undoing?: boolean;
}) {
  const Icon = notice.tone === "success" ? CheckCircle2 : AlertCircle;
  const accent =
    notice.tone === "success" ? "text-[var(--success-ink)]" : "text-[var(--danger-ink)]";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 animate-fade-in"
    >
      <Icon className={`h-4 w-4 shrink-0 ${accent}`} aria-hidden="true" />
      <p className="flex-1 text-sm text-[var(--text-secondary)]">{notice.message}</p>
      {notice.undo && onUndo && (
        <button
          type="button"
          onClick={onUndo}
          disabled={undoing}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors shrink-0 disabled:opacity-50"
        >
          <Undo2 className="h-3.5 w-3.5" />
          {undoing ? "Undoing…" : "Undo"}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
