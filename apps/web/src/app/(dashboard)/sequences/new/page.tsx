"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, FormError } from "@/components/forms/fields";
import { useCreateSequence } from "@/hooks/use-sequences";
import { errMessage } from "@/lib/error";
import { ChevronLeft } from "lucide-react";

export default function NewSequencePage() {
  const router = useRouter();
  const create = useCreateSequence();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/sequences"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to sequences
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New Sequence</h1>
      </div>

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const result = (await create.mutateAsync({ name: name.trim(), is_active: true })) as unknown as {
                id: string;
              };
              router.push(`/sequences/${result.id}`);
            } catch (err) {
              setError(errMessage(err, "Could not create the sequence."));
            }
          }}
        >
          <Field label="Name" htmlFor="sequence-name" required>
            <input
              id="sequence-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Welcome drip"
              required
            />
          </Field>
          <button type="submit" disabled={create.isPending || !name.trim()} className="btn-primary">
            {create.isPending ? "Creating…" : "Create sequence"}
          </button>
        </form>
      </div>
    </div>
  );
}
