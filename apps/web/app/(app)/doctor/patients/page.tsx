"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPatientRecords, fetchPatientDetails, updatePatientRisk } from "@/lib/api/doctor";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Users, AlertTriangle, Activity, Search, ShieldAlert, FileText, 
  ChevronRight, Clock, HeartPulse, ClipboardList, BookOpen, Smile, Sparkles 
} from "lucide-react";

export default function PatientRecordsPage() {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "wellness" | "assessments" | "crisis">("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-patients"],
    queryFn: () => fetchPatientRecords(),
  });

  const { data: detailsData, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["doctor-patient-details", activePatient?.id],
    queryFn: () => fetchPatientDetails(activePatient.id),
    enabled: !!activePatient?.id,
  });

  const updateRiskMutation = useMutation({
    mutationFn: ({ id, riskLevel, notes }: { id: string; riskLevel: string; notes?: string }) =>
      updatePatientRisk(id, riskLevel, notes),
    onSuccess: () => {
      toast.success("Patient risk status updated");
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-details", activePatient?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update risk level");
    },
  });

  const patients = data?.data || [];

  const filteredPatients = patients.filter((record: any) => {
    const patientName = record.patient?.user?.name?.toLowerCase() || record.patientName?.toLowerCase() || "";
    const condition = record.condition?.toLowerCase() || "";
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || condition.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "all") return true;

    const recordDate = new Date(record.createdAt);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (selectedFilter === "today") return recordDate >= startOfToday && recordDate <= endOfToday;
    if (selectedFilter === "past") return recordDate < startOfToday;
    if (selectedFilter === "future") return recordDate > endOfToday;

    return true;
  });

  const details = detailsData?.data;
  const visitSummary = details?.visitSummary;
  const moodLogs = details?.moodLogs || [];
  const journals = details?.journals || [];
  const assessmentsList = details?.assessments || [];
  const crisisEvents = details?.crisisEvents || [];

  // Computed wellness averages
  const avgStress = moodLogs.length > 0 
    ? (moodLogs.reduce((acc: number, m: any) => acc + (m.stressLevel || 0), 0) / moodLogs.length).toFixed(1)
    : null;
  const avgAnxiety = moodLogs.length > 0 
    ? (moodLogs.reduce((acc: number, m: any) => acc + (m.anxietyLevel || 0), 0) / moodLogs.length).toFixed(1)
    : null;
  const avgSleep = moodLogs.length > 0 
    ? (moodLogs.reduce((acc: number, m: any) => acc + (m.sleepQuality || 0), 0) / moodLogs.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Records Directory</h1>
          <p className="text-slate-500 text-sm mt-1">
            Access complete medical records, condition history, wellness insights, and clinical risk levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "today", "past", "future"].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
              selectedFilter === filter
                ? "bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading patient directory...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No patient records found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Condition</th>
                  <th className="px-5 py-3">Risk Level</th>
                  <th className="px-5 py-3">Sessions</th>
                  <th className="px-5 py-3">Last Record Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((record: any) => {
                  const patientName = record.patient?.user?.name || record.patientName || "Patient";
                  const patientEmail = record.patient?.user?.email || "";

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-700">
                            {patientName[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{patientName}</span>
                            <span className="text-slate-400 text-[11px]">{patientEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {record.condition || "General Consultation"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1",
                            record.riskLevel === "Low" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                            record.riskLevel === "Moderate" && "bg-amber-50 text-amber-700 border border-amber-200",
                            record.riskLevel === "High" && "bg-rose-50 text-rose-700 border border-rose-200",
                            record.riskLevel === "Critical" && "bg-red-100 text-red-800 border border-red-300 font-bold"
                          )}
                        >
                          {(record.riskLevel === "High" || record.riskLevel === "Critical") && (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {record.riskLevel}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {record.previousSessions || 0}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            setActivePatient(record);
                            setActiveTab("overview");
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Patient Record & Health Insights Modal */}
      {activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center font-bold text-teal-800 text-base">
                  {(details?.record?.patient?.user?.name || activePatient.patientName || "P")[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {details?.record?.patient?.user?.name || activePatient.patientName || "Patient Record"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {details?.record?.patient?.user?.email || "No email provided"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePatient(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5",
                  activeTab === "overview"
                    ? "border-teal-600 text-teal-700 bg-teal-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Record & Summary
              </button>
              <button
                onClick={() => setActiveTab("wellness")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5",
                  activeTab === "wellness"
                    ? "border-teal-600 text-teal-700 bg-teal-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                Wellness & Mood ({moodLogs.length})
              </button>
              <button
                onClick={() => setActiveTab("assessments")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5",
                  activeTab === "assessments"
                    ? "border-teal-600 text-teal-700 bg-teal-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Assessments ({assessmentsList.length})
              </button>
              {crisisEvents.length > 0 && (
                <button
                  onClick={() => setActiveTab("crisis")}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 text-rose-700",
                    activeTab === "crisis"
                      ? "border-rose-600 text-rose-800 bg-rose-50"
                      : "border-transparent hover:text-rose-900"
                  )}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Crisis Alerts ({crisisEvents.length})
                </button>
              )}
            </div>

            {/* Tab 1: Overview & Visit Summary */}
            {activeTab === "overview" && (
              <div className="space-y-4 text-xs text-slate-700">
                {/* Visit Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <p className="text-[11px] text-slate-500 font-medium">Total Visits</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {visitSummary?.totalVisits || activePatient.previousSessions || 1}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <p className="text-[11px] text-slate-500 font-medium">Consultation Time</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {visitSummary?.totalConsultationMinutes || (activePatient.previousSessions || 1) * 45} mins
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <p className="text-[11px] text-slate-500 font-medium">First Visit</p>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      {visitSummary?.firstVisitDate ? new Date(visitSummary.firstVisitDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <p className="text-[11px] text-slate-500 font-medium">Last Visit</p>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      {visitSummary?.lastVisitDate ? new Date(visitSummary.lastVisitDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-1">Primary Condition:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    {activePatient.condition || "None specified"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-1">Medical History:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 whitespace-pre-wrap">
                    {activePatient.medicalHistory || "No detailed history recorded."}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-2">Update Clinical Risk Level:</span>
                  <div className="flex items-center gap-2">
                    {["Low", "Moderate", "High", "Critical"].map((risk) => (
                      <button
                        key={risk}
                        onClick={() => {
                          updateRiskMutation.mutate({ id: activePatient.id, riskLevel: risk });
                          setActivePatient((prev: any) => ({ ...prev, riskLevel: risk }));
                        }}
                        disabled={updateRiskMutation.isPending}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                          activePatient.riskLevel === risk
                            ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Wellness Insights & Journal Logs */}
            {activeTab === "wellness" && (
              <div className="space-y-4 text-xs text-slate-700">
                {/* Mood Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-center">
                    <p className="text-[11px] text-amber-700 font-medium">Avg Stress Level</p>
                    <p className="text-lg font-bold text-amber-900 mt-0.5">{avgStress ? `${avgStress} / 10` : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-sky-50/60 border border-sky-200/80 rounded-lg text-center">
                    <p className="text-[11px] text-sky-700 font-medium">Avg Anxiety Level</p>
                    <p className="text-lg font-bold text-sky-900 mt-0.5">{avgAnxiety ? `${avgAnxiety} / 10` : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
                    <p className="text-[11px] text-emerald-700 font-medium">Avg Sleep Quality</p>
                    <p className="text-lg font-bold text-emerald-900 mt-0.5">{avgSleep ? `${avgSleep} / 10` : 'N/A'}</p>
                  </div>
                </div>

                {/* Mood History List */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Recent Mood Logs</h3>
                  {moodLogs.length === 0 ? (
                    <p className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-400 text-center">
                      No mood tracking data recorded by patient yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {moodLogs.map((m: any) => (
                        <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800 capitalize">{m.moodType}</span>
                            {m.notes && <p className="text-slate-500 text-[11px] mt-0.5">{m.notes}</p>}
                          </div>
                          <div className="text-right text-[11px] text-slate-500">
                            <span className="block font-medium">Stress: {m.stressLevel}/10 | Sleep: {m.sleepQuality}/10</span>
                            <span>{new Date(m.recordedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patient Journals */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    Patient Journal Entries (Read-Only)
                  </h3>
                  {journals.length === 0 ? (
                    <p className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-400 text-center">
                      No journal entries published.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {journals.map((j: any) => (
                        <div key={j.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{j.title}</span>
                            {j.aiSentiment && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">
                                {j.aiSentiment} Sentiment
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{j.content}</p>
                          <p className="text-[10px] text-slate-400 text-right pt-1">
                            {new Date(j.entryDate || j.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Clinical Assessments */}
            {activeTab === "assessments" && (
              <div className="space-y-3 text-xs text-slate-700">
                <h3 className="font-semibold text-slate-900 mb-2">Completed Psychological & Clinical Assessments</h3>
                {assessmentsList.length === 0 ? (
                  <p className="p-6 bg-slate-50 rounded-lg border border-slate-100 text-slate-400 text-center">
                    No clinical assessment results available for this patient.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {assessmentsList.map((a: any) => (
                      <div key={a.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{a.title}</span>
                            <span className="text-slate-500 text-[11px]">{a.category} Assessment</span>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                              a.severityLevel === "Low" && "bg-emerald-100 text-emerald-800 border border-emerald-300",
                              a.severityLevel === "Medium" && "bg-amber-100 text-amber-800 border border-amber-300",
                              a.severityLevel === "High" && "bg-rose-100 text-rose-800 border border-rose-300"
                            )}>
                              {a.severityLevel} Severity
                            </span>
                            <p className="text-xs font-bold text-slate-800 mt-1">Score: {a.score}</p>
                          </div>
                        </div>
                        {a.aiRecommendation && (
                          <div className="p-2 bg-white border border-slate-200/80 rounded text-[11px] text-slate-600">
                            <span className="font-semibold text-teal-700 block mb-0.5">Clinical Note:</span>
                            {a.aiRecommendation}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 text-right">
                          Completed: {new Date(a.completedDate || a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Crisis Events */}
            {activeTab === "crisis" && (
              <div className="space-y-3 text-xs text-slate-700">
                <h3 className="font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Flagged Crisis Events
                </h3>
                <div className="space-y-3">
                  {crisisEvents.map((ev: any) => (
                    <div key={ev.id} className="p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 text-sm">{ev.detectedIssue}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                          {ev.riskLevel} Risk
                        </span>
                      </div>
                      {ev.aiResponse && (
                        <p className="p-2 bg-white rounded border border-rose-100 text-xs text-slate-700">
                          {ev.aiResponse}
                        </p>
                      )}
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                        <span>Emergency Contacted: {ev.emergencyContacted ? 'Yes' : 'No'}</span>
                        <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActivePatient(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
