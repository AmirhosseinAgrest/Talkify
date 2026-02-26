import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode");
    return (saved as ThemeMode) || "auto";
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme-mode", mode);

    const applyTheme = () => {
      if (mode === "auto") {
        const hour = new Date().getHours();
        const isNight = hour >= 18 || hour < 6;
        setIsDark(isNight);
        document.documentElement.classList.toggle("dark", isNight);
      } else {
        const dark = mode === "dark";
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
      }
    };

    applyTheme();

    if (mode === "auto") {
      const interval = setInterval(applyTheme, 60000); 
      return () => clearInterval(interval);
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};