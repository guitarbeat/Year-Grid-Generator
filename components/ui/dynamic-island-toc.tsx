import React, { useState, useEffect, ReactNode, useMemo, useRef, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence, Transition } from "motion/react";
import { 
  X, 
  Search, 
  Settings2, 
  Palette, 
  Layers, 
  Compass, 
  Sparkles, 
  AlertCircle, 
  Download, 
  Check, 
  Sliders, 
  BarChart3, 
  Info, 
  Calendar, 
  RefreshCcw,
  MousePointerClick
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppConfig, AppColors } from "@/types";

// --- Types ---

type HeadingData = {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
};

type WorkspaceTab = "config" | "style" | "layout";
type HUDMode = "nav" | "adjust" | "metrics" | "inspector";

// --- Shared Animation Configs ---

const islandTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 26,
};

// --- Progress Circle Component ---

function CircleProgress({ percentage, color = "#ea580c" }: { percentage: number; color?: string }) {
  const size = 26;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0 select-none">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Custom Local Swatch Themes for rapid island tuning
const PRESET_LOCAL_THEMES = [
  {
    name: "Classic Emerald",
    colors: {
      bg: "#040804",
      text: "#a7f3d0",
      empty: "#06200c",
      fill: "#10b981",
      pastDay: "#142d1b",
      futureDay: "#06200c",
      today: "#22c55e",
      significant: "#34d399",
      weekend: "#111827",
      stats: "#047857"
    } as AppColors
  },
  {
    name: "Obsidian Ember",
    colors: {
      bg: "#090504",
      text: "#ffedd5",
      empty: "#1c1917",
      fill: "#ea580c",
      pastDay: "#2d1a12",
      futureDay: "#1c1917",
      today: "#f97316",
      significant: "#f97316",
      weekend: "#121214",
      stats: "#c2410c"
    } as AppColors
  },
  {
    name: "Ocean Wave",
    colors: {
      bg: "#020813",
      text: "#e0f2fe",
      empty: "#0f172a",
      fill: "#0ea5e9",
      pastDay: "#14223c",
      futureDay: "#0f172a",
      today: "#38bdf8",
      significant: "#0284c7",
      weekend: "#0a0a0c",
      stats: "#0369a1"
    } as AppColors
  },
  {
    name: "Cyber Sunset",
    colors: {
      bg: "#0c0a09",
      text: "#fef08a",
      empty: "#27272a",
      fill: "#ec4899",
      pastDay: "#381a28",
      futureDay: "#1e1b4b",
      today: "#e11d48",
      significant: "#f43f5e",
      weekend: "#18181b",
      stats: "#be185d"
    } as AppColors
  },
  {
    name: "Sleek Dark",
    colors: {
      bg: "#050505",
      text: "#ffffff",
      empty: "#1c1c1f",
      fill: "#ffffff",
      pastDay: "#27272a",
      futureDay: "#1c1c1f",
      today: "#ffffff",
      significant: "#ea580c",
      weekend: "#0e0e11",
      stats: "#52525b"
    } as AppColors
  }
];

// --- Main HUD Navigation Component ---

type DynamicIslandTOCProps = {
  children?: ReactNode;
  selector?: string;
  config?: AppConfig;
  setConfig?: React.Dispatch<React.SetStateAction<AppConfig>>;
  onDownload?: () => Promise<void>;
  isDownloading?: boolean;
  selectedCellId?: string | null;
  setSelectedCellId?: React.Dispatch<React.SetStateAction<string | null>>;
};

export function DynamicIslandTOC({
  children,
  selector = "[data-toc]",
  config,
  setConfig,
  onDownload,
  isDownloading = false,
  selectedCellId = null,
  setSelectedCellId,
}: DynamicIslandTOCProps) {
  const [headings, setHeadings] = useState<HeadingData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("config");
  const [hudMode, setHudMode] = useState<HUDMode>("nav");
  const searchInputRef = useRef<HTMLInputElement>(null);



  // Focus search input when expanded and on nav tab
  useEffect(() => {
    if (isExpanded && hudMode === "nav") {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    } else {
      setSearchQuery("");
    }
  }, [isExpanded, hudMode]);

  // Open Island to "inspector" mode immediately when a cell is clicked
  useEffect(() => {
    if (selectedCellId) {
      setIsExpanded(true);
      setHudMode("inspector");
    }
  }, [selectedCellId]);

  // A. Detect Workspace Tab selection reactively from Sidebar className styles
  useEffect(() => {
    const syncActiveTab = () => {
      const tabConfig = document.getElementById("tab-btn-config");
      const tabStyle = document.getElementById("tab-btn-style");
      const tabLayout = document.getElementById("tab-btn-layout");

      if (tabConfig && tabConfig.className.includes("text-accent")) {
        setActiveTab("config");
      } else if (tabStyle && tabStyle.className.includes("text-accent")) {
        setActiveTab("style");
      } else if (tabLayout && tabLayout.className.includes("text-accent")) {
        setActiveTab("layout");
      }
    };

    syncActiveTab();

    // Observe Sidebar DOM adjustments to stay synchronized 100% of the time
    const observer = new MutationObserver(() => {
      syncActiveTab();
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class", "id"],
    });

    return () => observer.disconnect();
  }, []);

  // B. Scanning Strategy for data-toc triggers
  useEffect(() => {
    const getHeadings = () => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      const validHeadings = elements
        .filter((el) => !el.hasAttribute("data-toc-ignore"))
        .map((el, index) => {
          if (!el.id) {
            const labelText = el.getAttribute("data-toc-title") || el.textContent || "";
            const generatedId =
              labelText
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "") || `toc-heading-${index}`;
            el.id = generatedId;
          }

          const depthAttr = el.getAttribute("data-toc-depth");
          let level = 3;

          if (depthAttr) {
            level = parseInt(depthAttr, 10);
          } else {
            const tagName = el.tagName.toUpperCase();
            if (tagName.startsWith("H") && tagName.length === 2) {
              level = parseInt(tagName[1], 10);
            }
          }

          const text = el.getAttribute("data-toc-title") || el.textContent || "Section";

          return { id: el.id, text, level, element: el };
        });

      // Sort by absolute document layout flow
      validHeadings.sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      );

      setHeadings(validHeadings);
    };

    getHeadings();

    const observer = new MutationObserver(() => {
      getHeadings();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-toc", "data-toc-title", "id"],
    });

    return () => observer.disconnect();
  }, [selector, activeTab]);

  // C. Capturing Scroll Spy over Sidebar
  useEffect(() => {
    const handleScroll = () => {
      if (headings.length === 0) return;

      let currentActiveId: string | null = null;
      for (const heading of headings) {
        const bounds = heading.element.getBoundingClientRect();
        if (bounds.top <= 280) {
          currentActiveId = heading.id;
        }
      }

      if (!currentActiveId && headings.length > 0) {
        currentActiveId = headings[0].id;
      }

      setActiveId(currentActiveId);

      // Track relative scroll content depth in Sidebar Scrollable View
      const scrollable = document.querySelector(".overflow-y-auto");
      if (scrollable) {
        const total = scrollable.scrollHeight - scrollable.clientHeight;
        setProgress(total > 0 ? Math.min(100, Math.max(0, (scrollable.scrollTop / total) * 100)) : 0);
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    handleScroll();

    const triggerInterval = setInterval(handleScroll, 800);

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      clearInterval(triggerInterval);
    };
  }, [headings]);

  const triggerTabSwitch = (tab: WorkspaceTab) => {
    const tabButton = document.getElementById(`tab-btn-${tab}`);
    if (tabButton) {
      tabButton.click();
    }
  };

  const jumpToSection = (h: HeadingData) => {
    h.element.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const highlightTarget = h.element.closest(".sidebar-section") || h.element;
    if (highlightTarget) {
      highlightTarget.classList.add("ring-2", "ring-accent", "ring-offset-2", "ring-offset-background", "duration-200");
      setTimeout(() => {
        highlightTarget.classList.remove("ring-2", "ring-accent", "ring-offset-2", "ring-offset-background");
      }, 1500);
    }
    
    setIsExpanded(false);
  };

  const activeHeading = headings.find((h) => h.id === activeId);

  // Dynamic status icon matching current active tab
  const TabIconComponent = useMemo(() => {
    switch (activeTab) {
      case "config":
        return <Settings2 className="h-3.5 w-3.5 text-accent animate-pulse" />;
      case "style":
        return <Palette className="h-3.5 w-3.5 text-accent" />;
      case "layout":
        return <Layers className="h-3.5 w-3.5 text-accent" />;
      default:
        return <Compass className="h-3.5 w-3.5 text-accent" />;
    }
  }, [activeTab]);

  // Handle live query text searching for Nav view
  const filteredHeadings = useMemo(() => {
    if (!searchQuery.trim()) return headings;
    return headings.filter((h) =>
      h.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [headings, searchQuery]);

  // Calculate Calendar analytics nicely for the metrics view
  const calendarMetrics = useMemo(() => {
    if (!config) return { totalDays: 0, year: 2026, remainingDays: 0 };
    const dateObj = new Date(config.date);
    const yr = isNaN(dateObj.getTime()) ? 2026 : dateObj.getFullYear();
    
    // Total monthsToShow
    const mos = config.monthsToShow || 12;
    const totalDays = mos * 30.4; // Average

    // Remaining days in the year from today or target
    const today = new Date();
    const endOfYear = new Date(yr, 11, 31);
    const diff = endOfYear.getTime() - today.getTime();
    const remain = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    return {
      totalDays: Math.round(totalDays),
      year: yr,
      remainingDays: remain
    };
  }, [config]);

  // Parse currently selected clicked cell for the inspector tab
  const parsedCell = useMemo(() => {
    if (!selectedCellId) return null;
    
    if (selectedCellId.startsWith("day-")) {
      const parts = selectedCellId.split("-"); // day-2026-4-15
      if (parts.length >= 4) {
        const yr = parseInt(parts[1], 10);
        const mon = parseInt(parts[2], 10);
        const dy = parseInt(parts[3], 10);
        
        const dateObj = new Date(yr, mon, dy);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const isHighlighted = config?.overrides?.[selectedCellId] !== undefined;
        const currentLabel = config?.overrides?.[selectedCellId] || "";

        return {
          type: "day",
          id: selectedCellId,
          formattedDate,
          isHighlighted,
          currentLabel,
          yr,
          mon,
          dy
        };
      }
    } else if (selectedCellId.startsWith("week-")) {
      const parts = selectedCellId.split("-"); // week-2026-22
      if (parts.length >= 3) {
        const yr = parseInt(parts[1], 10);
        const wk = parseInt(parts[2], 10);
        const isHighlighted = config?.overrides?.[selectedCellId] !== undefined;
        const currentLabel = config?.overrides?.[selectedCellId] || "";

        return {
          type: "week",
          id: selectedCellId,
          formattedDate: `ISO Week #${wk}, ${yr}`,
          isHighlighted,
          currentLabel,
          yr,
          mon: 0,
          dy: wk
        };
      }
    }
    return null;
  }, [selectedCellId, config?.overrides]);

  // Apply a local preview palette selection
  const handleApplyColors = (colors: AppColors) => {
    if (setConfig) {
      setConfig((prev) => ({ ...prev, colors }));
    }
  };

  // Toggle override directly from Island
  const handleToggleOverride = (cellId: string) => {
    if (!setConfig) return;
    setConfig((prev) => {
      const overrides = { ...(prev.overrides || {}) };
      if (overrides[cellId]) {
        delete overrides[cellId];
      } else {
        overrides[cellId] = "significant";
      }
      return { ...prev, overrides };
    });
  };

  // Set specific string override label from Island input
  const handleSetOverrideLabel = (cellId: string, text: string) => {
    if (!setConfig) return;
    setConfig((prev) => {
      const overrides = { ...(prev.overrides || {}) };
      if (!text.trim()) {
        delete overrides[cellId];
      } else {
        overrides[cellId] = text;
      }
      return { ...prev, overrides };
    });
  };

  // Quick setup slider values
  const handleSliderChange = <K extends keyof AppConfig>(key: K, val: any) => {
    if (setConfig) {
      setConfig((prev) => ({ ...prev, [key]: val }));
    }
  };

  return (
    <>
      {children}

      {/* Backdrop Blur Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={islandTransition}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[4px] cursor-pointer"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Island Wrapper */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center"
      >
        <motion.div
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
          initial={false}
          animate={{
            width: isExpanded ? 410 : 264,
            height: isExpanded ? 460 : 44,
            borderRadius: isExpanded ? 24 : 22,
          }}
          transition={islandTransition}
          style={{ cursor: isExpanded ? "default" : "pointer" }}
          className="relative overflow-hidden border border-white/10 bg-[#0c0c0e]/95 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          {/* CLOSED PILL CONTENT */}
          <motion.div
            initial={false}
            animate={{
              opacity: isExpanded ? 0 : 1,
              scale: isExpanded ? 0.95 : 1,
              filter: isExpanded ? "blur(5px)" : "blur(0px)",
            }}
            transition={{ ...islandTransition, delay: isExpanded ? 0 : 0.1 }}
            className={cn("absolute inset-0 flex items-center gap-3 px-4", isExpanded && "pointer-events-none")}
          >
            {/* Swatch or Icon matching sidebar styles */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 shadow-md">
              {TabIconComponent}
            </div>

            <div className="relative flex h-full flex-1 items-center overflow-hidden text-left">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={activeId || "empty"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.15, ease: "easeIn" } }}
                  className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-mono font-semibold tracking-wider text-gray-300 uppercase"
                >
                  {selectedCellId 
                    ? `INSPECT: ${selectedCellId.substring(0, 16)}`
                    : (activeHeading?.text || `WORKSPACE: ${activeTab.toUpperCase()}`)}
                </motion.span>
              </AnimatePresence>
            </div>

            <CircleProgress percentage={progress} />
          </motion.div>

          {/* EXPANDED DECK CONTENT */}
          <motion.div
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              scale: isExpanded ? 1 : 1.05,
            }}
            transition={{ ...islandTransition, delay: isExpanded ? 0.08 : 0 }}
            className={cn("absolute inset-0 flex flex-col h-full", !isExpanded && "pointer-events-none")}
          >
            {/* Header section with Dynamic HUD naming block */}
            <div className="flex shrink-0 items-center justify-between px-5 pb-2.5 pt-4 border-b border-white/5 bg-black/40">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                <span className="text-[9px] font-mono font-extrabold tracking-[0.18em] text-gray-400 uppercase">
                  CALENDAR HUD STATION
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="text-gray-400 hover:text-white transition-all p-1 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Premium HUD Functional Mode Switchers */}
            <div className="grid grid-cols-4 gap-1 p-2 bg-[#050505] border-b border-white/5">
              {[
                { label: "Nav Map", mode: "nav", icon: Compass },
                { label: "Lab Center", mode: "adjust", icon: Sliders },
                { label: "Metrics", mode: "metrics", icon: BarChart3 },
                { label: "Inspector", mode: "inspector", icon: MousePointerClick }
              ].map((panel) => {
                const isSelected = hudMode === panel.mode;
                const Icon = panel.icon;

                return (
                  <button
                    key={panel.mode}
                    onClick={() => setHudMode(panel.mode as HUDMode)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-1.5 rounded text-[8px] font-mono tracking-wider uppercase transition-all border cursor-pointer",
                      isSelected 
                        ? "bg-[#ea580c]/10 border-[#ea580c]/30 text-[#ea580c] font-bold shadow-[0_2px_10px_-4px_rgba(234,88,12,0.15)]" 
                        : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{panel.label}</span>
                  </button>
                );
              })}
            </div>

            {/* MAIN INNER CHANNELS */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#08080a]">
              
              {/* PANEL 1: NAV TABLE OF CONTENTS */}
              {hudMode === "nav" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Quick Unified Tab Selection Shortcuts (Tied directly to Sidebar tabs) */}
                  <div className="grid grid-cols-3 gap-0.5 p-1.5 bg-black/40 border-b border-white/5">
                    {(["config", "style", "layout"] as const).map((tab) => {
                      const label = tab === "config" ? "Setup Section" : tab === "style" ? "Style Section" : "Overlays Section";
                      const isCurrent = activeTab === tab;
                      const Icon = tab === "config" ? Settings2 : tab === "style" ? Palette : Layers;

                      return (
                        <button
                          key={tab}
                          onClick={() => triggerTabSwitch(tab)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1 text-[8px] font-mono tracking-widest uppercase transition-all rounded cursor-pointer border border-transparent",
                            isCurrent 
                              ? "bg-accent/15 text-accent border-accent/20 font-bold" 
                              : "text-gray-500 hover:text-gray-300"
                          )}
                        >
                          <Icon className="h-2.5 w-2.5" />
                          <span>{tab === "config" ? "Setup" : tab === "style" ? "Styling" : "Overlays"}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Filter Option search box */}
                  <div className="px-3 pt-2 pb-1.5 bg-black/20">
                    <div className="relative flex items-center border border-white/5 bg-black/30 rounded-lg px-2.5 focus-within:border-accent/40 transition-all">
                      <Search className="h-3 w-3 text-gray-500 shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="FILTER OPTIONS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 text-[9px] font-mono uppercase tracking-wider text-white placeholder-gray-600 outline-none"
                      />
                      {searchQuery !== "" && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Layout heads list */}
                  <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-1 custom-scrollbar">
                    {filteredHeadings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                        <AlertCircle className="h-5 w-5 text-gray-600" />
                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-normal">
                          No active option matches "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {filteredHeadings.map((h) => {
                          const isActive = activeId === h.id;
                          const isHovered = hoveredId === h.id;

                          return (
                            <button
                              key={h.id}
                              onMouseEnter={() => setHoveredId(h.id)}
                              onMouseLeave={() => setHoveredId(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                jumpToSection(h);
                              }}
                              className={cn(
                                "group flex w-full shrink-0 cursor-pointer items-center justify-between rounded px-3 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider transition-all duration-200",
                                isActive && "bg-[#ea580c]/10 border border-[#ea580c]/20 font-bold text-[#ea580c] shadow-[0_2px_10px_-4px_rgba(234,88,12,0.1)]",
                                !isActive && isHovered && "bg-white/5 text-gray-100",
                                !isActive && !isHovered && "bg-transparent text-gray-400 border border-transparent",
                              )}
                            >
                              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap transition-transform duration-200 group-hover:translate-x-1">
                                {h.text}
                              </span>

                              <div className={cn("ml-2 h-1 w-1 shrink-0 rounded-full", isActive ? "bg-[#ea580c]" : "bg-transparent")} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PANEL 2: LAB MICRO ADJUSTMENTS & PRESET SYSTEM */}
              {hudMode === "adjust" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {/* Title */}
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Sliders className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Lab Controls</span>
                  </div>

                  {config ? (
                    <div className="space-y-4 text-[10px]">
                      
                      {/* Presets Grid Switcher */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Aesthetic Presets Swatches</label>
                        <div className="grid grid-cols-5 gap-2">
                          {PRESET_LOCAL_THEMES.map((theme) => {
                            const isCurrent = config.colors && JSON.stringify(config.colors) === JSON.stringify(theme.colors);
                            return (
                              <button
                                key={theme.name}
                                onClick={() => handleApplyColors(theme.colors)}
                                className={cn(
                                  "relative aspect-square rounded-full border-2 flex items-center justify-center transition-all select-none active:scale-95 cursor-pointer shadow-md",
                                  isCurrent ? "border-[#ea580c] shadow-[#ea580c]/30" : "border-transparent"
                                )}
                                title={theme.name}
                              >
                                <div 
                                  className="w-full h-full rounded-full" 
                                  style={{ backgroundColor: theme.colors.fill }} 
                                />
                                {isCurrent && (
                                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                    <Check className="h-3.5 w-3.5 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dot size Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-gray-400">
                          <span>Dot Size (Spacing)</span>
                          <span className="text-[#ea580c] font-bold">{config.dotSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="50"
                          step="1"
                          value={config.dotSize}
                          onChange={(e) => handleSliderChange("dotSize", parseInt(e.target.value, 10))}
                          className="w-full accent-[#ea580c] bg-white/5 rounded-lg h-1.5 outline-none cursor-pointer"
                        />
                      </div>

                      {/* Corner Radius Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-gray-400">
                          <span>Corner Radius</span>
                          <span className="text-[#ea580c] font-bold">{config.radius}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="32"
                          step="1"
                          value={config.radius}
                          onChange={(e) => handleSliderChange("radius", parseInt(e.target.value, 10))}
                          className="w-full accent-[#ea580c] bg-white/5 rounded-lg h-1.5 outline-none cursor-pointer"
                        />
                      </div>

                      {/* Gap between elements */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-gray-400">
                          <span>Grid Spacing Gap</span>
                          <span className="text-[#ea580c] font-bold">{config.gap}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="1"
                          value={config.gap}
                          onChange={(e) => handleSliderChange("gap", parseInt(e.target.value, 10))}
                          className="w-full accent-[#ea580c] bg-white/5 rounded-lg h-1.5 outline-none cursor-pointer"
                        />
                      </div>

                      {/* High-res Download CTA Button */}
                      {onDownload && (
                        <button
                          onClick={onDownload}
                          disabled={isDownloading}
                          className="w-full mt-4 flex items-center justify-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white py-2.5 rounded-lg font-mono tracking-widest uppercase text-[10px] font-extrabold transition-all shadow-[0_4px_20px_rgba(234,88,12,0.25)] select-none cursor-pointer active:scale-[0.98] disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{isDownloading ? "CAPTURING GRID..." : "DOWNLOAD POSTER"}</span>
                        </button>
                      )}

                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-500 font-mono">No active configuration context found.</p>
                  )}
                </div>
              )}

              {/* PANEL 3: PERFORMANCE GRAPH & METRICS HUD */}
              {hudMode === "metrics" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {/* Title */}
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <BarChart3 className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Render & Palette Stats</span>
                  </div>

                  {config ? (
                    <div className="space-y-5 text-[9px] font-mono uppercase">
                      
                      {/* Grid Properties table */}
                      <div className="grid grid-cols-2 gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5">
                        <div className="space-y-0.5">
                          <span className="text-gray-500 uppercase tracking-tight block">Anchor Year</span>
                          <span className="text-white text-[10px] font-bold">{calendarMetrics.year}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-500 uppercase tracking-tight block">Layout Mode</span>
                          <span className="text-white text-[10px] font-bold">{config.mode || "Classic GRID"}</span>
                        </div>
                        <div className="space-y-0.5 mt-2">
                          <span className="text-gray-500 uppercase tracking-tight block">Scope Tracker</span>
                          <span className="text-white text-[10px] font-bold">{calendarMetrics.totalDays} Days Active</span>
                        </div>
                        <div className="space-y-0.5 mt-2">
                          <span className="text-gray-500 uppercase tracking-tight block font-bold">Days to NYE</span>
                          <span className="text-[#ea580c] text-[10px] font-bold">{calendarMetrics.remainingDays} Days</span>
                        </div>
                      </div>

                      {/* Active Palette breakdown codes */}
                      <div className="space-y-2">
                        <span className="text-[8px] text-gray-500 tracking-widest block font-bold">Active Palette Colors Hex-Map</span>
                        <div className="space-y-1.5">
                          {[
                            { label: "Empty Cell color", key: "empty" },
                            { label: "Fill Highlight", key: "fill" },
                            { label: "Primary Font Text", key: "text" },
                            { label: "Background canvas", key: "bg" }
                          ].map((clrKey) => {
                            const hexVal = (config.colors as any)?.[clrKey.key];
                            return (
                              <div key={clrKey.key} className="flex items-center justify-between bg-black/20 p-1.5 rounded border border-white/5">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: hexVal || "#111" }} />
                                  <span className="text-gray-400 text-[10px]">{clrKey.label}</span>
                                </div>
                                <span className="text-white font-bold tracking-normal">{hexVal || "Transparent"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Overrides indicator counts */}
                      <div className="flex items-center justify-between bg-accent/5 border border-accent/15 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Info className="h-3.5 w-3.5 text-accent animate-bounce" />
                          <span className="text-[10px] font-semibold text-gray-300">Highlighted Days Highlight Entries</span>
                        </div>
                        <div className="bg-[#ea580c] text-white text-[10px] px-2 py-0.5 rounded font-bold">
                          {Object.keys(config.overrides || {}).length} Days
                        </div>
                      </div>



                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-500 font-mono">No stats available.</p>
                  )}
                </div>
              )}

              {/* PANEL 4: CELL & METRIC HIGHLIGHT ANNOTATOR INSPECTOR */}
              {hudMode === "inspector" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {/* Title */}
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Calendar className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Grid Cell Inspector</span>
                  </div>

                  {parsedCell ? (
                    <div className="space-y-4 text-[10px] font-mono">
                      
                      {/* Active Inspection box info */}
                      <div className="bg-black/40 border border-[#ea580c]/20 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-gray-500 font-mono tracking-widest uppercase block">Selected Date Node</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                            parsedCell.isHighlighted ? "bg-[#ea580c]/20 text-[#ea580c] border border-[#ea580c]/30" : "bg-white/5 text-gray-400"
                          )}>
                            {parsedCell.isHighlighted ? "HIGHLIGHTED" : "STANDARD"}
                          </span>
                        </div>
                        <h4 className="text-white text-[11px] font-bold uppercase tracking-tight">{parsedCell.formattedDate}</h4>
                        <span className="text-[8px] text-gray-600 block leading-tight">{parsedCell.id}</span>
                      </div>

                      {/* Toggle Override Action button */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-gray-500 tracking-widest block uppercase">Style Quick Annotation Toggle</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleToggleOverride(parsedCell.id)}
                            className={cn(
                              "py-2 rounded-lg text-center cursor-pointer border font-bold text-[9px] transition-all",
                              parsedCell.isHighlighted 
                                ? "bg-accent text-white border-accent shadow-md shadow-accent/10" 
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                            )}
                          >
                            Highlight Day
                          </button>
                          <button
                            onClick={() => handleSetOverrideLabel(parsedCell.id, "")}
                            disabled={!parsedCell.isHighlighted}
                            className="py-2 rounded-lg text-center cursor-pointer bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-[9px] transition-all disabled:opacity-40"
                          >
                            Clear Accent
                          </button>
                        </div>
                      </div>

                      {/* Custom Label Customizer */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-500 tracking-widest block uppercase">Cell Custom Highlight Value Label</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. VACATION / ANNIVERSARY"
                            value={parsedCell.currentLabel}
                            onChange={(e) => handleSetOverrideLabel(parsedCell.id, e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2.5 py-2 text-[10px] text-white uppercase tracking-wider outline-none focus:border-[#ea580c]/50"
                          />
                        </div>
                        <p className="text-[8px] text-gray-500 leading-tight">By default, custom tags/text overlay beautifully on cells (depending on active view modes).</p>
                      </div>

                      {/* Deselect inspector trigger */}
                      {setSelectedCellId && (
                        <button
                          onClick={() => setSelectedCellId(null)}
                          className="w-full flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors py-2 rounded-lg border border-white/10"
                        >
                          <RefreshCcw className="h-3 w-3" />
                          <span>Inspect Another Day</span>
                        </button>
                      )}

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4 gap-3 bg-black/10 rounded-lg border border-white/5">
                      <MousePointerClick className="h-8 w-8 text-gray-500 animate-pulse" />
                      <div className="space-y-1.5">
                        <h4 className="text-white text-[10px] font-bold uppercase tracking-wider">No cell selected</h4>
                        <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest leading-relaxed">
                          Click any grid square inside the calendar area to instantly inspect, label, or toggle aesthetic highlights here!
                        </p>
                      </div>

                      {/* List of currently custom annotated days, if existing */}
                      {config && Object.keys(config.overrides || {}).length > 0 && (
                        <div className="w-full text-left space-y-1 mt-2 pt-2 border-t border-white/5">
                          <span className="text-[8px] text-gray-500 block uppercase">Custom Highlights ({Object.keys(config.overrides).length})</span>
                          <div className="max-h-16 overflow-y-auto custom-scrollbar flex flex-wrap gap-1">
                            {Object.entries(config.overrides).map(([oid, oval]) => (
                              <button
                                key={oid}
                                onClick={() => setSelectedCellId(oid)}
                                className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded px-1.5 py-0.5 text-[8px] text-[#ea580c] font-bold cursor-pointer"
                              >
                                {oid.replace("day-", "")} ({oval})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
