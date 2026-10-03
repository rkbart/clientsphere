import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateActivity } from "./use-activities";

export interface CompletedSnapshot {
  id: string;
  subject: string;
  due_at?: string | null;
  description?: string | null;
}

const UNDO_WINDOW_MS = 8000;

function later(fn: () => void, ms: number): ReturnType<typeof setTimeout> {
  return setTimeout(fn, ms);
}

// Complete/uncomplete a task with a brief inline undo window. Completed
// tasks are kept as local snapshots (with an Undo action) until the window
// lapses or an undo reopens them; timers are cleared on unmount.
export function useCompleteTaskWithUndo(invalidateKeys: unknown[][]) {
  const queryClient = useQueryClient();
  const update = useUpdateActivity();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState<CompletedSnapshot[]>([]);
  const [failed, setFailed] = useState<{ id: string; action: "complete" | "undo" } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  const dismiss = (id: string, announce = false) => {
    setRecentlyCompleted((list) => list.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    if (announce) setAnnouncement("Undo period ended.");
  };

  const armDismiss = (id: string) => {
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = later(() => dismiss(id, true), UNDO_WINDOW_MS);
  };

  const clearFailure = (id: string) =>
    setFailed((f) => (f?.id === id ? null : f));

  const invalidate = () => {
    invalidateKeys.forEach((key) =>
      queryClient.invalidateQueries({ queryKey: key as unknown[] })
    );
  };

  const complete = (task: CompletedSnapshot) => {
    clearFailure(task.id);
    setCompletingId(task.id);
    update.mutate(
      { id: task.id, completed_at: new Date().toISOString() },
      {
        onSuccess: () => {
          invalidate();
          setRecentlyCompleted((list) =>
            list.some((t) => t.id === task.id) ? list : [...list, task]
          );
          setAnnouncement("Task completed. Undo available.");
          armDismiss(task.id);
        },
        onError: () => {
          setFailed({ id: task.id, action: "complete" });
          setAnnouncement("Could not mark task complete.");
        },
        onSettled: () => setCompletingId(null),
      }
    );
  };

  const undo = (id: string) => {
    clearFailure(id);
    setCompletingId(id);
    update.mutate(
      { id, completed_at: null },
      {
        onSuccess: () => {
          invalidate();
          dismiss(id);
          setAnnouncement("Task reopened.");
        },
        onError: () => {
          setFailed({ id, action: "undo" });
          setAnnouncement("Could not reopen task.");
        },
        onSettled: () => setCompletingId(null),
      }
    );
  };

  const dismissFailure = (id: string) => clearFailure(id);

  return { complete, undo, completingId, recentlyCompleted, failed, dismissFailure, announcement, isPending: update.isPending };
}
