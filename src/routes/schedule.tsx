import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Repeat, Clock } from "lucide-react";
import { fetchJobs, fetchTechs, updateJob, priorityTone, STATUS_LABEL, STATUS_TONE, type Job } from "@/lib/dispatch-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/schedule")({ component: SchedulePage });

type View = "day" | "week" | "month";

function startOfWeek(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - x.getDay()); return x; }
function startOfMonth(d: Date) { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }
function fmtDay(d: Date) { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
function fmtTime(d: string | null) { return d ? new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"; }

function SchedulePage() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });

  const jobsQ = useQuery({ queryKey: ["jobs"], queryFn: fetchJobs });
  const techsQ = useQuery({ queryKey: ["techs"], queryFn: fetchTechs });
  const jobs = jobsQ.data ?? [];
  const techs = techsQ.data ?? [];

  const range = useMemo(() => {
    if (view === "day") return [cursor];
    if (view === "week") { const s = startOfWeek(cursor); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
    const s = startOfMonth(cursor);
    const grid = startOfWeek(s);
    return Array.from({ length: 42 }, (_, i) => addDays(grid, i));
  }, [view, cursor]);

  const title = view === "month"
    ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : view === "week"
      ? `Week of ${fmtDay(startOfWeek(cursor))}`
      : fmtDay(cursor);

  function shift(dir: -1 | 1) {
    const d = new Date(cursor);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setMonth(d.getMonth() + dir);
    setCursor(d);
  }

  function jobsFor(day: Date, techId?: string | null) {
    return jobs.filter((j) => {
      if (!j.scheduled_start) return false;
      if (!sameDay(new Date(j.scheduled_start), day)) return false;
      if (techId !== undefined && j.technician_id !== techId) return false;
      return true;
    });
  }

  async function onDrop(jobId: string, day: Date, techId: string | null) {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const start = new Date(day);
    if (job.scheduled_start) {
      const old = new Date(job.scheduled_start);
      start.setHours(old.getHours(), old.getMinutes(), 0, 0);
    } else { start.setHours(9, 0, 0, 0); }
    const dur = job.duration_minutes ?? 60;
    const end = new Date(start.getTime() + dur * 60_000);
    try {
      await updateJob(jobId, {
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        technician_id: techId,
        status: techId ? (job.status === "unassigned" ? "scheduled" : job.status) : "unassigned",
      });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job rescheduled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  return (
    <>
      <PageHeader
        title="Schedule"
        description={title}
        actions={
          <>
            <Tabs value={view} onValueChange={(v) => setView(v as View)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => { const d = new Date(); d.setHours(0,0,0,0); setCursor(d); }}>Today</Button>
            <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
            <Button asChild size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
              <Link to="/jobs"><Plus className="mr-2 h-4 w-4" /> Schedule job</Link>
            </Button>
          </>
        }
      />
      <div className="p-4 sm:p-6">
        {view === "month" ? (
          <MonthGrid days={range} cursor={cursor} jobsFor={jobsFor} onPick={(d) => { setCursor(d); setView("day"); }} />
        ) : (
          <Card className="shadow-[var(--shadow-card)] overflow-hidden">
            <CardContent className="p-0">
              <div className="grid border-b border-border bg-muted/30" style={{ gridTemplateColumns: `200px repeat(${range.length}, minmax(180px, 1fr))` }}>
                <div className="p-3 text-xs font-semibold uppercase text-muted-foreground">Technician</div>
                {range.map((d) => (
                  <div key={d.toISOString()} className="border-l border-border p-3 text-sm font-medium">{fmtDay(d)}</div>
                ))}
              </div>

              {/* Unassigned row */}
              <ScheduleRow
                label="Unassigned"
                sublabel={`${jobs.filter((j) => !j.technician_id).length} jobs`}
                days={range}
                jobsByDay={range.map((d) => jobsFor(d, null))}
                onDrop={(d, jobId) => onDrop(jobId, d, null)}
              />

              {techs.map((t) => (
                <ScheduleRow
                  key={t.id}
                  label={t.full_name}
                  sublabel={t.role_title ?? t.status}
                  days={range}
                  jobsByDay={range.map((d) => jobsFor(d, t.id))}
                  onDrop={(d, jobId) => onDrop(jobId, d, t.id)}
                />
              ))}

              {techs.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">No technicians yet — add one in the Technicians module.</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function ScheduleRow({ label, sublabel, days, jobsByDay, onDrop }: {
  label: string; sublabel: string; days: Date[]; jobsByDay: Job[][];
  onDrop: (day: Date, jobId: string) => void;
}) {
  return (
    <div className="grid border-b border-border last:border-b-0" style={{ gridTemplateColumns: `200px repeat(${days.length}, minmax(180px, 1fr))` }}>
      <div className="border-r border-border p-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
      {days.map((d, i) => (
        <DayCell key={d.toISOString()} day={d} jobs={jobsByDay[i]} onDrop={(jobId) => onDrop(d, jobId)} />
      ))}
    </div>
  );
}

function DayCell({ day, jobs, onDrop }: { day: Date; jobs: Job[]; onDrop: (jobId: string) => void }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData("text/job-id"); if (id) onDrop(id); }}
      className={cn("min-h-[110px] space-y-1.5 border-l border-border p-2 transition-colors", over && "bg-primary/5")}
    >
      {jobs.length === 0 && <div className="h-full min-h-[90px]" aria-hidden />}
      {jobs.map((j) => <JobChip key={j.id} job={j} />)}
    </div>
  );
}

function JobChip({ job }: { job: Job }) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/job-id", job.id); e.dataTransfer.effectAllowed = "move"; }}
      className="cursor-grab rounded-md border border-border bg-card p-2 shadow-sm hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-xs font-semibold">{job.title}</p>
        {job.is_emergency && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <Badge className={cn("h-5 px-1.5 text-[10px]", priorityTone(job.priority))}>{job.priority}</Badge>
        <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", STATUS_TONE[job.status])}>{STATUS_LABEL[job.status]}</Badge>
        {job.recurrence && <Badge variant="outline" className="h-5 px-1.5 text-[10px]"><Repeat className="mr-1 h-2.5 w-2.5" />{job.recurrence}</Badge>}
      </div>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{fmtTime(job.scheduled_start)} · {job.duration_minutes ?? 60}m</p>
    </div>
  );
}

function MonthGrid({ days, cursor, jobsFor, onPick }: {
  days: Date[]; cursor: Date; jobsFor: (d: Date) => Job[]; onPick: (d: Date) => void;
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  return (
    <Card className="shadow-[var(--shadow-card)] overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="p-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = sameDay(d, today);
            const list = jobsFor(d);
            return (
              <button key={d.toISOString()} onClick={() => onPick(d)} className={cn(
                "min-h-[110px] border-b border-l border-border p-2 text-left transition-colors hover:bg-muted/40",
                !inMonth && "bg-muted/10 text-muted-foreground/60",
              )}>
                <div className={cn("mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", isToday && "bg-primary text-primary-foreground")}>{d.getDate()}</div>
                <div className="space-y-1">
                  {list.slice(0, 3).map((j) => (
                    <div key={j.id} className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{j.title}</div>
                  ))}
                  {list.length > 3 && <div className="text-[10px] text-muted-foreground">+{list.length - 3} more</div>}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}