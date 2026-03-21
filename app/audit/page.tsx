import Link from "next/link";
import { AuditForm } from "@/components/audit-form";

export default function AuditPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Link href="/" className="text-sm font-medium text-slate-500">
            Back home
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
              Audit
            </p>
            <h1 className="mt-2 font-display text-4xl text-slate-900">
              Map how you use AI today.
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Answer honestly — the more specific you are, the more useful your report will be.
          </p>
          <p className="inline-flex w-fit rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm text-slate-600">
            The form starts with a sample Product Manager example so you can test
            the flow quickly.
          </p>
        </div>
      </div>

      <AuditForm />
    </main>
  );
}
