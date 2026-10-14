"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  function syncPreference(event: StorageEvent) {
    if (event.key !== "primewave-theme") return;
    const dark = event.newValue === "dark" || (!event.newValue && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }
  window.addEventListener("storage", syncPreference);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", syncPreference);
  };
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try { localStorage.setItem("primewave-theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} title={`Switch to ${dark ? "light" : "dark"} mode`}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
