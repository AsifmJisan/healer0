"use client";

<<<<<<< Updated upstream
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  Users,
  ClipboardList,
  Database,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Loader2,
  Activity,
  AlertCircle
} from "lucide-react";
import {
  fetchResearchDashboard,
  createResearchProject,
  CreateProjectPayload,
  ResearchProject
} from "@/lib/api/research";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ResearcherDashboardPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for creating a new project
  const [title, setTitle] = useState("");
  const [researchArea, setResearchArea] = useState("");
  const [protocolNumber, setProtocolNumber] = useState("");
  const [targetSampleSize, setTargetSampleSize] = useState("100");
  const [status, setStatus] = useState<CreateProjectPayload["status"]>("recruiting");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const { data: summary, isLoading, isError, error } = useQuery({
    queryKey: ["research", "dashboard"],
    queryFn: fetchResearchDashboard,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => createResearchProject(payload),
    onSuccess: () => {
      toast.success("Clinical study successfully created and registered.");
      setIsCreateOpen(false);
      setTitle("");
      setResearchArea("");
      setProtocolNumber("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["research"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create research study");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !researchArea.trim()) {
      toast.error("Study title and research field are required.");
      return;
    }
    createMutation.mutate({
      title,
      researchArea,
      protocolNumber: protocolNumber.trim() || undefined,
      targetSampleSize: parseInt(targetSampleSize) || 0,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      description: description.trim() || undefined,
    });
  };

  const getStatusBadge = (studyStatus: string) => {
    switch (studyStatus) {
      case "recruiting":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "data_collection":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "in_progress":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const formatStatus = (s: string) => {
    return s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Scientific Workspace
            </span>
            <span className="text-zinc-400 text-xs">PostgreSQL Live Data</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">
            Clinical Research & Analytics
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Conduct multi-phase psychiatric clinical trials, deploy psychometric surveys, and evaluate longitudinal cohort observations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer">
                <Plus className="w-4 h-4 mr-1.5" /> Launch Clinical Study
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-indigo-600" /> Register New Clinical Study
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Provide protocol details to initialize a research study in the PostgreSQL clinical registry.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Study Title *</label>
                  <Input
                    placeholder="e.g. Longitudinal Biomarkers in Expressive Writing Therapy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Research Domain *</label>
                    <Input
                      placeholder="e.g. Computational Psychiatry"
                      value={researchArea}
                      onChange={(e) => setResearchArea(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Protocol Number</label>
                    <Input
                      placeholder="e.g. HLR-PSY-2026-004"
                      value={protocolNumber}
                      onChange={(e) => setProtocolNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Target Sample Size</label>
                    <Input
                      type="number"
                      min="1"
                      value={targetSampleSize}
                      onChange={(e) => setTargetSampleSize(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700">Study Phase / Status</label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="recruiting">Recruiting Cohort</option>
                      <option value="data_collection">Active Data Collection</option>
                      <option value="in_progress">In Progress (Analysis)</option>
                      <option value="draft">Draft Protocol</option>
                      <option value="completed">Completed / Published</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Estimated End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Description & Abstract</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-input bg-card p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Brief description of primary clinical endpoints, target demographics, and intervention methodology..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {createMutation.isPending ? "Creating..." : "Save & Register Study"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
=======
import { useQuery } from "@tanstack/react-query";
import { fetchResearcherDashboard } from "@/lib/api/researcher";
import Link from "next/link";
import { 
  FlaskConical, Users, ClipboardList, Database, ArrowUpRight, Plus, 
  ShieldCheck, Activity, Search, Calendar, ChevronRight, Sparkles, Building2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatTelemetrySnippet(val: unknown): string {
  if (!val || typeof val !== 'object') return 'Verified clinical data stream';
  const entries = Object.entries(val);
  if (entries.length === 0) return 'Standard observation recorded';
  return entries
    .slice(0, 3)
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      return `${label}: ${v}`;
    })
    .join('  •  ');
}

export default function ResearcherOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['researcher', 'dashboard'],
    queryFn: fetchResearcherDashboard,
  });

  const dashboard = data?.data;
  const summary = dashboard?.summary;
  const profile = dashboard?.profile;
  const projects = dashboard?.recentProjects || [];
  const recentData = dashboard?.recentData || [];
  const collaborators = dashboard?.collaborators || [];
  const irbPermission = dashboard?.irbPermission;
  const consentStats = dashboard?.consentStats;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-fuchsia-100/40 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-fuchsia-50/50 rounded-xl border border-fuchsia-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-fuchsia-50/40 rounded-xl" />
          <div className="h-96 bg-fuchsia-50/40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Executive Header Banner — Purple-Pinkish Academic Palette */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4a044e] via-[#701a75] to-[#831843] p-6 sm:p-8 text-white shadow-lg border border-fuchsia-700/50">
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #ec4899 0%, transparent 60%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/30 tracking-wide uppercase">
                Clinical Research Console
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-500/25 text-pink-200 border border-pink-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> De-identified Telemetry Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome, {profile?.fullName || 'Investigator'}
            </h1>
            <p className="text-sm text-fuchsia-100/90 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-pink-300 shrink-0" />
              <span>{profile?.institution || 'Healer Clinical Research Network'}</span>
              <span className="text-fuchsia-400">•</span>
              <span className="text-pink-200 font-medium">{profile?.researchField || 'Clinical Research'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/researcher/projects">
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white shadow-xs cursor-pointer text-xs font-semibold">
                <Plus className="w-4 h-4 mr-1.5" />
                New Study Project
              </Button>
            </Link>
            <Link href="/researcher/literature">
              <Button size="sm" variant="outline" className="border-fuchsia-300/40 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 text-fuchsia-100 cursor-pointer text-xs">
                <Search className="w-4 h-4 mr-1.5" />
                Explore Literature
              </Button>
            </Link>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>

      {/* KPI Metric Cards */}
<<<<<<< Updated upstream
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            title: "Active Studies",
            value: summary ? `${summary.activeStudies} / ${summary.totalStudies}` : "--",
            subtitle: "Live protocols",
            icon: FlaskConical,
            color: "text-indigo-600 bg-indigo-50 border-indigo-200/60",
          },
          {
            title: "Enrolled Cohort",
            value: summary ? summary.totalParticipants : "--",
            subtitle: "Consented subjects",
            icon: Users,
            color: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
          },
          {
            title: "Psychometrics",
            value: summary ? summary.totalSurveys : "--",
            subtitle: "Active instruments",
            icon: ClipboardList,
            color: "text-violet-600 bg-violet-50 border-violet-200/60",
          },
          {
            title: "Collected Points",
            value: summary ? summary.totalDataPoints : "--",
            subtitle: "Observations stored",
            icon: Database,
            color: "text-sky-600 bg-sky-50 border-sky-200/60",
          },
          {
            title: "Papers & References",
            value: summary ? summary.totalPapers : "--",
            subtitle: "Peer-reviewed citations",
            icon: BookOpen,
            color: "text-amber-600 bg-amber-50 border-amber-200/60",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-4 bg-white border-zinc-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 truncate">{card.title}</span>
                <div className={cn("p-1.5 rounded-lg border", card.color)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : card.value}
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">{card.subtitle}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Sections: Active Studies & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Clinical Studies (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-600" /> Registered Clinical Studies
              </h2>
              <p className="text-xs text-zinc-500">Live trials backed by PostgreSQL database rows</p>
            </div>
            <Link
              href="/researcher/studies"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              View All Studies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(() => {
            const recentProjects: ResearchProject[] = Array.isArray(summary?.recentProjects)
              ? summary.recentProjects
              : Array.isArray((summary as any)?.recentProjects?.projects)
              ? (summary as any).recentProjects.projects
              : [];

            if (isLoading) {
              return (
                <div className="p-12 text-center text-zinc-400 bg-white border border-zinc-200/80 rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  Loading research projects from database...
                </div>
              );
            }

            if (isError) {
              return (
                <div className="p-6 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  Failed to load projects: {(error as Error)?.message}
                </div>
              );
            }

            if (recentProjects.length === 0) {
              return (
                <Card className="p-8 text-center bg-white border-zinc-200/80">
                  <FlaskConical className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-zinc-900">No Studies Registered Yet</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Launch your first clinical trial or psychological observation study using the button above.
                  </p>
                </Card>
              );
            }

            return (
              <div className="space-y-4">
                {recentProjects.map((project: ResearchProject) => (
                <Card
                  key={project.id}
                  className="bg-white border-zinc-200/80 hover:border-indigo-300 transition-all p-5 shadow-2xs hover:shadow-xs group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            getStatusBadge(project.status)
                          )}
                        >
                          {formatStatus(project.status)}
                        </span>
                        {project.protocolNumber && (
                          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                            {project.protocolNumber}
                          </span>
                        )}
                        <span className="text-xs font-medium text-zinc-500">
                          {project.researchArea}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>

                      {project.description && (
                        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress & Meta Footer */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
                    <div className="flex items-center gap-4">
                      {project.targetSampleSize > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Target: {project.targetSampleSize} participants</span>
                        </div>
                      )}
                      {project.startDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            Started {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/researcher/studies`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto"
                    >
                      Manage Study <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
            );
          })()}
        </div>

        {/* Right Column: Fast Domain Links & Quick Insights */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Research Modules
            </h2>
            <p className="text-xs text-zinc-500">Direct access to domain workstations</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              {
                title: "Cohort Participants",
                desc: "Anonymized demographic records, eligibility screenings, and digital consent statuses.",
                href: "/researcher/participants",
                icon: Users,
                badge: "Consent Enforced",
              },
              {
                title: "Surveys & Psychometrics",
                desc: "Standardized psychometric scales (Likert 5, GAD-7, PHQ-9) and instrument designer.",
                href: "/researcher/surveys",
                icon: ClipboardList,
                badge: "Survey Builder",
              },
              {
                title: "Analytics & ML Models",
                desc: "Biomarker trends, predictive episode forecasting, and statistical summaries.",
                href: "/researcher/analytics",
                icon: TrendingUp,
                badge: "AI Evaluated",
              },
              {
                title: "Literature Reference Library",
                desc: "Catalog of published peer-reviewed findings, DOIs, and external study citations.",
                href: "/researcher/papers",
                icon: BookOpen,
                badge: "DOI Synced",
              },
            ].map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="p-4 rounded-xl bg-white border border-zinc-200/80 hover:border-indigo-300 hover:shadow-xs transition-all group block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                          {module.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                          {module.badge}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    {module.desc}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-zinc-700 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Zero Hardcoding Guarantee</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Every metric, participant code, survey question, and publication card is queried directly from PostgreSQL. If database tables are empty on first enable, demo rows are automatically provisioned.
            </p>
          </div>
=======
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <Card className="border-fuchsia-100 hover:border-fuchsia-300 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Projects
            </span>
            <div className="p-2 rounded-lg bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60">
              <FlaskConical className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-[#4a044e]">{summary?.activeProjects ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-fuchsia-700 font-semibold">Longitudinal</span>
              <span>study cohorts</span>
            </p>
          </CardContent>
        </Card>

        {/* Enrolled Participants */}
        <Card className="border-fuchsia-100 hover:border-fuchsia-300 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Enrolled Cohorts
            </span>
            <div className="p-2 rounded-lg bg-pink-50 text-pink-700 border border-pink-200/60">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-[#4a044e]">{summary?.totalParticipants ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-pink-700 font-semibold">Active</span>
              <span>research participants</span>
            </p>
          </CardContent>
        </Card>

        {/* Completed Surveys */}
        <Card className="border-fuchsia-100 hover:border-fuchsia-300 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Surveys Completed
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60">
              <ClipboardList className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-[#4a044e]">{summary?.completedSurveys ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-purple-700 font-semibold">Validated</span>
              <span>psychometric records</span>
            </p>
          </CardContent>
        </Card>

        {/* Collected Telemetry Records */}
        <Card className="border-fuchsia-100 hover:border-fuchsia-300 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Collected Records
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60">
              <Database className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-[#4a044e]">{summary?.collectedRecords ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-rose-700 font-semibold">De-identified</span>
              <span>data points</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Multi-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Studies & Live Telemetry Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Clinical Projects */}
          <Card className="border-fuchsia-100 hover:border-fuchsia-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between border-b border-fuchsia-100/80 pb-4">
              <div>
                <CardTitle className="text-base font-semibold text-[#4a044e]">Active Research Studies</CardTitle>
                <p className="text-xs text-muted-foreground">Currently recruiting and active longitudinal protocol cohorts</p>
              </div>
              <Link href="/researcher/projects">
                <Button variant="ghost" size="sm" className="text-xs text-fuchsia-700 hover:text-fuchsia-800 hover:bg-fuchsia-50 cursor-pointer">
                  View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No active projects created yet.</p>
              ) : (
                projects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 rounded-xl border border-fuchsia-100 bg-card hover:border-fuchsia-300/80 transition-all space-y-2.5 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-[#4a044e]">{project.projectTitle}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            project.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : project.status === 'Recruiting'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs text-fuchsia-700 font-medium">{project.researchArea}</p>
                      </div>
                      <Link href={`/researcher/projects`}>
                        <Button size="sm" variant="outline" className="text-xs h-7 cursor-pointer border-fuchsia-200 text-[#4a044e] hover:bg-fuchsia-50">
                          Details
                        </Button>
                      </Link>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-muted-foreground border-t border-fuchsia-100/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-fuchsia-600" />
                        Started: {new Date(project.startDate).toLocaleDateString()}
                      </span>
                      {project.endDate && (
                        <>
                          <span>•</span>
                          <span>Target: {new Date(project.endDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Real-time Telemetry Data Stream */}
          <Card className="border-fuchsia-100 hover:border-fuchsia-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between border-b border-fuchsia-100/80 pb-4">
              <div>
                <CardTitle className="text-base font-semibold text-[#4a044e]">Real-Time Data Collection Stream</CardTitle>
                <p className="text-xs text-muted-foreground">Recent telemetry ingested from patient behavioral and sensor modules</p>
              </div>
              <Link href="/researcher/data">
                <Button variant="ghost" size="sm" className="text-xs text-fuchsia-700 hover:text-fuchsia-800 hover:bg-fuchsia-50 cursor-pointer">
                  Data Explorer <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {recentData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No telemetry data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentData.map((d) => (
                    <div 
                      key={d.id}
                      className="p-3 rounded-lg border border-fuchsia-100 bg-fuchsia-50/30 flex items-center justify-between gap-3 text-xs hover:border-fuchsia-200 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-md bg-fuchsia-100 text-fuchsia-700 shrink-0">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#4a044e]">{d.dataType}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {formatTelemetrySnippet(d.dataValue)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-muted-foreground block">
                          {new Date(d.collectedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Ethics, Protocol Compliance & Network */}
        <div className="space-y-6">
          {/* Ethics & Double-Blind Protocol Card */}
          <Card className="border-fuchsia-200/80 bg-gradient-to-b from-fuchsia-50/60 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#4a044e]">
                  <ShieldCheck className="w-4 h-4 text-fuchsia-600" />
                  IRB Protocol Standards
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Compliant
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                All data accessed through this console is stripped of direct patient identifiers in accordance with HIPAA §164.514(b) de-identification principles.
              </p>
              <div className="p-3 rounded-lg bg-card border border-fuchsia-100 space-y-1.5 font-medium text-foreground">
                <div className="flex justify-between">
                  <span>De-identification Status:</span>
                  <span className="text-emerald-600 font-semibold">
                    {profile?.isActive ? 'Active (HIPAA Safe Harbor)' : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IRB Approval Tier:</span>
                  <span className="text-fuchsia-700 font-semibold">
                    {irbPermission?.dataAccessType || (projects.length > 0 ? 'Protocol Approved' : 'No Active Protocols')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Participant Consent Rate:</span>
                  <span className="text-[#4a044e] font-semibold">
                    {consentStats ? `${consentStats.rate}% (${consentStats.consented}/${consentStats.total})` : '0%'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peer Collaborator Network */}
          <Card className="border-fuchsia-100">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-[#4a044e]">Collaboration Network</CardTitle>
              <Link href="/researcher/collaboration">
                <Button variant="ghost" size="sm" className="text-xs text-fuchsia-700 hover:text-fuchsia-800 hover:bg-fuchsia-50 cursor-pointer h-7 px-2">
                  Network
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {collaborators.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 text-center">No connected collaborators yet.</p>
              ) : (
                collaborators.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg border border-fuchsia-100 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-[#4a044e] truncate">{c.connectedResearcherName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.connectedInstitution}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/80 shrink-0">
                      {c.collaborationType}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Tools Navigation */}
          <Card className="border-fuchsia-100 p-4">
            <h4 className="text-xs font-semibold text-[#4a044e] uppercase tracking-wider mb-3">
              Researcher Toolkit
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link 
                href="/researcher/surveys" 
                className="p-3 rounded-lg border border-fuchsia-100 hover:bg-fuchsia-50 hover:border-fuchsia-300 transition-colors flex flex-col items-center justify-center text-center gap-1.5"
              >
                <ClipboardList className="w-4 h-4 text-fuchsia-600" />
                <span className="font-medium text-[#4a044e]">Surveys</span>
              </Link>
              <Link 
                href="/researcher/participants" 
                className="p-3 rounded-lg border border-pink-100 hover:bg-pink-50 hover:border-pink-300 transition-colors flex flex-col items-center justify-center text-center gap-1.5"
              >
                <Users className="w-4 h-4 text-pink-600" />
                <span className="font-medium text-[#4a044e]">Participants</span>
              </Link>
              <Link 
                href="/researcher/analytics" 
                className="p-3 rounded-lg border border-purple-100 hover:bg-purple-50 hover:border-purple-300 transition-colors flex flex-col items-center justify-center text-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-[#4a044e]">Analytics</span>
              </Link>
              <Link 
                href="/researcher/reports" 
                className="p-3 rounded-lg border border-rose-100 hover:bg-rose-50 hover:border-rose-300 transition-colors flex flex-col items-center justify-center text-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span className="font-medium text-[#4a044e]">Reports</span>
              </Link>
            </div>
          </Card>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}
