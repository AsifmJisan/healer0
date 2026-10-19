"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
  isSubItem?: boolean;
}

export function SidebarNavLink({ href, icon, label, isCollapsed, isSubItem }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isBaseDashboard = ['/patient', '/doctor', '/researcher', '/admin', '/super-admin'].includes(href);
  const isActive = isBaseDashboard ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const isDoctorRoute = pathname.startsWith('/doctor');
  const isResearcherRoute = pathname.startsWith('/researcher');

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl transition-all duration-200 group cursor-pointer",
        isSubItem ? "px-3 pl-8 py-2 text-[13px] font-medium" : "px-3 py-2.5 text-sm font-medium",
        isDoctorRoute
          ? isActive 
            ? "bg-teal-50/90 text-teal-800 font-semibold shadow-xs" 
            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
          : isResearcherRoute
            ? isActive
<<<<<<< Updated upstream
              ? "bg-indigo-50/90 text-indigo-900 font-semibold shadow-xs"
              : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
=======
              ? "bg-fuchsia-50 text-fuchsia-950 font-semibold shadow-xs border border-fuchsia-200/80"
              : "text-slate-600 hover:bg-fuchsia-50/70 hover:text-fuchsia-950"
>>>>>>> Stashed changes
            : isActive
              ? "bg-secondary text-secondary-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className={cn(
          "absolute left-0 top-2 bottom-2 w-1 rounded-r-full shadow-xs",
<<<<<<< Updated upstream
          isDoctorRoute ? "bg-teal-600" : isResearcherRoute ? "bg-indigo-600" : "bg-primary"
=======
          isDoctorRoute ? "bg-teal-600" : isResearcherRoute ? "bg-fuchsia-600" : "bg-primary"
>>>>>>> Stashed changes
        )} />
      )}
      <span className={cn(
        "transition-transform duration-200 group-hover:scale-110 shrink-0",
        isDoctorRoute
          ? isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-700"
          : isResearcherRoute
<<<<<<< Updated upstream
            ? isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-700"
=======
            ? isActive ? "text-fuchsia-600" : "text-slate-400 group-hover:text-fuchsia-600"
>>>>>>> Stashed changes
            : isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )}>
        {icon}
      </span>
      {!isCollapsed && <span className="truncate tracking-tight">{label}</span>}
    </Link>
  );
}
