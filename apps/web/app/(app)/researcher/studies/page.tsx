"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  Plus,
  Search,
  Users,
  Calendar,
  ClipboardList,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  fetchResearchProjects,
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

type FilterStatus = "all" | "recruiting" | "data_collection" | "in_progress" | "completed";

export default function ClinicalStudiesPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New study form state
  const [title, setTitle] = useState("");
  const [researchArea, setResearchArea] = useState("");
  const [protocolNumber, setProtocolNumber] = useState("");
  const [targetSampleSize, setTargetSampleSize] = useState("100");
  const [status, setStatus] = useState<CreateProjectPayload["status"]>("recruiting");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const { data: projects, isLoading, isError, error } = useQuery({
    queryKey: ["research", "projects"],
    queryFn: fetchResearchProjects,
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
      toast.error(err.message || "Failed to create study");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !researchArea.trim()) {
      toast.error("Title and research area are required.");
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

  const projectList: ResearchProject[] = Array.isArray(projects)
    ? projects
    : Array.isArray((projects as any)?.projects)
    ? (projects as any).projects
    : [];

  const filteredProjects = projectList.filter((p) => {
    const matchesFilter = activeFilter === "all" || p.status === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.researchArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.protocolNumber && p.protocolNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Protocol Directory
            </span>
            <span className="text-zinc-400 text-xs">Clinical Trials & Studies</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mt-2">
            Clinical Studies Management
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Track multi-arm clinical trials, monitor cohort recruitment velocity, and manage study protocols.
          </p>
        </div>

        {/* Create Dialog */}
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
                Register a new trial or research study into PostgreSQL.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Study Title *</label>
                <Input
                  placeholder="e.g. Cognitive Reappraisal in Adolescent Social Anxiety"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Research Domain *</label>
                  <Input
                    placeholder="e.g. Behavioral Science"
                    value={researchArea}
                    onChange={(e) => setResearchArea(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Protocol Number</label>
                  <Input
                    placeholder="e.g. HLR-COG-2026-005"
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
                  placeholder="Primary study aims, intervention details..."
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
                  {createMutation.isPending ? "Saving..." : "Save Study"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 rounded-xl">
          {[
            { id: "all" as const, label: "All Studies" },
            { id: "recruiting" as const, label: "Recruiting" },
            { id: "data_collection" as const, label: "Data Collection" },
            { id: "in_progress" as const, label: "In Progress" },
            { id: "completed" as const, label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeFilter === tab.id
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Search by title or protocol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-white"
          />
        </div>
      </div>

      {/* Studies List */}
      {isLoading ? (
        <div className="p-16 text-center text-zinc-400 bg-white border border-zinc-200/80 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading clinical studies from database...
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          Failed to load studies: {(error as Error)?.message}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200/80 rounded-xl">
          <FlaskConical className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900">No Studies Found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery ? "No studies match your current search query." : "No studies in this filter category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project: ResearchProject) => {
            const enrolled = project.participants?.length || 0;
            const target = project.targetSampleSize || 1;
            const progressPercent = Math.min(Math.round((enrolled / target) * 100), 100);

            return (
              <Card
                key={project.id}
                className="bg-white border-zinc-200/80 hover:border-indigo-300 transition-all p-5 shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
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
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">
                      {project.researchArea}
                    </p>
                  </div>

                  {project.description && (
                    <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-100 space-y-3">
                  {/* Recruitment Progress Bar */}
                  {project.targetSampleSize > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                        <span>Cohort Enrollment</span>
                        <span>{enrolled} / {project.targetSampleSize} subjects ({progressPercent}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                      {project.surveys && project.surveys.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5 text-zinc-400" />
                          {project.surveys.length} {project.surveys.length === 1 ? "Survey" : "Surveys"}
                        </span>
                      )}
                      {project.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
