"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, CalendarCheck, User, MessageSquare, Menu, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/custom/NotificationBell";
import { useAuth } from "@/components/providers/AuthProvider";

interface TenantLayoutProps {
  children: React.ReactNode;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();

  const NAV_ITEMS = [
    { name: "Dashboard", href: "/tenant/dashboard", icon: LayoutDashboard },
    { name: "My Bookings", href: "/tenant/bookings", icon: CalendarCheck },
    { name: "Messages", href: "/tenant/messages", icon: MessageSquare },
    { name: "Profile", href: "/tenant/profile", icon: User },
  ];

  const displayName = profile?.nama_lengkap || "Tenant";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-surface flex font-body text-on-surface" suppressHydrationWarning>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-outline/10 fixed left-0 top-0 z-40 p-4 space-y-2">
        <div className="mb-8 px-2 flex justify-between items-center mt-2">
          <div>
            <h1 className="text-xl font-bold font-headline text-primary">DeskWeave</h1>
            <p className="text-xs text-on-surface-variant font-medium font-headline">Tenant Portal</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-headline text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="pt-4 mt-4 border-t border-outline/10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate text-on-surface">{displayName}</span>
              <span className="text-[10px] text-on-surface-variant truncate">{profile?.email}</span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col pt-16 md:pt-0 w-full">
        {/* Mobile Top Header */}
        <div className="md:hidden fixed top-0 w-full z-30 bg-surface-container-lowest border-b border-outline/10 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger className="text-on-surface hover:text-primary transition-colors focus:outline-none flex items-center justify-center p-1 rounded-md hover:bg-surface-container">
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-surface-container-lowest p-0 flex flex-col">
                <SheetHeader className="p-4 text-left border-b border-outline/10 h-16 flex items-center justify-center">
                  <SheetTitle className="text-xl font-bold font-headline text-primary tracking-tighter w-full mt-0">DeskWeave</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 space-y-1 p-4 pb-0 overflow-y-auto">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        onClick={() => setMobileMenuOpen(false)}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-headline text-sm transition-all duration-300 ${
                          isActive
                            ? "bg-primary/10 text-primary font-bold shadow-sm"
                            : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-outline/10">
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold font-headline text-primary">DeskWeave</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell baseUrl="/tenant" />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 relative w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
