"use client";

import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { cn } from "@/lib/utils";
import { 
  Users, Activity, Calendar, FileText, Settings, ShieldAlert, BookOpen, ShieldCheck, HeartPulse
} from "lucide-react";
import { SidebarNavLink } from "./sidebar-nav-link";

type SystemRole = 'patient' | 'doctor' | 'researcher' | 'admin' | 'super_admin';

const getSidebarNav = (role: SystemRole) => {
  switch (role) {
    case 'patient':
      return [
        { href: '/patient', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
        { href: '/patient/records', label: 'My Records', icon: <FileText className="w-4 h-4" /> },
        { href: '/patient/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      ];
    case 'doctor':
      return [
        { href: '/doctor', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
        { href: '/doctor/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
        { href: '/doctor/appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
      ];
    case 'researcher':
      return [
        { href: '/researcher', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
        { href: '/researcher/studies', label: 'Studies', icon: <BookOpen className="w-4 h-4" /> },
      ];
    case 'admin':
      return [
        { href: '/admin', label: 'Dashboard', icon: <ShieldCheck className="w-4 h-4" /> },
        { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
      ];
    case 'super_admin':
      return [
        { href: '/super-admin', label: 'Dashboard', icon: <ShieldAlert className="w-4 h-4" /> },
        { href: '/super-admin/admins', label: 'Admins', icon: <ShieldCheck className="w-4 h-4" /> },
      ];
    default:
      return [];
  }
};

export function Sidebar({ role }: { role: SystemRole }) {
  const { isOpen } = useSidebarStore();
  const navItems = getSidebarNav(role);

  return (
    <aside className={cn(
      "bg-card border-r flex flex-col transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="h-14 flex items-center border-b px-4 shrink-0">
        <HeartPulse className="w-6 h-6 text-primary shrink-0" />
        {isOpen && <span className="ml-3 font-semibold text-lg truncate">Healer</span>}
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <SidebarNavLink 
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isCollapsed={!isOpen}
          />
        ))}
      </nav>
    </aside>
  );
}
