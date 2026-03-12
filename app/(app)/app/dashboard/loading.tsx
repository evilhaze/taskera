export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="mb-10">
        <div className="h-8 w-48 rounded bg-[var(--asana-bg-input)]" />
        <div className="mt-2 h-4 w-72 rounded bg-[var(--asana-bg-input)]/70" />
      </div>
      <section className="mb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[100px] rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]"
            />
          ))}
        </div>
      </section>
      <section className="mb-10 grid gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] lg:col-span-2" />
        <div className="space-y-6">
          <div className="h-24 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]" />
          <div className="h-32 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]" />
        </div>
      </section>
      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="h-56 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]" />
        <div className="h-56 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]" />
      </section>
      <div className="space-y-10">
        <div className="h-48 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]" />
        <div>
          <div className="mb-4 h-6 w-32 rounded bg-[var(--asana-bg-input)]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
