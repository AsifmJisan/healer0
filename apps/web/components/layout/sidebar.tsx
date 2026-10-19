"use client";

import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Users, Activity, Calendar, FileText, Settings, ShieldAlert, BookOpen, ShieldCheck, HeartPulse,
  LayoutDashboard, MessageSquare, Pill, UserCheck, User,
  Bot, Smile, Sparkles, ClipboardList, BookMarked, FolderHeart,
<<<<<<< Updated upstream
  FlaskConical, BarChart3, Library
=======
  FlaskConical, Database, BarChart3, Share2, Stethoscope, Search, Layers
>>>>>>> Stashed changes
} from "lucide-react";
import { SidebarNavLink } from "./sidebar-nav-link";
import { SidebarNavFolder, SidebarNavFolderChild } from "./sidebar-nav-folder";

export type SystemRole = 'patient' | 'doctor' | 'researcher' | 'admin' | 'super_admin' | 'user';

export interface NavItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarNavFolderChild[];
}

export interface RoleSidebarConfig {
  mainNav: NavItem[];
  sessionsNav?: NavItem[];
  footerNav: NavItem[];
}

export const getSidebarConfig = (role?: SystemRole | string): RoleSidebarConfig => {
  switch (role) {
    case 'doctor':
      return {
        mainNav: [
          { href: '/doctor', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { href: '/doctor/appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
          { href: '/doctor/counseling', label: 'Counseling', icon: <MessageSquare className="w-4 h-4" /> },
          { href: '/doctor/patients', label: 'Patient Records', icon: <Users className="w-4 h-4" /> },
        ],
        sessionsNav: [
          { href: '/doctor/sessions', label: 'Sessions', icon: <ClipboardList className="w-4 h-4" /> },
        ],
        footerNav: [
          { href: '/doctor/profile', label: 'Doctor Profile', icon: <UserCheck className="w-4 h-4" /> },
          { href: '/doctor/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
          { href: '/researcher', label: 'Researcher View', icon: <FlaskConical className="w-4 h-4" /> },
          { href: '/patient', label: 'Switch to Patient View', icon: <User className="w-4 h-4" /> },
        ],
      };
    case 'patient':
    case 'user':
      return {
        mainNav: [
          { href: '/patient', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
          {
            label: 'Self Care',
            icon: <FolderHeart className="w-4 h-4" />,
            children: [
              { href: '/patient/counseling', label: 'AI Counseling', icon: <Bot className="w-4 h-4" /> },
              { href: '/patient/mood', label: 'Daily Mood Tracking', icon: <Smile className="w-4 h-4" /> },
              { href: '/patient/journal', label: 'Reflective Journal', icon: <BookMarked className="w-4 h-4" /> },
            ],
          },
          {
            label: 'Therapy & Assessments',
            icon: <ClipboardList className="w-4 h-4" />,
            children: [
              { href: '/patient/therapy', label: 'Therapy & Relaxation', icon: <Sparkles className="w-4 h-4" /> },
              { href: '/patient/assessments', label: 'Clinical Assessments', icon: <FileText className="w-4 h-4" /> },
            ],
          },
          { href: '/patient/appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
          { href: '/patient/community', label: 'Anonymous Community', icon: <Users className="w-4 h-4" /> },
        ],
        footerNav: [
          { href: '/researcher', label: 'Researcher View', icon: <FlaskConical className="w-4 h-4" /> },
          { href: '/patient/settings', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> },
        ],
      };
    case 'researcher':
      return {
        mainNav: [
          { href: '/researcher', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
<<<<<<< Updated upstream
          { href: '/researcher/studies', label: 'Clinical Studies', icon: <FlaskConical className="w-4 h-4" /> },
          { href: '/researcher/participants', label: 'Cohort Participants', icon: <Users className="w-4 h-4" /> },
          { href: '/researcher/surveys', label: 'Surveys & Instruments', icon: <ClipboardList className="w-4 h-4" /> },
          { href: '/researcher/analytics', label: 'Analytics & Insights', icon: <BarChart3 className="w-4 h-4" /> },
          { href: '/researcher/papers', label: 'Literature Library', icon: <Library className="w-4 h-4" /> },
        ],
        footerNav: [
          { href: '/patient/settings', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> },
          { href: '/patient', label: 'Switch to Patient View', icon: <User className="w-4 h-4" /> },
=======
          { href: '/researcher/projects', label: 'Projects & Studies', icon: <FlaskConical className="w-4 h-4" /> },
          { href: '/researcher/participants', label: 'Participants & Screening', icon: <Users className="w-4 h-4" /> },
          { href: '/researcher/surveys', label: 'Surveys & Instruments', icon: <ClipboardList className="w-4 h-4" /> },
          { href: '/researcher/data', label: 'Data Collection', icon: <Database className="w-4 h-4" /> },
          { href: '/researcher/analytics', label: 'Analytics & Insights', icon: <BarChart3 className="w-4 h-4" /> },
          { href: '/researcher/literature', label: 'Literature & Papers', icon: <BookOpen className="w-4 h-4" /> },
          { href: '/researcher/collaboration', label: 'Collaboration Network', icon: <Share2 className="w-4 h-4" /> },
          { href: '/researcher/reports', label: 'Reports & Compliance', icon: <FileText className="w-4 h-4" /> },
        ],
        footerNav: [
          { href: '/researcher/settings', label: 'Researcher Settings', icon: <Settings className="w-4 h-4" /> },
          { href: '/patient', label: 'Switch to Patient View', icon: <User className="w-4 h-4" /> },
          { href: '/doctor', label: 'Switch to Doctor View', icon: <Stethoscope className="w-4 h-4" /> },
>>>>>>> Stashed changes
        ],
      };
    case 'admin':
      return {
        mainNav: [
          { href: '/admin', label: 'Overview', icon: <ShieldCheck className="w-4 h-4" /> },
          { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        ],
        footerNav: [],
      };
    case 'super_admin':
      return {
        mainNav: [
          { href: '/super-admin', label: 'Overview', icon: <ShieldAlert className="w-4 h-4" /> },
          { href: '/super-admin/admins', label: 'Admins', icon: <ShieldCheck className="w-4 h-4" /> },
        ],
        footerNav: [],
      };
    default:
      return {
        mainNav: [
          { href: '/patient', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
          {
            label: 'Self Care',
            icon: <FolderHeart className="w-4 h-4" />,
            children: [
              { href: '/patient/counseling', label: 'AI Counseling', icon: <Bot className="w-4 h-4" /> },
              { href: '/patient/mood', label: 'Daily Mood Tracking', icon: <Smile className="w-4 h-4" /> },
              { href: '/patient/journal', label: 'Reflective Journal', icon: <BookMarked className="w-4 h-4" /> },
            ],
          },
          {
            label: 'Therapy & Assessments',
            icon: <ClipboardList className="w-4 h-4" />,
            children: [
              { href: '/patient/therapy', label: 'Therapy & Relaxation', icon: <Sparkles className="w-4 h-4" /> },
              { href: '/patient/assessments', label: 'Clinical Assessments', icon: <FileText className="w-4 h-4" /> },
            ],
          },
          { href: '/patient/appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
          { href: '/patient/community', label: 'Anonymous Community', icon: <Users className="w-4 h-4" /> },
        ],
        footerNav: [
          { href: '/patient/settings', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> },
        ],
      };
  }
};

export const getSidebarNav = (role?: SystemRole | string): NavItem[] => {
  const config = getSidebarConfig(role);
  const flatNav: NavItem[] = [];
  for (const item of config.mainNav) {
    if (item.children) {
      flatNav.push(...item.children);
    } else {
      flatNav.push(item);
    }
  }
  return [...flatNav, ...(config.sessionsNav || []), ...config.footerNav];
};

export function Sidebar({ role }: { role?: SystemRole | string }) {
  const { isOpen } = useSidebarStore();
  const pathname = usePathname();

  const getResolvedRole = (): SystemRole => {
    if (pathname.startsWith('/doctor')) return 'doctor';
    if (pathname.startsWith('/researcher')) return 'researcher';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/super-admin')) return 'super_admin';
    if (pathname.startsWith('/patient')) return 'patient';
    if (role === 'user' || !role) return 'patient';
    return (role as SystemRole) || 'patient';
  };

  const resolvedRole = getResolvedRole();
  const config = getSidebarConfig(resolvedRole);
  const isDoctor = resolvedRole === 'doctor' || pathname.startsWith('/doctor');
  const isResearcher = resolvedRole === 'researcher' || pathname.startsWith('/researcher');

  return (
    <aside className={cn(
      "flex flex-col transition-all duration-300 select-none",
      isDoctor 
        ? "bg-white text-slate-800 border-r border-slate-200/80 shadow-xs" 
        : isResearcher
<<<<<<< Updated upstream
          ? "bg-white text-zinc-900 border-r border-zinc-200/80 shadow-xs"
=======
          ? "bg-white text-[#4a044e] border-r border-fuchsia-100 shadow-xs"
>>>>>>> Stashed changes
          : "bg-card text-card-foreground border-r border-border",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Brand Header */}
      <div className={cn(
        "h-14 flex items-center px-4 shrink-0 justify-between border-b",
<<<<<<< Updated upstream
        isDoctor ? "border-slate-200/80" : isResearcher ? "border-zinc-200/80" : "border-border"
=======
        isDoctor ? "border-slate-200/80" : isResearcher ? "border-fuchsia-100" : "border-border"
>>>>>>> Stashed changes
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn(
            "p-1.5 rounded-xl shrink-0 border",
            isDoctor 
              ? "bg-teal-50 text-teal-600 border-teal-200/70 shadow-2xs" 
              : isResearcher
<<<<<<< Updated upstream
                ? "bg-indigo-50 text-indigo-600 border-indigo-200/70 shadow-2xs"
=======
                ? "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200/80 shadow-2xs"
>>>>>>> Stashed changes
                : "bg-primary/10 text-primary border-primary/20"
          )}>
            {isResearcher ? <FlaskConical className="w-5 h-5" /> : <HeartPulse className="w-5 h-5" />}
          </div>
          {isOpen && (
<<<<<<< Updated upstream
            <div className="flex flex-col min-w-0">
              <span className={cn(
                "font-bold text-lg tracking-tight truncate leading-tight",
                isDoctor ? "text-slate-900" : isResearcher ? "text-zinc-900" : "text-foreground"
=======
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={cn(
                "font-bold text-lg tracking-tight truncate",
                isDoctor ? "text-slate-900" : isResearcher ? "text-[#4a044e]" : "text-foreground"
>>>>>>> Stashed changes
              )}>
                Healer
              </span>
              {isResearcher && (
<<<<<<< Updated upstream
                <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase">
                  Research Lab
=======
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-700 tracking-wider uppercase border border-fuchsia-200/80">
                  Research
>>>>>>> Stashed changes
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Scroll Area */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Main Section */}
        <div className="space-y-1">
          {config.mainNav.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <SidebarNavFolder
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  children={item.children}
                  isCollapsed={!isOpen}
                />
              );
            }
            return (
              <SidebarNavLink 
                key={item.href!}
                href={item.href!}
                icon={item.icon}
                label={item.label}
                isCollapsed={!isOpen}
              />
            );
          })}
        </div>

        {/* Sessions Section (Grouped) */}
        {config.sessionsNav && config.sessionsNav.length > 0 && (
          <div className={cn(
            "pt-2 space-y-1 border-t",
            isDoctor ? "border-slate-200/60" : "border-border/40"
          )}>
            {isOpen ? (
              <span className={cn(
                "px-3 text-[11px] font-bold uppercase tracking-wider block mb-1",
                isDoctor ? "text-teal-700/90" : "text-muted-foreground/70"
              )}>
                Sessions
              </span>
            ) : (
              <div className={cn("my-2 border-t", isDoctor ? "border-slate-200/60" : "border-border/40")} />
            )}
            {config.sessionsNav.map((item) => (
              <SidebarNavLink 
                key={item.href!}
                href={item.href!}
                icon={item.icon}
                label={item.label}
                isCollapsed={!isOpen}
              />
            ))}
          </div>
        )}
      </nav>

      {/* Pinned Footer Section */}
      {config.footerNav && config.footerNav.length > 0 && (
        <div className={cn(
          "p-3 border-t shrink-0 space-y-1",
          isDoctor 
            ? "bg-slate-50/80 border-slate-200/80" 
            : isResearcher
              ? "bg-zinc-50/80 border-zinc-200/80"
              : "bg-muted/20 border-border"
        )}>
          {config.footerNav.map((item) => (
            <SidebarNavLink 
              key={item.href!}
              href={item.href!}
              icon={item.icon}
              label={item.label}
              isCollapsed={!isOpen}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
