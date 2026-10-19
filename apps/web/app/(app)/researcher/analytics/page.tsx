"use client";

<<<<<<< Updated upstream
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Activity,
  FileCheck2,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";
import { fetchResearchAnalytics, ResearchAnalyticsItem } from "@/lib/api/research";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ResearchAnalyticsPage() {
  const { data: analyticsList, isLoading, isError, error } = useQuery({
    queryKey: ["research", "analytics"],
    queryFn: fetchResearchAnalytics,
  });

  const analyticsData: ResearchAnalyticsItem[] = Array.isArray(analyticsList)
    ? analyticsList
    : Array.isArray((analyticsList as any)?.analytics)
    ? (analyticsList as any).analytics
    : [];

  const formatAnalysisType = (type: string) => {
    return type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Statistical Intelligence
            </span>
            <span className="text-zinc-400 text-xs">Biomarker & ML Insights</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mt-2">
            Research Analytics & Findings
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Synthesized clinical findings, longitudinal biomarker response curves, and predictive machine learning validation metrics.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-zinc-400 bg-white border border-zinc-200/80 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading statistical findings and model metrics from database...
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          Failed to load analytics: {(error as Error)?.message}
        </div>
      ) : analyticsData.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200/80 rounded-xl">
          <BarChart3 className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900">No Analytics Reports Available</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Statistical computations will generate once clinical data collection begins.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsData.map((item: ResearchAnalyticsItem) => {
            let metrics: Record<string, any> = {};
            try {
              if (typeof item.metricsSummary === "string") {
                metrics = JSON.parse(item.metricsSummary);
              } else if (typeof item.metricsSummary === "object" && item.metricsSummary !== null) {
                metrics = item.metricsSummary;
              }
            } catch {
              metrics = {};
            }

            return (
              <Card
                key={item.id}
                className="bg-white border-zinc-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                      {formatAnalysisType(item.analysisType)}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.project?.title && (
                    <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                      {item.project.title}
                    </h3>
                  )}

                  {/* Metrics Key-Value Grid */}
                  {Object.keys(metrics).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {Object.entries(metrics).map(([key, val]) => (
                        <div
                          key={key}
                          className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70"
                        >
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="text-sm font-extrabold text-indigo-950 font-mono">
                            {typeof val === "number" ? val.toFixed(3) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Generated Narrative Report */}
                  {item.generatedReport && (
                    <div className="pt-2">
                      <p className="text-xs text-zinc-600 leading-relaxed bg-indigo-50/40 p-3 rounded-lg border border-indigo-100/60">
                        {item.generatedReport}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Statistical Significance Verified
                  </span>
                </div>
              </Card>
            );
          })}
=======
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnalytics, generateAnalytics, fetchProjects } from "@/lib/api/researcher";
import { 
  BarChart3, Sparkles, Plus, TrendingUp, ShieldCheck,
  Calendar, X, FlaskConical
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResearcherAnalyticsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [analysisType, setAnalysisType] = useState("Intervention Efficacy");
  const [resultSummary, setResultSummary] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");

  const { data: projectsData } = useQuery({
    queryKey: ['researcher', 'projects'],
    queryFn: fetchProjects,
  });
  const projects = projectsData?.data || [];

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['researcher', 'analytics'],
    queryFn: fetchAnalytics,
  });
  const analytics = analyticsData?.data || [];

  const createMutation = useMutation({
    mutationFn: generateAnalytics,
    onSuccess: () => {
      toast.success("Statistical synthesis model completed.");
      queryClient.invalidateQueries({ queryKey: ['researcher', 'analytics'] });
      setModalOpen(false);
      setResultSummary("");
      setGeneratedReport("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate analytics.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projId = selectedProjectId || (projects[0]?.id);
    if (!projId) {
      toast.error("Please select a study project.");
      return;
    }
    if (!resultSummary.trim()) {
      toast.error("Summary is required.");
      return;
    }

    createMutation.mutate({
      projectId: projId,
      analysisType,
      resultSummary: resultSummary.trim(),
      generatedReport: generatedReport.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#4a044e] flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
              <BarChart3 className="w-5 h-5 text-fuchsia-600" />
            </span>
            Research Analytics & AI Synthesis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multivariate statistical modeling, biomarker correlation matrices, and AI-synthesized research findings.
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white cursor-pointer text-xs font-semibold shadow-xs"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Run Statistical Synthesis
        </Button>
      </div>

      {/* Analytics Summary — counts derived from fetched data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-fuchsia-100 hover:border-fuchsia-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Analyses</span>
            <TrendingUp className="w-4 h-4 text-fuchsia-600" />
          </div>
          <div className="text-2xl font-bold text-[#4a044e]">{analytics.length}</div>
          <p className="text-xs text-fuchsia-700 font-medium mt-1">Synthesis reports generated</p>
        </Card>

        <Card className="p-5 border-pink-100 hover:border-pink-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Linked Projects</span>
            <FlaskConical className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-bold text-[#4a044e]">{projects.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Active study protocols</p>
        </Card>

        <Card className="p-5 border-purple-100 hover:border-purple-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Protocols</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-[#4a044e]">
            {projects.filter((p: any) => p.status === 'Active').length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Under protocol monitoring</p>
        </Card>
      </div>

      {/* Analytics Reports List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#4a044e] uppercase tracking-wider">
          Synthesized Analysis Reports ({analytics.length})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-muted/40 animate-pulse border border-fuchsia-100" />
            ))}
          </div>
        ) : analytics.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground border-dashed border-fuchsia-200">
            <BarChart3 className="w-10 h-10 mx-auto text-fuchsia-400 mb-2" />
            <p className="font-semibold text-[#4a044e]">No Statistical Syntheses Computed</p>
            <p className="text-xs text-muted-foreground mt-1">
              Trigger a synthesis computation above to evaluate study telemetry.
            </p>
          </Card>
        ) : (
          analytics.map((a: any) => (
            <Card key={a.id} className="border-fuchsia-100 hover:border-fuchsia-300 transition-all p-5 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-fuchsia-100/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200/80 uppercase tracking-wider">
                      {a.analysisType}
                    </span>
                    <h4 className="text-sm font-bold text-[#4a044e] mt-1">{a.resultSummary}</h4>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>

              {a.generatedReport && (
                <div className="p-3.5 bg-fuchsia-50/40 rounded-lg text-xs text-muted-foreground leading-relaxed border border-fuchsia-100/70">
                  <span className="font-semibold text-[#4a044e] block mb-1">Statistical Methodology & AI Synthesis:</span>
                  {a.generatedReport}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Run Analysis Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-popover text-popover-foreground rounded-2xl max-w-lg w-full border border-fuchsia-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-fuchsia-100 pb-3">
              <h2 className="text-base font-bold text-[#4a044e] flex items-center gap-2">
                <span className="p-1 rounded-lg bg-fuchsia-100 text-fuchsia-700">
                  <Sparkles className="w-4 h-4 text-fuchsia-600" />
                </span>
                Run Statistical Synthesis
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-[#4a044e] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Associated Study Project *</label>
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full h-9 rounded-md border border-fuchsia-200 bg-card px-3 text-xs"
                >
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.projectTitle}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Analysis Model Type</label>
                <select 
                  value={analysisType} 
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full h-9 rounded-md border border-fuchsia-200 bg-card px-3 text-xs"
                >
                  <option value="Intervention Efficacy">Intervention Efficacy (Pre/Post)</option>
                  <option value="Demographic Correlation">Demographic Correlation Matrix</option>
                  <option value="Symptom Trajectory">Symptom Trajectory Regression</option>
                  <option value="Retention & Adherence">Cohort Retention & Adherence Rate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Primary Result Summary *</label>
                <Input 
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                  placeholder="e.g. Statistically significant 42% reduction in cortisol spikes (p < 0.01)"
                  className="text-xs border-fuchsia-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Detailed Report & Findings</label>
                <textarea 
                  value={generatedReport}
                  onChange={(e) => setGeneratedReport(e.target.value)}
                  placeholder="Detail sample cohort variance, p-values, regression coefficients, and clinical implications..."
                  rows={4}
                  className="w-full rounded-md border border-fuchsia-200 bg-card p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-fuchsia-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="border-fuchsia-200 text-[#4a044e] hover:bg-fuchsia-50">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createMutation.isPending} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-xs">
                  {createMutation.isPending ? "Computing..." : "Execute Synthesis"}
                </Button>
              </div>
            </form>
          </div>
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}
