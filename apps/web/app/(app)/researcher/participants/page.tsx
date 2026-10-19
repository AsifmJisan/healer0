"use client";

import { useState } from "react";
<<<<<<< Updated upstream
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Loader2,
  AlertCircle,
  Filter
} from "lucide-react";
import { fetchResearchParticipants, ResearchParticipant } from "@/lib/api/research";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ConsentFilter = "all" | "consented" | "pending" | "withdrawn";

export default function CohortParticipantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [consentFilter, setConsentFilter] = useState<ConsentFilter>("all");

  const { data: participants, isLoading, isError, error } = useQuery({
    queryKey: ["research", "participants"],
    queryFn: fetchResearchParticipants,
  });

  const participantList: ResearchParticipant[] = Array.isArray(participants)
    ? participants
    : Array.isArray((participants as any)?.participants)
    ? (participants as any).participants
    : [];

  const filtered = participantList.filter((p) => {
    const matchesConsent = consentFilter === "all" || p.consentStatus === consentFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.participantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.project?.title && p.project.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.ageGroup && p.ageGroup.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesConsent && matchesSearch;
  });

  const getEligibilityBadge = (status: string) => {
    switch (status) {
      case "eligible":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "ineligible":
        return "bg-red-50 text-red-700 border-red-200/80";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
  };

  const getConsentBadge = (status: string) => {
    switch (status) {
      case "consented":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "withdrawn":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Anonymized Registry
            </span>
            <span className="text-zinc-400 text-xs">Pseudonymized Subjects</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mt-2">
            Cohort Participants & Consent
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Review pseudonymized subject records, clinical screening eligibility, and digital informed consent logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero PII Exposed</span>
          </span>
        </div>
      </div>

      {/* Anonymization Notice Banner */}
      <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs text-zinc-700">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-indigo-950">
            Privacy & De-Identification Safeguards
          </p>
          <p className="text-zinc-600 leading-relaxed">
            All subjects are mapped to synthetic participant codes (e.g., <code className="bg-indigo-100/70 px-1 py-0.5 rounded font-mono text-[11px]">HLR-P-1001</code>). Names, phone numbers, and identifying contact details are decoupled to preserve blinded research ethics.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 rounded-xl">
          {[
            { id: "all" as const, label: "All Participants" },
            { id: "consented" as const, label: "Consented" },
            { id: "pending" as const, label: "Consent Pending" },
            { id: "withdrawn" as const, label: "Withdrawn" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setConsentFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                consentFilter === tab.id
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
            placeholder="Search by code or study..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-white"
          />
        </div>
      </div>

      {/* Participants Table */}
      {isLoading ? (
        <div className="p-16 text-center text-zinc-400 bg-white border border-zinc-200/80 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading cohort participants from database...
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          Failed to load participants: {(error as Error)?.message}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200/80 rounded-xl">
          <Users className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900">No Participants Found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery ? "No participants match your query." : "No participants match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Participant Code</th>
                  <th className="px-5 py-3.5">Assigned Clinical Study</th>
                  <th className="px-5 py-3.5">Demographics</th>
                  <th className="px-5 py-3.5">Screening Status</th>
                  <th className="px-5 py-3.5">Informed Consent</th>
                  <th className="px-5 py-3.5">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((p: ResearchParticipant) => (
                  <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-zinc-900">
                      {p.participantCode}
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-800 max-w-xs truncate">
                      {p.project?.title || "Clinical Study"}
                      {p.project?.protocolNumber && (
                        <span className="block text-[11px] font-mono text-zinc-400 mt-0.5">
                          {p.project.protocolNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      <span>{p.gender || "Unspecified"}</span>
                      {p.ageGroup && (
                        <span className="text-zinc-400 block text-[11px]">
                          Age: {p.ageGroup}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getEligibilityBadge(p.eligibilityStatus)
                        )}
                      >
                        {p.eligibilityStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getConsentBadge(p.consentStatus)
                        )}
                      >
                        {p.consentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {new Date(p.joinedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
=======
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchParticipants, addParticipant, fetchScreeningRecords, 
  fetchMatchingRequests, createMatchingRequest, fetchProjects 
} from "@/lib/api/researcher";
import { 
  Users, UserPlus, Filter, ShieldCheck, Sparkles, CheckCircle2, 
  AlertCircle, X, Search, Check, Layers
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResearcherParticipantsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'cohort' | 'screening' | 'matching'>('cohort');

  // Modals
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  // Enroll form state
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [ageGroup, setAgeGroup] = useState("25-34");
  const [gender, setGender] = useState("Female");
  const [eligibility, setEligibility] = useState("Eligible");
  const [consent, setConsent] = useState("Consented");
  const [screeningCriteria, setScreeningCriteria] = useState("");

  // Matching form state
  const [matchingTargetGroup, setMatchingTargetGroup] = useState("");
  const [matchingCriteria, setMatchingCriteria] = useState("");

  const { data: projectsData } = useQuery({
    queryKey: ['researcher', 'projects'],
    queryFn: fetchProjects,
  });
  const projects = projectsData?.data || [];

  const { data: participantsData, isLoading: loadingParticipants } = useQuery({
    queryKey: ['researcher', 'participants'],
    queryFn: () => fetchParticipants(),
  });
  const participants = participantsData?.data || [];

  const { data: screeningData, isLoading: loadingScreening } = useQuery({
    queryKey: ['researcher', 'screening'],
    queryFn: () => fetchScreeningRecords(),
  });
  const screeningRecords = screeningData?.data || [];

  const { data: matchingData, isLoading: loadingMatching } = useQuery({
    queryKey: ['researcher', 'matching'],
    queryFn: fetchMatchingRequests,
  });
  const matchingRequests = matchingData?.data?.requests || [];
  const matchedList = matchingData?.data?.matched || [];

  const enrollMutation = useMutation({
    mutationFn: addParticipant,
    onSuccess: () => {
      toast.success("Subject enrolled and screening record created.");
      queryClient.invalidateQueries({ queryKey: ['researcher', 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['researcher', 'screening'] });
      queryClient.invalidateQueries({ queryKey: ['researcher', 'dashboard'] });
      setEnrollModalOpen(false);
      setScreeningCriteria("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to enroll participant.");
    },
  });

  const matchingMutation = useMutation({
    mutationFn: createMatchingRequest,
    onSuccess: () => {
      toast.success("AI Participant Matching completed!");
      queryClient.invalidateQueries({ queryKey: ['researcher', 'matching'] });
      setMatchModalOpen(false);
      setMatchingTargetGroup("");
      setMatchingCriteria("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to execute matching request.");
    },
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projId = selectedProjectId || (projects[0]?.id);
    if (!projId) {
      toast.error("Please create or select a study project first.");
      return;
    }
    enrollMutation.mutate({
      projectId: projId,
      ageGroup,
      gender,
      eligibilityStatus: eligibility,
      consentStatus: consent,
      screeningCriteria: screeningCriteria.trim() || undefined,
    });
  };

  const handleMatchingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projId = selectedProjectId || (projects[0]?.id);
    if (!projId) {
      toast.error("Please select a study project.");
      return;
    }
    matchingMutation.mutate({
      projectId: projId,
      targetGroup: matchingTargetGroup.trim() || "Adults aged 18-45",
      criteria: { notes: matchingCriteria.trim() || "Baseline clinical alignment" },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#4a044e] flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
              <Users className="w-5 h-5 text-fuchsia-600" />
            </span>
            Participants & Cohort Screening
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anonymized subject directory, clinical screening audits, and AI-assisted cohort matching.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setMatchModalOpen(true)}
            variant="outline"
            className="border-fuchsia-200 text-[#4a044e] hover:bg-fuchsia-50 cursor-pointer text-xs"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-fuchsia-600" />
            AI Cohort Matching
          </Button>
          <Button 
            onClick={() => setEnrollModalOpen(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white cursor-pointer text-xs font-semibold shadow-xs"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Enroll Subject
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-fuchsia-100 gap-2">
        <button
          onClick={() => setActiveTab('cohort')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'cohort'
              ? 'border-fuchsia-600 text-[#4a044e]'
              : 'border-transparent text-muted-foreground hover:text-[#4a044e]'
          }`}
        >
          Enrolled Cohort ({participants.length})
        </button>
        <button
          onClick={() => setActiveTab('screening')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'screening'
              ? 'border-fuchsia-600 text-[#4a044e]'
              : 'border-transparent text-muted-foreground hover:text-[#4a044e]'
          }`}
        >
          Clinical Screening Audits ({screeningRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'matching'
              ? 'border-fuchsia-600 text-[#4a044e]'
              : 'border-transparent text-muted-foreground hover:text-[#4a044e]'
          }`}
        >
          AI Match Requests ({matchingRequests.length})
        </button>
      </div>

      {/* Tab 1: Cohort Table */}
      {activeTab === 'cohort' && (
        <Card className="border-border/80">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">De-Identified Participant Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingParticipants ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading participants...</div>
            ) : participants.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="font-semibold text-foreground">No participants enrolled</p>
                <p className="text-xs text-muted-foreground mt-1">Enroll your first participant using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Subject ID</th>
                      <th className="py-3 px-4 font-semibold">Age Bracket</th>
                      <th className="py-3 px-4 font-semibold">Gender</th>
                      <th className="py-3 px-4 font-semibold">Eligibility</th>
                      <th className="py-3 px-4 font-semibold">Consent Status</th>
                      <th className="py-3 px-4 font-semibold">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {participants.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {p.participantCode}
                        </td>
                        <td className="py-3.5 px-4 text-foreground">{p.ageGroup}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{p.gender}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            p.eligibilityStatus === 'Eligible'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {p.eligibilityStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200/80 uppercase tracking-wider">
                            {p.consentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(p.joinedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Screening Audits */}
      {activeTab === 'screening' && (
        <Card className="border-border/80">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">Screening Criteria Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingScreening ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading screening records...</div>
            ) : screeningRecords.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <ShieldCheck className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="font-semibold text-foreground">No screening records recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Evaluation Criteria</th>
                      <th className="py-3 px-4 font-semibold">Audit Result</th>
                      <th className="py-3 px-4 font-semibold">Screened Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {screeningRecords.map((s: any) => (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 text-foreground font-medium max-w-md">
                          {s.criteria}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            s.result === 'Passed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {s.result}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(s.screenedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Matching Requests */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">AI Participant Matching Results</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {matchedList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Sparkles className="w-8 h-8 mx-auto text-fuchsia-400 mb-2" />
                  <p className="font-semibold text-foreground">No AI matches computed yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "AI Cohort Matching" above to find candidates aligned with study criteria.
                  </p>
                </div>
              ) : (
                matchedList.map((m: any) => (
                  <div key={m.id} className="p-4 rounded-xl border border-fuchsia-100 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200/80 px-2 py-0.5 rounded-md font-mono text-xs">
                          Score: {m.matchScore}
                        </span>
                        <span className="font-semibold text-[#4a044e]">Candidate Alignment</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs cursor-pointer border-fuchsia-200 text-[#4a044e] hover:bg-fuchsia-50">
                        View Criteria
                      </Button>
                      <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold">
                        Approve Candidate
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-popover text-popover-foreground rounded-2xl max-w-md w-full border border-fuchsia-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-fuchsia-100 pb-3">
              <h2 className="text-base font-bold text-[#4a044e] flex items-center gap-2">
                <span className="p-1 rounded-lg bg-fuchsia-100 text-fuchsia-700">
                  <UserPlus className="w-4 h-4 text-fuchsia-600" />
                </span>
                Enroll Clinical Subject
              </h2>
              <button onClick={() => setEnrollModalOpen(false)} className="text-muted-foreground hover:text-[#4a044e] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Assign to Study Project *</label>
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
                >
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.projectTitle}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Age Group</label>
                  <select 
                    value={ageGroup} 
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
                  >
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-49">35-49</option>
                    <option value="50-64">50-64</option>
                    <option value="65+">65+</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Eligibility</label>
                  <select 
                    value={eligibility} 
                    onChange={(e) => setEligibility(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
                  >
                    <option value="Eligible">Eligible</option>
                    <option value="Pending">Pending</option>
                    <option value="Ineligible">Ineligible</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Consent Status</label>
                  <select 
                    value={consent} 
                    onChange={(e) => setConsent(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
                  >
                    <option value="Consented">Consented</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Screening Criteria Notes</label>
                <textarea 
                  value={screeningCriteria}
                  onChange={(e) => setScreeningCriteria(e.target.value)}
                  placeholder="Record criteria met: e.g. GAD-7 baseline score > 10, no history of substance abuse..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-card p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-fuchsia-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEnrollModalOpen(false)} className="border-fuchsia-200 text-[#4a044e] hover:bg-fuchsia-50">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={enrollMutation.isPending} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-xs">
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll Subject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matching Modal */}
      {matchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-popover text-popover-foreground rounded-2xl max-w-md w-full border border-fuchsia-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-fuchsia-100 pb-3">
              <h2 className="text-base font-bold text-[#4a044e] flex items-center gap-2">
                <span className="p-1 rounded-lg bg-fuchsia-100 text-fuchsia-700">
                  <Sparkles className="w-4 h-4 text-fuchsia-600" />
                </span>
                Run AI Participant Matching
              </h2>
              <button onClick={() => setMatchModalOpen(false)} className="text-muted-foreground hover:text-[#4a044e] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMatchingSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Study Project *</label>
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
                <label className="font-semibold">Target Demographic Cohort</label>
                <Input 
                  value={matchingTargetGroup}
                  onChange={(e) => setMatchingTargetGroup(e.target.value)}
                  placeholder="e.g. Young adults with chronic sleep disturbances"
                  className="text-xs border-fuchsia-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Matching Constraints & Biomarkers</label>
                <textarea 
                  value={matchingCriteria}
                  onChange={(e) => setMatchingCriteria(e.target.value)}
                  placeholder="Specify symptom thresholds, therapy compliance, or wearable telemetry patterns..."
                  rows={3}
                  className="w-full rounded-md border border-fuchsia-200 bg-card p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-fuchsia-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setMatchModalOpen(false)} className="border-fuchsia-200 text-[#4a044e] hover:bg-fuchsia-50">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={matchingMutation.isPending} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-xs">
                  {matchingMutation.isPending ? "Computing..." : "Run AI Matching"}
                </Button>
              </div>
            </form>
>>>>>>> Stashed changes
          </div>
        </div>
      )}
    </div>
  );
}
