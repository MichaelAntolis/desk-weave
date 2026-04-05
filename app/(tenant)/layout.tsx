"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, User, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface TenantLayoutProps {
  children: React.ReactNode;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: "Dashboard", href: "/tenant/dashboard", icon: LayoutDashboard },
    { name: "My Bookings", href: "/tenant/bookings", icon: CalendarCheck },
    { name: "Profile", href: "/tenant/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface flex font-body text-on-surface">
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
              JD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate text-on-surface">John Doe</span>
              <span className="text-[10px] text-on-surface-variant truncate">john@deskweave.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col pt-16 md:pt-0 w-full">
        {/* Mobile Top Header */}
        <div className="md:hidden fixed top-0 w-full z-30 bg-surface-container-lowest border-b border-outline/10 px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold font-headline text-primary">DeskWeave</h1>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline/10 z-50 flex justify-around items-center py-3 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 w-16 ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
