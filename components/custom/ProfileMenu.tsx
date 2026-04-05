"use client";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function ProfileMenu({ 
  role, 
  avatarUrl, 
  initials 
}: { 
  role: string;
  avatarUrl?: string;
  initials?: string;
}) {
  const { profile, signOut } = useAuth();

  const resolvedRole = role.toLowerCase();
  const resolvedAvatar = avatarUrl || profile?.avatar_url || undefined;
  const resolvedInitials = initials || profile?.nama_lengkap?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const profileHref = resolvedRole === "owner" ? "/owner/profile" : "/tenant/profile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none outline-none">
        {resolvedAvatar ? (
          <div suppressHydrationWarning className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/50 transition-all">
            <img 
              src={resolvedAvatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div suppressHydrationWarning className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0 cursor-pointer hover:bg-primary/90 transition-colors ring-2 ring-primary/20 hover:ring-primary/50">
            {resolvedInitials}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-surface-container-lowest border-outline/10 shadow-xl rounded-xl p-1 z-[110]">
        <DropdownMenuItem onClick={() => window.location.href = profileHref} className="cursor-pointer font-medium text-sm flex items-center gap-2 py-2.5 px-3 rounded-lg focus:bg-primary/10 focus:text-primary">
            <User className="w-4 h-4" /> Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-outline/10 my-1" />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer font-medium text-sm flex items-center gap-2 py-2.5 px-3 rounded-lg text-error focus:bg-error/10 focus:text-error">
          <LogOut className="w-4 h-4" /> Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
