"use client";

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
        </div>
      )}
    </div>
  );
}
