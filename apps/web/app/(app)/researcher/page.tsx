"use client";

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
        </div>
      </div>

      {/* KPI Metric Cards */}
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
        </div>
      </div>
    </div>
  );
}
