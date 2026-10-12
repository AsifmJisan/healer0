"use client";

import { useState } from "react";
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
          </div>
        </div>
      )}
    </div>
  );
}
