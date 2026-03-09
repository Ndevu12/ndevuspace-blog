"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  mounted?: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by setting mounted state
  useEffect(() => {
    setMounted(true);

    // Initialize theme immediately on mount
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;

    if (savedTheme === "light") {
      setIsDarkTheme(false);
      html.classList.remove("dark");
    } else {
      setIsDarkTheme(true);
      html.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = isDarkTheme ? "light" : "dark";

    if (newTheme === "light") {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkTheme(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkTheme(true);
    }
  };

  // Always render children, but use a loading state for theme-dependent content
  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
