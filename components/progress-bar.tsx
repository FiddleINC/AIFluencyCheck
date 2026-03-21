type ProgressBarProps = {
  label: string;
  value: number;
  hint?: string;
};

export function ProgressBar({ label, value, hint }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span>{label}</span>
          {hint ? (
            <span className="group relative inline-flex">
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 text-[11px] font-semibold text-slate-500"
                aria-label={`${label}: ${hint}`}
              >
                ?
              </button>
              <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-56 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-left text-xs font-normal leading-5 text-slate-600 shadow-[0_12px_32px_rgba(26,33,44,0.12)] group-hover:block group-focus-within:block">
                {hint}
              </span>
            </span>
          ) : null}
        </span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
