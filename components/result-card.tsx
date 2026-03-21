type ResultCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function ResultCard({ title, description, children }: ResultCardProps) {
  return (
    <section className="card p-6 sm:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
