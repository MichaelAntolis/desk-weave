"use client";

import { NotificationBell } from "@/components/custom/NotificationBell";
import { ProfileMenu } from "@/components/custom/ProfileMenu";
import { useAuth } from "@/components/providers/AuthProvider";

interface DashboardHeaderProps {
  title: string;
  role: "OWNER" | "TENANT";
  subtitle: string;
  rightActions?: React.ReactNode;
}

export function DashboardHeader({ title, role, subtitle, rightActions }: DashboardHeaderProps) {
  const { profile } = useAuth();
  
  const displayName = profile?.nama_lengkap || (role === "OWNER" ? "Owner" : "Tenant");
  const displayRoleText = role === "OWNER" ? "Owner" : "Tenant";
  
  return (
    <>
      <header className="hidden md:flex flex-row bg-surface/80 backdrop-blur-xl fixed top-0 right-0 left-0 md:left-64 z-[40] px-4 md:px-8 py-3 md:py-5 justify-between items-center border-b border-outline/5 shadow-sm transition-all duration-300">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-primary tracking-tighter font-headline leading-none">
            {title}
          </h2>
          <div className="hidden md:flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
              {role}
            </span>
            <span className="text-[8px] text-on-surface-variant/40">&bull;</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              {subtitle}
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {rightActions}
          <div className="flex items-center gap-2">
             <NotificationBell baseUrl={role === "OWNER" ? "/owner" : "/tenant"} />
             <div className="ml-4 pl-4 border-l border-outline/10 flex flex-row items-center gap-4">
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-black text-primary leading-none mb-0.5">{displayName}</p>
                 <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-wider opacity-40">{displayRoleText}</p>
               </div>
               <ProfileMenu role={role.toLowerCase()} />
             </div>
          </div>
        </div>
      </header>
      {/* Structural Offset for Fixed Header */}
      <div className="hidden md:block h-28" />
    </>
  );
}
