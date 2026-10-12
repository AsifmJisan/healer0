"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDoctorOverview } from "@/lib/api/doctor";
import { cn } from "@/lib/utils";
import { Calendar, Pill, Users, Star, AlertTriangle, ShieldAlert, HeartPulse } from "lucide-react";

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className={cn(
      "rounded-xl border p-5 flex items-start gap-4 transition-shadow hover:shadow-md",
      "bg-white border-slate-200/80"
    )}>
      <div className={cn("p-3 rounded-lg shrink-0", accent)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const statusColors: Record<string, string> = {
  'scheduled': 'bg-teal-50 text-teal-700 border-teal-200',
  'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'canceled': 'bg-red-50 text-red-700 border-red-200',
};

const riskColors: Record<string, string> = {
  'Low': 'bg-emerald-50 text-emerald-700',
  'Moderate': 'bg-amber-50 text-amber-700',
  'High': 'bg-orange-50 text-orange-700',
  'Critical': 'bg-red-50 text-red-700',
};

export default function DoctorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['doctor-overview'],
    queryFn: () => fetchDoctorOverview(),
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's your clinical overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Appointments"
          value={stats?.todayAppointmentsCount ?? 0}
          icon={<Calendar className="w-5 h-5 text-teal-600" />}
          accent="bg-teal-50"
        />
        <StatCard
          label="Active Patients"
          value={stats?.activePatientsCount ?? 0}
          icon={<Users className="w-5 h-5 text-sky-600" />}
          accent="bg-sky-50"
        />
        <StatCard
          label="Crisis Events Flagged"
          value={stats?.recentCrisisEvents?.length ?? 0}
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
          accent="bg-rose-50"
        />
        <StatCard
          label="Rating"
          value={stats?.avgRating ? `${stats.avgRating} / 5` : 'N/A'}
          icon={<Star className="w-5 h-5 text-amber-500" />}
          accent="bg-amber-50"
        />
      </div>

      {/* Emergency & Crisis Alert Banner if any active crisis */}
      {stats?.recentCrisisEvents && stats.recentCrisisEvents.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
            <h2>Emergency & Crisis Event Alerts ({stats.recentCrisisEvents.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.recentCrisisEvents.map((ev: any) => (
              <div key={ev.id} className="bg-white border border-rose-200/80 rounded-lg p-3.5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{ev.patientName}</p>
                    <p className="text-xs text-rose-600 font-medium">{ev.detectedIssue}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                    {ev.riskLevel || 'High'} Risk
                  </span>
                </div>
                {ev.aiResponse && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                    "{ev.aiResponse}"
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Contacted: {ev.emergencyContacted ? 'Yes' : 'No'}</span>
                  <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Today's Schedule + High Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Schedule</h2>
          {(!stats?.todayAppointments || stats.todayAppointments.length === 0) ? (
            <p className="text-sm text-slate-400 py-8 text-center">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {stats.todayAppointments.map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{appt.patientName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{appt.reason}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-slate-500 font-medium">
                      {formatTime(appt.appointmentDate)}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      statusColors[appt.status] || 'bg-slate-50 text-slate-600'
                    )}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Risk Patient Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">Patient Risk Alerts</h2>
          </div>
          {(!stats?.criticalPatients || stats.criticalPatients.length === 0) ? (
            <p className="text-sm text-slate-400 py-8 text-center">No high-risk or critical patients at this time.</p>
          ) : (
            <div className="space-y-3">
              {stats.criticalPatients.map((patient: any) => (
                <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-sm">{patient.patientName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{patient.condition}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0",
                    riskColors[patient.riskLevel] || 'bg-slate-100 text-slate-600'
                  )}>
                    {patient.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
