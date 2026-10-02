"use client";

const COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return COLORS[hash % COLORS.length];
}

export function initialsOf(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  } as const;
  return (
    <div
      className={`${sizes[size]} rounded-full ${colorFor(name ?? "?")} flex items-center justify-center shrink-0 ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="text-white font-semibold">{initialsOf(name)}</span>
    </div>
  );
}
