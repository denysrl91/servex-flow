import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scheduleSlots } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/schedule")({ component: SchedulePage });

function SchedulePage() {
  return (
    <>
      <PageHeader
        title="Schedule"
        description="Friday, May 8, 2026"
        actions={
          <>
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> Schedule Job</Button>
          </>
        }
      />
      <div className="p-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-0">
            {scheduleSlots.map((slot, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr] border-b border-border last:border-b-0">
                <div className="border-r border-border p-3 text-sm font-medium text-muted-foreground">{slot.time}</div>
                <div className="min-h-[64px] p-2">
                  {slot.jobs.map((j, idx) => (
                    <div key={idx} className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <p className="text-sm font-medium">{j.job}</p>
                      <p className="text-xs text-muted-foreground">{j.tech} · {j.duration}h</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}