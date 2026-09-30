"use client";

import { useState } from "react";
import { useNotes, useCreateNote, type Note } from "@/hooks/use-notes";
import { StickyNote } from "lucide-react";

export function NotesSection({
  notableType,
  notableId,
}: {
  notableType: "Contact" | "Company" | "Deal";
  notableId: string;
}) {
  const { data: notes, isLoading } = useNotes(notableType, notableId);
  const createNote = useCreateNote();
  const [body, setBody] = useState("");

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    createNote.mutate(
      { body: trimmed, notable_type: notableType, notable_id: notableId },
      { onSuccess: () => setBody("") }
    );
  };

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-[var(--text-secondary)]" />
        <h2 className="text-sm font-semibold">Notes</h2>
        {!isLoading && notes && notes.length > 0 && (
          <span className="badge badge-neutral ml-auto">{notes.length}</span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <label htmlFor={`note-body-${notableType}-${notableId}`} className="sr-only">
            Write a note
          </label>
          <textarea
            id={`note-body-${notableType}-${notableId}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a note…"
            rows={3}
            className="input resize-none"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">⌘/Ctrl + Enter to save</span>
            <button
              onClick={submit}
              disabled={!body.trim() || createNote.isPending}
              className="btn-primary"
            >
              {createNote.isPending ? "Saving…" : "Add note"}
            </button>
          </div>
          {createNote.isError && (
            <p className="text-xs text-[var(--danger)]">Could not save the note. Try again.</p>
          )}
        </div>

        <div className="space-y-3">
          {isLoading && (
            <>
              <div className="h-16 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
              <div className="h-16 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
            </>
          )}

          {notes?.map((note: Note) => (
            <div key={note.id} className="border-l-2 border-[var(--border)] pl-3">
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {new Date(note.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}

          {!isLoading && notes?.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-2">No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
