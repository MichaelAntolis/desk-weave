"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  setTheme: () => null,
});

export const useTheme = () => React.useContext(ThemeContext);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);

  // Pada inisialisasi awal, jangan lakukan apapun agar konsisten dengan SSR
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = window.localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let finalTheme = theme;
    if (theme === "system") {
      finalTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    if (finalTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }

    window.localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

