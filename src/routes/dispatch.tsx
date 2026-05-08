import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchJobs, fetchTechs, fetchCustomers, updateJob,
  JOB_STATUSES, STATUS_LABEL, STATUS_TONE, priorityTone,
  type Job, type Tech, type Customer, type JobStatus,
} from "@/lib/dispatch-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, MapPin, Phone, Radio, Route as RouteIcon, Clock,
  User, Wrench, Search, RefreshCw, Sparkles, Navigation,
} from "lucide-react";

export const Route = createFileRoute("/dispatch")({ component: DispatchPage });

const BOARD_COLUMNS: JobStatus[] = [
  "unassigned", "scheduled", "dispatched", "on_the_way", "arrived",
  "in_progress", "completed", "invoiced", "paid", "cancelled",
];

function DispatchPage() {
  const qc = useQueryClient();
  const jobsQ = useQuery({ queryKey: ["jobs"], queryFn: fetchJobs });
  const techsQ = useQuery({ queryKey: ["techs"], queryFn: fetchTechs });
  const custsQ = useQuery({ queryKey: ["customers-lite"], queryFn: fetchCustomers });
  const jobs = jobsQ.data ?? [];
  const techs = techsQ.data ?? [];
  const custs = custsQ.data ?? [];

  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const visibleJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (techFilter === "unassigned" && j.technician_id) return false;
      if (techFilter !== "all" && techFilter !== "unassigned" && j.technician_id !== techFilter) return false;
      if (!q) return true;
      return [j.title, j.job_number, j.service_address, j.description].some((s) => (s ?? "").toLowerCase().includes(q));
    });
  }, [jobs, search, techFilter]);

  const custMap = useMemo(() => new Map(custs.map((c) => [c.id, c])), [custs]);
  const techMap = useMemo(() => new Map(techs.map((t) => [t.id, t])), [techs]);

  const counts = useMemo(() => {
    const c: Record<JobStatus, number> = Object.fromEntries(JOB_STATUSES.map((s) => [s, 0])) as Record<JobStatus, number>;
    for (const j of visibleJobs) c[j.status] = (c[j.status] ?? 0) + 1;
    return c;
  }, [visibleJobs]);

  const activeJobs = visibleJobs.filter((j) => !["paid","cancelled","completed","invoiced"].includes(j.status));
  const emergency = visibleJobs.filter((j) => j.is_emergency && !["paid","cancelled","completed"].includes(j.status));

  async function moveJob(jobId: string, status: JobStatus) {
    try {
      await updateJob(jobId, { status });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(`Marked ${STATUS_LABEL[status]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function assignTech(jobId: string, techId: string | null) {
    try {
      const job = jobs.find((j) => j.id === jobId);
      const newStatus: JobStatus = !techId ? "unassigned" : (job?.status === "unassigned" ? "scheduled" : job!.status);
      await updateJob(jobId, { technician_id: techId, status: newStatus });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(techId ? "Assigned" : "Unassigned");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function setEta(jobId: string, eta: number | null) {
    try {
      await updateJob(jobId, { eta_minutes: eta });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  const detail = jobs.find((j) => j.id === selectedJob) ?? null;

  return (
    <>
      <PageHeader
        title="Dispatch"
        description="Live operations command center"
        actions={
          <>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </div>
            <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["jobs"] })}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
              <Sparkles className="mr-2 h-4 w-4" /> Optimize routes
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid gap-3 border-b border-border bg-card/40 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Active jobs" value={activeJobs.length} accent="primary" />
        <Kpi label="Unassigned" value={counts.unassigned} accent={counts.unassigned > 0 ? "warning" : "muted"} />
        <Kpi label="On the way" value={counts.on_the_way} accent="info" />
        <Kpi label="In progress" value={counts.in_progress} accent="success" />
        <Kpi label="Emergency" value={emergency.length} accent={emergency.length ? "danger" : "muted"} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr_320px]">
        {/* Tech roster */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Technicians</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <button onClick={() => setTechFilter("all")} className={cn("w-full rounded-md border border-transparent px-2 py-1.5 text-left text-xs hover:bg-muted/50", techFilter === "all" && "border-border bg-muted/40")}>All technicians · {jobs.length}</button>
            <button onClick={() => setTechFilter("unassigned")} className={cn("w-full rounded-md border border-transparent px-2 py-1.5 text-left text-xs hover:bg-muted/50", techFilter === "unassigned" && "border-border bg-muted/40")}>Unassigned · {counts.unassigned}</button>
            <div className="my-2 border-t border-border" />
            <ScrollArea className="h-[420px] pr-1">
              <div className="space-y-1.5">
                {techs.map((t) => {
                  const load = jobs.filter((j) => j.technician_id === t.id && !["paid","cancelled","completed"].includes(j.status)).length;
                  return (
                    <button key={t.id} onClick={() => setTechFilter(t.id)} className={cn("flex w-full items-center justify-between rounded-md border border-transparent p-2 text-left hover:bg-muted/50", techFilter === t.id && "border-border bg-muted/40")}>
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{t.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{t.full_name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{t.role_title ?? t.status}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{load}</Badge>
                    </button>
                  );
                })}
                {techs.length === 0 && <p className="px-2 text-xs text-muted-foreground">No technicians yet.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Board */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, addresses, job #" className="pl-8" />
            </div>
          </div>

          <ScrollArea className="rounded-lg border border-border bg-card/30">
            <div className="flex gap-3 p-3" style={{ minWidth: BOARD_COLUMNS.length * 260 }}>
              {BOARD_COLUMNS.map((status) => {
                const list = visibleJobs.filter((j) => j.status === status);
                return (
                  <DropColumn key={status} status={status} count={list.length} onDrop={(id) => moveJob(id, status)}>
                    {list.map((j) => (
                      <JobCard
                        key={j.id}
                        job={j}
                        customer={custMap.get(j.customer_id) ?? null}
                        tech={j.technician_id ? techMap.get(j.technician_id) ?? null : null}
                        selected={selectedJob === j.id}
                        onClick={() => setSelectedJob(j.id)}
                      />
                    ))}
                    {list.length === 0 && <p className="px-1 text-[11px] text-muted-foreground">Drop a job here.</p>}
                  </DropColumn>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right panel: map + detail */}
        <div className="space-y-4">
          <MapPanel jobs={activeJobs.slice(0, 8)} />
          <DetailPanel
            job={detail}
            techs={techs}
            customer={detail ? custMap.get(detail.customer_id) ?? null : null}
            onAssign={(tid) => detail && assignTech(detail.id, tid)}
            onStatus={(s) => detail && moveJob(detail.id, s)}
            onEta={(n) => detail && setEta(detail.id, n)}
          />
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, accent, icon }: { label: string; value: number; accent: "primary" | "muted" | "danger" | "warning" | "success" | "info"; icon?: React.ReactNode }) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    muted: "bg-muted text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)]",
    success: "bg-[oklch(0.65_0.16_150)/0.2] text-[oklch(0.35_0.16_150)]",
    info: "bg-[oklch(0.7_0.18_220)/0.2] text-[oklch(0.4_0.18_220)]",
  };
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className={cn("grid h-10 w-10 place-items-center rounded-lg", tones[accent])}>{icon ?? <Wrench className="h-4 w-4" />}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold leading-none">{value}</p>
      </div>
    </div>
  );
}

function DropColumn({ status, count, children, onDrop }: { status: JobStatus; count: number; children: React.ReactNode; onDrop: (id: string) => void }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData("text/job-id"); if (id) onDrop(id); }}
      className={cn("flex w-[250px] shrink-0 flex-col rounded-lg border border-border bg-background/60 p-2 transition-colors", over && "border-primary bg-primary/5")}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[status])}>{STATUS_LABEL[status]}</Badge>
        <span className="text-[10px] font-semibold text-muted-foreground">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function JobCard({ job, customer, tech, selected, onClick }: {
  job: Job; customer: Customer | null; tech: Tech | null; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/job-id", job.id); e.dataTransfer.effectAllowed = "move"; }}
      onClick={onClick}
      className={cn("w-full cursor-grab rounded-md border border-border bg-card p-2.5 text-left shadow-sm transition-all hover:shadow-md active:cursor-grabbing", selected && "ring-2 ring-primary")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-mono text-muted-foreground">{job.job_number}</p>
          <p className="line-clamp-2 text-sm font-semibold">{job.title}</p>
        </div>
        {job.is_emergency && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <Badge className={cn("h-4 px-1.5 text-[10px]", priorityTone(job.priority))}>{job.priority}</Badge>
        {job.eta_minutes != null && <Badge variant="outline" className="h-4 px-1.5 text-[10px]"><Clock className="mr-0.5 h-2.5 w-2.5" />ETA {job.eta_minutes}m</Badge>}
      </div>
      {customer && <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground"><User className="h-3 w-3" />{customer.name}</p>}
      {(job.service_address || customer?.billing_address) && (
        <p className="mt-0.5 flex items-start gap-1 text-[11px] text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /><span className="line-clamp-1">{job.service_address ?? customer?.billing_address}</span></p>
      )}
      <p className="mt-1.5 truncate text-[11px] font-medium">{tech ? tech.full_name : <span className="text-muted-foreground italic">Unassigned</span>}</p>
    </button>
  );
}

function MapPanel({ jobs }: { jobs: Job[] }) {
  return (
    <Card className="shadow-[var(--shadow-card)] overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Live map</CardTitle>
        <Badge variant="outline" className="text-[10px]"><RouteIcon className="mr-1 h-3 w-3" />Routing preview</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[220px] overflow-hidden border-y border-border bg-[linear-gradient(135deg,oklch(0.95_0.03_220)_0%,oklch(0.92_0.04_180)_100%)] dark:bg-[linear-gradient(135deg,oklch(0.25_0.05_220)_0%,oklch(0.22_0.05_260)_100%)]">
          {/* Faux grid */}
          <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" />
          </svg>
          {jobs.map((j, i) => {
            const x = ((i * 73) % 90) + 5;
            const y = ((i * 41) % 70) + 10;
            return (
              <div key={j.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                <div className={cn("grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-white shadow-lg", j.is_emergency ? "bg-destructive" : "bg-primary")}>{i + 1}</div>
              </div>
            );
          })}
          <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
            <Navigation className="mr-1 inline h-3 w-3" />Google Maps integration
          </div>
        </div>
        <div className="p-3 text-[11px] text-muted-foreground">
          Connect a Google Maps API key to enable live tracking, traffic-aware ETAs, and one-click route optimization.
        </div>
      </CardContent>
    </Card>
  );
}

function DetailPanel({ job, techs, customer, onAssign, onStatus, onEta }: {
  job: Job | null; techs: Tech[]; customer: Customer | null;
  onAssign: (techId: string | null) => void;
  onStatus: (s: JobStatus) => void;
  onEta: (n: number | null) => void;
}) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader className="pb-3"><CardTitle className="text-sm">Job details</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {!job ? (
          <p className="text-xs text-muted-foreground">Select a job to dispatch, assign, or update status.</p>
        ) : (
          <>
            <div>
              <p className="text-xs font-mono text-muted-foreground">{job.job_number}</p>
              <p className="text-base font-semibold">{job.title}</p>
              {job.description && <p className="mt-1 text-xs text-muted-foreground">{job.description}</p>}
            </div>
            <div className="grid gap-2 text-xs">
              {customer && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span>{customer.name}</span></div>}
              {(job.service_address || customer?.billing_address) && <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><span>{job.service_address ?? customer?.billing_address}</span></div>}
              {job.scheduled_start && <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span>{new Date(job.scheduled_start).toLocaleString()} · {job.duration_minutes ?? 60}m</span></div>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase text-muted-foreground">Technician</label>
              <Select value={job.technician_id ?? "none"} onValueChange={(v) => onAssign(v === "none" ? null : v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase text-muted-foreground">Status</label>
              <Select value={job.status} onValueChange={(v) => onStatus(v as JobStatus)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase text-muted-foreground">ETA (minutes)</label>
              <Input
                type="number" min={0} className="h-9"
                defaultValue={job.eta_minutes ?? ""}
                onBlur={(e) => onEta(e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g. 25"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => onStatus("on_the_way")}><Navigation className="mr-1.5 h-3.5 w-3.5" />On the way</Button>
              <Button size="sm" variant="outline" onClick={() => onStatus("arrived")}><MapPin className="mr-1.5 h-3.5 w-3.5" />Arrived</Button>
              <Button size="sm" variant="outline" onClick={() => onStatus("in_progress")}><Wrench className="mr-1.5 h-3.5 w-3.5" />Start</Button>
              <Button size="sm" variant="outline" onClick={() => onStatus("completed")}><Radio className="mr-1.5 h-3.5 w-3.5" />Complete</Button>
              {customer && <Button size="sm" variant="ghost" className="col-span-2"><Phone className="mr-1.5 h-3.5 w-3.5" />Call customer</Button>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}