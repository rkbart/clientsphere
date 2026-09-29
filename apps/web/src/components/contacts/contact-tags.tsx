"use client";

import { useState } from "react";
import { useTags, useContactTags, useAttachContactTag, useDetachContactTag } from "@/hooks/use-tags";
import { X, Plus } from "lucide-react";

export function ContactTags({ contactId }: { contactId: string }) {
  const { data: allTags, isLoading: tagsLoading } = useTags();
  const { data: currentTags, isLoading: currentLoading } = useContactTags(contactId);
  const attach = useAttachContactTag(contactId);
  const detach = useDetachContactTag(contactId);
  const [adding, setAdding] = useState(false);

  const currentIds = new Set((currentTags ?? []).map((t) => t.id));
  const available = (allTags ?? []).filter((t) => !currentIds.has(t.id));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Tags</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="btn-ghost text-xs px-2 py-1"
          aria-label={adding ? "Cancel adding tag" : "Add tag"}
        >
          {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>

      {adding && (
        <div className="mb-3">
          {available.length > 0 ? (
            <select
              className="input text-sm"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  attach.mutate(e.target.value, { onSuccess: () => setAdding(false) });
                }
              }}
              autoFocus
            >
              <option value="" disabled>
                Choose a tag…
              </option>
              {available.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              {tagsLoading ? "Loading tags…" : "No more tags available"}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentLoading && (
          <>
            <div className="h-6 w-16 bg-[var(--bg-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
            <div className="h-6 w-20 bg-[var(--bg-elevated)] rounded-[var(--radius-sm)] animate-pulse" />
          </>
        )}

        {currentTags?.map((tag) => (
          <span
            key={tag.id}
            className="badge badge-neutral group gap-1 pr-1"
            style={tag.color ? { backgroundColor: `${tag.color}1a`, color: tag.color } : undefined}
          >
            {tag.name}
            <button
              onClick={() => detach.mutate(tag.id)}
              className="p-0.5 rounded-[var(--radius-sm)] hover:bg-black/10 transition-colors"
              aria-label={`Remove tag ${tag.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {!currentLoading && currentTags?.length === 0 && !adding && (
          <p className="text-sm text-[var(--text-tertiary)]">No tags</p>
        )}
      </div>
    </div>
  );
}
