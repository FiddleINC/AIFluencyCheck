"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { PromptRewriteChallenge, readStoredFormForChallenge } from "@/components/prompt-rewrite-challenge";
import type { AuditFormData } from "@/lib/types";

export default function ChallengePage() {
  const [form, setForm] = useState<AuditFormData | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setForm(readStoredFormForChallenge());
      setHasLoaded(true);
    });
  }, []);

  if (!hasLoaded) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16 sm:px-10">
        <section className="card w-full p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Loading challenge
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900">
            Pulling your latest audit context.
          </h1>
        </section>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16 sm:px-10">
        <section className="card w-full p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            No challenge yet
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900">
            Run the audit first.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
            The prompt challenge uses your latest saved role from the audit flow.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/audit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Go to audit
            </Link>
            <Link
              href="/results"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] px-6 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
            >
              Back to results
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10">
      <div className="mb-8">
        <Link href="/results" className="text-sm font-medium text-slate-500">
          Back to results
        </Link>
      </div>
      <PromptRewriteChallenge form={form} />
    </main>
  );
}
