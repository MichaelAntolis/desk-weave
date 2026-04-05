"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-full border border-outline/20 flex items-center justify-center hover:bg-muted transition-colors relative"
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[140px] rounded-lg bg-surface-container-lowest/95 backdrop-blur-md shadow-lg ring-1 ring-outline/10 py-1 animate-in fade-in-0 zoom-in-95 duration-100">
          <button
            onClick={() => { setTheme("light"); setOpen(false); }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${theme === "light" ? "bg-primary/10 text-primary font-semibold" : "text-on-surface hover:bg-muted"}`}
          >
            <Sun className="w-4 h-4" />
            Light
          </button>
          <button
            onClick={() => { setTheme("dark"); setOpen(false); }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${theme === "dark" ? "bg-primary/10 text-primary font-semibold" : "text-on-surface hover:bg-muted"}`}
          >
            <Moon className="w-4 h-4" />
            Dark
          </button>
          <button
            onClick={() => { setTheme("system"); setOpen(false); }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${theme === "system" ? "bg-primary/10 text-primary font-semibold" : "text-on-surface hover:bg-muted"}`}
          >
            <Monitor className="w-4 h-4" />
            System
          </button>
        </div>
      )}
    </div>
  );
}
