"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} card p-6 shadow-lg animate-scale-in outline-none max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 -m-1 shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  confirming = false,
  error = null,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirming?: boolean;
  error?: string | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
      {error && <p className="text-sm text-[var(--danger-ink)] mt-3">{error}</p>}
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="btn-secondary" disabled={confirming}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="btn-danger"
        >
          {confirming ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
