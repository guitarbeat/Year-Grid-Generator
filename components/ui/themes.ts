import { AppColors } from "../../types";

export const THEMES: { name: string; colors: AppColors }[] = [
  {
    name: "Classic",
    colors: {
      bg: "#0a0a0a", text: "#525252", empty: "#1f1f1f", fill: "#3b82f6",
      pastDay: "#ffffff", futureDay: "#2c2c2e", today: "#ff3b30",
      significant: "#FFD60A", weekend: "#515155", stats: "#3b82f6",
    },
  },
  {
    name: "Ember",
    colors: {
      bg: "#0a0a0a", text: "#525252", empty: "#1f1f1f", fill: "#ea580c",
      pastDay: "#ffffff", futureDay: "#2c2c2e", today: "#ff3b30",
      significant: "#FFD60A", weekend: "#515155", stats: "#ff9f0a",
    },
  },
  {
    name: "GitHub",
    colors: {
      bg: "#0d1117", text: "#8b949e", empty: "#161b22", fill: "#39d353",
      pastDay: "#ffffff", futureDay: "#161b22", today: "#f85149",
      significant: "#d29922", weekend: "#30363d", stats: "#39d353",
    },
  },
  {
    name: "Ocean",
    colors: {
      bg: "#0f172a", text: "#94a3b8", empty: "#1e293b", fill: "#38bdf8",
      pastDay: "#ffffff", futureDay: "#1e293b", today: "#f43f5e",
      significant: "#fbbf24", weekend: "#334155", stats: "#38bdf8",
    },
  },
  {
    name: "Aurora (OKLCH)",
    colors: {
      bg: "#080c09", text: "#8da995", empty: "#121b14", fill: "#03c988",
      pastDay: "#eafef4", futureDay: "#17231a", today: "#f43f5e",
      significant: "#10b981", weekend: "#283b2d", stats: "#03c988",
    }
  },
  {
    name: "Aura Frost",
    colors: {
      bg: "#060b0e", text: "#8fa3b0", empty: "#10181e", fill: "#0ea5e9",
      pastDay: "#f0f9ff", futureDay: "#16222a", today: "#f43f5e",
      significant: "#ffbf00", weekend: "#2c3e4c", stats: "#0ea5e9",
    }
  },
  {
    name: "Cyber Lav",
    colors: {
      bg: "#0a080d", text: "#aea3bf", empty: "#17121f", fill: "#a855f7",
      pastDay: "#faf5ff", futureDay: "#211a2d", today: "#ff3366",
      significant: "#ffcc00", weekend: "#382c4c", stats: "#a855f7",
    }
  },
  {
    name: "Champagne",
    colors: {
      bg: "#0d0c0a", text: "#cca780", empty: "#1e1b15", fill: "#d4af37",
      pastDay: "#fffdf9", futureDay: "#2a251e", today: "#f53f3f",
      significant: "#ffdf00", weekend: "#4b4132", stats: "#d4af37",
    }
  },
];
