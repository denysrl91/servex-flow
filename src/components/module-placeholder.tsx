import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  features,
  related,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  features: string[];
  related?: { to: string; label: string }[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card className="premium-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> What this module includes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {related && related.length > 0 && (
          <Card className="premium-card">
            <CardHeader><CardTitle className="text-base">Related</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {related.map((r) => (
                <Link
                  key={r.to}
                  to={r.to as never}
                  className="rounded-md border border-border bg-card/40 px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {r.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export function makePlaceholderRoute(props: Parameters<typeof ModulePlaceholder>[0]): () => ReactNode {
  return function PlaceholderRoute() {
    return <ModulePlaceholder {...props} />;
  };
}