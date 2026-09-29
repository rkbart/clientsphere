export function errMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "error" in error) {
    const e = (error as { error: unknown }).error;
    if (typeof e === "string") return e;
    if (Array.isArray(e)) return e.join(", ");
  }
  return fallback;
}
