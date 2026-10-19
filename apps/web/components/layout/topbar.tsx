"use client";

import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { Menu, Bell } from "lucide-react";
import { AvatarDropdown, AvatarUser } from "./avatar-dropdown";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TopbarProps {
  user?: AvatarUser | null;
}

export function Topbar({ user }: TopbarProps) {
  const { toggle } = useSidebarStore();
  const pathname = usePathname();
  const isDoctor = pathname.startsWith('/doctor');
  const isResearcher = pathname.startsWith('/researcher');

  return (
    <header className={cn(
      "h-14 border-b bg-card text-card-foreground flex items-center justify-between px-4 shrink-0 transition-colors",
      isDoctor && "bg-white text-slate-800 border-slate-200/80",
<<<<<<< Updated upstream
      isResearcher && "bg-white text-zinc-900 border-zinc-200/80 shadow-2xs"
=======
      isResearcher && "bg-white text-[#4a044e] border-fuchsia-100/80 shadow-2xs"
>>>>>>> Stashed changes
    )}>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className={cn(
            "p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
            isDoctor && "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
<<<<<<< Updated upstream
            isResearcher && "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
=======
            isResearcher && "hover:bg-fuchsia-50 text-slate-600 hover:text-[#4a044e]"
>>>>>>> Stashed changes
          )}
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className={cn(
          "font-medium text-foreground",
          isDoctor && "text-slate-900",
<<<<<<< Updated upstream
          isResearcher && "text-zinc-900 font-semibold"
=======
          isResearcher && "text-[#4a044e]"
>>>>>>> Stashed changes
        )}>
          Welcome back, {user?.name}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className={cn(
          "p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          isDoctor && "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
          isResearcher && "hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600"
        )}>
          <Bell className="w-5 h-5" />
        </button>
        <AvatarDropdown user={user} />
      </div>
    </header>
  );
}
