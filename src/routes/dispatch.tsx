import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { jobs, technicians } from "@/lib/mock-data";
import { MapPin, Radio } from "lucide-react";

export const Route = createFileRoute("/dispatch")({ component: DispatchPage });

function DispatchPage() {
  return (
    <>
      <PageHeader title="Dispatch" description="Live board — assign and track field activity." />
      <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Technicians</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {technicians.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <Badge variant="outline" className={t.status === "Available" ? "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)] border-transparent" : "bg-primary/10 text-primary border-primary/20"}>{t.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Active jobs</CardTitle>
            <Button variant="ghost" size="sm"><Radio className="mr-2 h-4 w-4" /> Live</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="flex items-start justify-between rounded-lg border border-border p-4 hover:bg-muted/30">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{j.title}</p>
                  <p className="text-xs text-muted-foreground"><MapPin className="mr-1 inline h-3 w-3" />{j.customer}</p>
                  <p className="text-xs text-muted-foreground">{j.scheduled} · ${j.value}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline">{j.tech}</Badge>
                  <Badge className={j.priority === "Urgent" ? "bg-destructive text-destructive-foreground" : j.priority === "High" ? "bg-[oklch(0.72_0.18_50)] text-white" : "bg-muted text-muted-foreground"}>{j.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}