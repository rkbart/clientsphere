"use client";

import type { Tag } from "@/hooks/use-tags";

// Compact tag badges for table cells: first three, then a "+N" overflow chip.
export function TagsCell({ tags, max = 3 }: { tags?: Tag[]; max?: number }) {
  if (!tags || tags.length === 0) return <span className="text-[var(--text-tertiary)]">—</span>;
  return (
    <span className="flex flex-wrap gap-1 max-w-[16rem]">
      {tags.slice(0, max).map((tag) => (
        <span
          key={tag.id}
          className="badge badge-neutral"
          style={tag.color ? { backgroundColor: `${tag.color}1a`, color: tag.color } : undefined}
        >
          {tag.name}
        </span>
      ))}
      {tags.length > max && <span className="badge badge-neutral">+{tags.length - max}</span>}
    </span>
  );
}
