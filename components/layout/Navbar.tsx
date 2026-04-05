"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import { User, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();

  const dashboardLink = profile?.peran === "OWNER" ? "/owner/overview" : "/tenant/dashboard";
  const dashboardLabel = profile?.peran === "OWNER" ? "Owner Hub" : "Dashboard";

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-outline/10">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tighter text-primary font-headline">
          DeskWeave
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 font-headline"
            >
              Explore
            </Link>
            <span className="h-4 w-px bg-outline/20"></span>

            {loading ? (
              <div className="w-20 h-8 bg-surface-container-low rounded-lg animate-pulse" />
            ) : user && profile ? (
              <>
                <Link
                  href={dashboardLink}
                  className="flex items-center gap-2 text-primary font-headline tracking-tight font-bold transition-all hover:text-secondary active:opacity-80"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dashboardLabel}
                </Link>
                <div className="flex items-center gap-3 pl-2 border-l border-outline/20">
                  <div className="flex items-center gap-2">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.nama_lengkap}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {profile.nama_lengkap?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                    )}
                    <span className="text-sm font-bold text-on-surface max-w-[120px] truncate">
                      {profile.nama_lengkap || profile.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="text-primary font-headline tracking-tight font-bold transition-all hover:text-secondary active:opacity-80"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="text-primary font-headline tracking-tight font-bold transition-all hover:text-secondary active:opacity-80"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
          <ThemeToggle />
          {/* Mobile Menu Icon */}
          <button className="md:hidden text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-menu"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
