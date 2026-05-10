import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b hairline glass-strong px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(600px 220px at 0% 0%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 60%)," +
            "radial-gradient(500px 200px at 100% 0%, color-mix(in oklab, var(--primary-glow) 10%, transparent), transparent 65%)",
        }}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[26px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}