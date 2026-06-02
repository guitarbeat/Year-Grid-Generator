import React, { useState } from "react";
import { AppConfig, AppColors } from "../types";
import { SidebarSection, Button, ControlGroup, Input, SegmentedControl, Select, Toggle } from "./ui/Controls";
import { motion } from "motion/react";

// --- Custom Theme Presets ---
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

// --- Interface & Component Definition ---

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onDownload: () => void;
  onDownloadSvg: () => void;
  isDownloading: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  resetConfig: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  config,
  setConfig,
  onDownload,
  onDownloadSvg,
  isDownloading,
  isOpen,
  onToggle,
  resetConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"config" | "style" | "layout">("config");
  const [shareText, setShareText] = useState("SHARE LINK");
  const [downloadLinkText, setDownloadLinkText] = useState("COPY DL LINK");

  const updateConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleColorChange = (key: keyof AppColors, value: string) => {
    setConfig((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
        ...(key === 'fill' ? { stats: value } : {})
      }
    }));
  };

  const setDateToToday = () => {
    updateConfig("date", new Date().toLocaleDateString("en-CA"));
  };

  const matches = (label: string, keywords: string[] = []) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      label.toLowerCase().includes(q) ||
      keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy failed', err);
      return false;
    }
  };

  const handleShare = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("date", "today");
      const finalUrl = url.toString();
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(finalUrl)
          .then(() => {
            setShareText("COPIED!");
            setTimeout(() => setShareText("SHARE LINK"), 1500);
          })
          .catch((err) => {
            console.error("Clipboard API failed: ", err);
            if (fallbackCopy(finalUrl)) {
              setShareText("COPIED!");
              setTimeout(() => setShareText("SHARE LINK"), 1500);
            } else {
              setShareText("TRY MANUAL COPY");
              setTimeout(() => setShareText("SHARE LINK"), 1800);
            }
          });
      } else {
        if (fallbackCopy(finalUrl)) {
          setShareText("COPIED!");
        } else {
          setShareText("TRY MANUAL COPY");
        }
        setTimeout(() => setShareText("SHARE LINK"), 1800);
      }
    } catch {
      setShareText("ERROR");
      setTimeout(() => setShareText("SHARE LINK"), 1500);
    }
  };

  const handleCopyDownloadLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("date", "today");
      url.searchParams.set("triggerDownload", "true");
      const finalUrl = url.toString();
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(finalUrl)
          .then(() => {
            setDownloadLinkText("COPIED!");
            setTimeout(() => setDownloadLinkText("COPY DL LINK"), 1500);
          })
          .catch((err) => {
            console.error("Clipboard API failed: ", err);
            if (fallbackCopy(finalUrl)) {
              setDownloadLinkText("COPIED!");
              setTimeout(() => setDownloadLinkText("COPY DL LINK"), 1500);
            } else {
              setDownloadLinkText("TRY MANUAL COPY");
              setTimeout(() => setDownloadLinkText("COPY DL LINK"), 1800);
            }
          });
      } else {
        if (fallbackCopy(finalUrl)) {
          setDownloadLinkText("COPIED!");
        } else {
          setDownloadLinkText("TRY MANUAL COPY");
        }
        setTimeout(() => setDownloadLinkText("COPY DL LINK"), 1800);
      }
    } catch {
      setDownloadLinkText("ERROR");
      setTimeout(() => setDownloadLinkText("COPY DL LINK"), 1500);
    }
  };

  // --- Inline Tab Renderers ---

  const renderArchitectureTab = () => {
    const hasPresetsMatch = matches("Quick Presets", ["presets", "full year", "this month", "12-week", "timeline", "shortcut", "quick"]);
    const hasRangeMatch = matches("Time Range", ["range", "start date", "timeline length", "months", "year", "today"]);
    const hasStructureMatch = matches("Structure & Detail", ["structure", "detail", "cell", "represent", "granularity", "day", "week", "month", "visual style", "layout", "wrapping", "limits", "columns", "organize", "grouping", "rules", "monday"]);

    return (
      <div className="space-y-2">
        {hasPresetsMatch && (
          <SidebarSection label="Quick Presets" defaultOpen={true} className="pt-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                label="Full Year"
                icon="calendar_month"
                onClick={() => {
                  const y = new Date().getFullYear();
                  updateConfig("date", `${y}-01-01`);
                  setConfig((prev) => ({ ...prev, monthsToShow: 12, startFromJan: true, itemsPerRow: 13, granularity: "day", mode: "grid", monthOffset: 0 }));
                }}
                className="justify-start !py-2 text-[10px]"
              />
              <Button
                variant="secondary"
                label="This Month"
                icon="today"
                onClick={() => {
                  const today = new Date();
                  updateConfig("date", today.toISOString().split("T")[0]);
                  setConfig((prev) => ({ ...prev, monthsToShow: 1, startFromJan: false, monthsPerRow: 1, granularity: "day", mode: "grid", monthOffset: 0 }));
                }}
                className="justify-start !py-2 text-[10px]"
              />
              <Button
                variant="secondary"
                label="12-Week"
                icon="view_week"
                onClick={() => {
                  const today = new Date();
                  updateConfig("date", today.toISOString().split("T")[0]);
                  setConfig((prev) => ({ ...prev, monthsToShow: 3, startFromJan: false, itemsPerRow: 13, granularity: "week", mode: "grid", showWeekNumbers: true, monthOffset: 0 }));
                }}
                className="justify-start !py-2 text-[10px]"
              />
              <Button
                variant="secondary"
                label="Timeline"
                icon="linear_scale"
                onClick={() => {
                  const y = new Date().getFullYear();
                  updateConfig("date", `${y}-01-01`);
                  setConfig((prev) => ({ ...prev, monthsToShow: 6, startFromJan: false, granularity: "day", mode: "timeline", showDayNumbers: false, monthOffset: 0 }));
                }}
                className="justify-start !py-2 text-[10px]"
              />
            </div>
          </SidebarSection>
        )}

        {hasRangeMatch && (
          <SidebarSection label="Time Range" defaultOpen={true}>
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <ControlGroup label="Start Date">
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <Button
                        variant="secondary"
                        label="Start of Year"
                        onClick={() => {
                          const y = new Date(config.date).getFullYear();
                          updateConfig("date", `${y}-01-01`);
                          setConfig(prev => ({...prev, startFromJan: true}))
                        }}
                        className="!text-[10px] !py-1"
                      />
                      <Button
                        variant="secondary"
                        label="Start Today"
                        onClick={() => {
                          setDateToToday();
                          setConfig(prev => ({...prev, startFromJan: false}))
                        }}
                        className="!text-[10px] !py-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={config.date}
                        onChange={(e) => updateConfig("date", e.target.value)}
                        className="font-mono text-[11px] h-9 flex-1"
                      />
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <Toggle
                        id="chk-anchor-today"
                        label="Anchor to real-world Today"
                        checked={config.anchorTodayToRealTime}
                        onChange={(val) => updateConfig("anchorTodayToRealTime", val)}
                      />
                    </div>
                  </div>
                </ControlGroup>

                <ControlGroup label="Timeline Length" value={`${config.monthsToShow} mo`}>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-5 gap-1">
                      <Button variant="secondary" label="1 Mo" onClick={() => updateConfig("monthsToShow", 1)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="1 Qtr" onClick={() => updateConfig("monthsToShow", 3)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="6 Mo" onClick={() => updateConfig("monthsToShow", 6)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="1 Yr" onClick={() => updateConfig("monthsToShow", 12)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="2 Yr" onClick={() => updateConfig("monthsToShow", 24)} className="!text-[10px] !px-1" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range" min="1" max="60"
                        value={config.monthsToShow}
                        onChange={(e) => updateConfig("monthsToShow", parseInt(e.target.value) || 1)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </ControlGroup>
              </div>
            </div>
          </SidebarSection>
        )}

        {hasStructureMatch && (
          <SidebarSection label="Structure & Detail" defaultOpen={true}>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-2 block">
                  Each Cell Represents A...
                </label>
                <SegmentedControl
                  options={[
                    { id: "day", label: "Day", icon: "view_agenda" },
                    { id: "week", label: "Week", icon: "view_week" },
                    { id: "month", label: "Month", icon: "calendar_view_month" },
                  ]}
                  activeId={config.granularity}
                  onChange={(id) => {
                    const itemsPerRow = id === "day" ? 31 : id === "week" ? 12 : 4;
                    setConfig((prev) => ({ ...prev, granularity: id as AppConfig['granularity'], itemsPerRow: itemsPerRow }));
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-2 block">
                  Visual Layout
                </label>
                <SegmentedControl
                  cols={3}
                  options={[
                    { id: "grid", label: config.granularity === "day" ? "Calendar" : "Wrapped", icon: "grid_view" },
                    { id: "rows", label: "Horiz Strip", icon: "view_headline" },
                    { id: "columns", label: "Vert Strip", icon: "view_column" },
                  ]}
                  activeId={config.mode}
                  onChange={(id) => updateConfig("mode", id as AppConfig['mode'])}
                />
              </div>

              <div className="bg-[#141414] p-3 rounded-lg border border-border/40 pb-4 space-y-4">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-1 block border-b border-white/5 pb-1 flex justify-between">
                  <span>Layout Wrapping & Alignment</span>
                  <span className="text-[8px] text-accent/80 font-normal">ADAPTIVE</span>
                </label>

                {(() => {
                  const isMonthsPerRowApplicable = 
                    config.mode !== "timeline" && 
                    (config.mode === "columns" || 
                     (config.mode === "grid" && (
                       config.granularity === "day" || 
                       (config.granularity === "week" && config.showMonthAxis)
                     )));

                  const monthsPerRowLabel = config.mode === "columns" ? "Max Strips Side-by-Side" : "Max Months Per Row";

                  return (
                    <div className={`space-y-1 transition-opacity duration-200 ${isMonthsPerRowApplicable ? "" : "opacity-30"}`}>
                      <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <span>{monthsPerRowLabel}</span>
                          {!isMonthsPerRowApplicable && (
                            <span className="text-[8px] bg-red-500/10 text-red-400/80 px-1 py-0.2 rounded uppercase tracking-wider font-normal">Inactive</span>
                          )}
                        </span>
                        <span className="text-accent text-[12px] font-mono tabular-nums">{config.monthsPerRow}</span>
                      </label>
                      <Input 
                        type="range" 
                        min="1" 
                        max="12" 
                        step="1" 
                        value={config.monthsPerRow} 
                        onChange={(e) => updateConfig("monthsPerRow", parseInt(e.target.value, 10))} 
                        className="w-full"
                        disabled={!isMonthsPerRowApplicable}
                      />
                    </div>
                  );
                })()}

                {(() => {
                  const blocksPerRowLabel = config.granularity === "week" ? "Max Weeks Per Row" : "Max Blocks / Items Per Row";
                  const maxLimit = config.granularity === "week" ? 52 : 24;

                  return (
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                        <span>{blocksPerRowLabel}</span>
                        <span className="text-accent text-[12px] font-mono tabular-nums">{config.itemsPerRow}</span>
                      </label>
                      <Input 
                        type="range" 
                        min="1" 
                        max={maxLimit} 
                        step="1" 
                        value={config.itemsPerRow} 
                        onChange={(e) => updateConfig("itemsPerRow", parseInt(e.target.value, 10))} 
                        className="w-full"
                      />
                    </div>
                  );
                })()}

                {(() => {
                  const isAlignmentApplicable = config.mode === "grid" || config.mode === "columns";

                  return (
                    <div className={`space-y-1.5 border-t border-white/5 pt-3 transition-opacity duration-200 ${isAlignmentApplicable ? "" : "opacity-30"}`}>
                      <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span>Vertical Block Alignment</span>
                          {!isAlignmentApplicable && (
                            <span className="text-[8px] bg-red-500/10 text-red-500/80 px-1 py-0.2 rounded uppercase tracking-wider font-normal">Inactive</span>
                          )}
                        </span>
                      </label>
                      <SegmentedControl
                        cols={2}
                        options={[
                          { id: "top", label: "Top-Aligned", icon: "vertical_align_top" },
                          { id: "center", label: "Center-Aligned", icon: "vertical_align_center" },
                        ]}
                        activeId={config.blockAlignment || "top"}
                        onChange={(id) => updateConfig("blockAlignment", id as AppConfig['blockAlignment'])}
                      />
                    </div>
                  );
                })()}
              </div>

              <ControlGroup label="Calendar Rules">
                <div className="grid grid-cols-1 gap-2 bg-[#141414] p-3 rounded-lg border border-border/40">
                  <Toggle id="opt-monday" label="Start Weeks on Monday" checked={config.isMondayFirst} onChange={(val) => updateConfig("isMondayFirst", val)} />
                </div>
              </ControlGroup>
            </div>
          </SidebarSection>
        )}
      </div>
    );
  };

  const renderStyleTab = () => {
    const hasThemeMatch = matches("Color & Theme", ["palette", "classic", "ember", "github", "ocean", "forest", "berry", "theme", "colors", "transparent", "background", "oklch"]);
    const hasSizingMatch = matches("Canvas Sizing", ["cell", "dot size", "canvas", "sizing", "gap", "radius", "corner"]);
    const hasTypographyMatch = matches("Typography", ["font size", "link", "family", "inter", "terminal", "serif", "typography"]);

    return (
      <div className="space-y-2">
        {hasThemeMatch && (
          <SidebarSection label="Color & Theme" defaultOpen={true} className="pt-4">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-3 block border-b border-border/40 pb-1">
                  Color Palette Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map((t) => {
                    const isActive = JSON.stringify(config.colors) === JSON.stringify(t.colors);
                    return (
                      <button
                        key={t.name}
                        onClick={() => setConfig((prev) => ({ ...prev, colors: t.colors }))}
                        className={`
                          aspect-square rounded-full border-2 transition-all relative overflow-hidden active:scale-[0.96] shadow-md flex items-center justify-center cursor-pointer
                          ${isActive ? "border-accent scale-105" : "border-white/5 opacity-80 hover:opacity-100"}
                        `}
                        style={{ backgroundColor: t.colors.bg }}
                        title={t.name}
                      >
                        <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.colors.fill }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#09090b] p-3 rounded-lg border border-white/5 space-y-3">
                <span className="text-[10px] text-white font-mono uppercase tracking-wider font-bold block border-b border-white/5 pb-1.5">
                  Custom Palette Colors
                </span>
                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono text-gray-400">Active Fill</span>
                    <input 
                      type="color" 
                      value={config.colors.fill} 
                      onChange={(e) => handleColorChange('fill', e.target.value)}
                      className="w-10 h-6 rounded cursor-pointer border border-white/10 bg-transparent p-0 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono text-gray-400">Today Mark</span>
                    <input 
                      type="color" 
                      value={config.colors.today} 
                      onChange={(e) => handleColorChange('today', e.target.value)}
                      className="w-10 h-6 rounded cursor-pointer border border-white/10 bg-transparent p-0 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono text-gray-400">Empty Cell</span>
                    <input 
                      type="color" 
                      value={config.colors.empty} 
                      onChange={(e) => handleColorChange('empty', e.target.value)}
                      className="w-10 h-6 rounded cursor-pointer border border-white/10 bg-transparent p-0 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono text-gray-400">Canvas Bg</span>
                    <input 
                      type="color" 
                      value={config.colors.bg} 
                      onChange={(e) => handleColorChange('bg', e.target.value)}
                      className="w-10 h-6 rounded cursor-pointer border border-white/10 bg-transparent p-0 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono text-gray-400">Label Text</span>
                    <input 
                      type="color" 
                      value={config.colors.text} 
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-10 h-6 rounded cursor-pointer border border-white/10 bg-transparent p-0 outline-none"
                    />
                  </div>
                </div>
              </div>

              <ControlGroup label="Background Overlay">
                <Toggle id="chk-trans" label="Output Transparent Background" checked={config.transparentBg} onChange={(v) => updateConfig("transparentBg", v)} />
              </ControlGroup>
            </div>
          </SidebarSection>
        )}

        {hasSizingMatch && (
          <SidebarSection label="Canvas Sizing" defaultOpen={true}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                  <span>Cell Dot Size</span>
                  <span className="text-accent text-[12px] font-mono tabular-nums">{config.dotSize}px</span>
                </label>
                <Input type="range" min="2" max="64" step="1" value={config.dotSize} onChange={(e) => updateConfig("dotSize", parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                  <span>Global Gap</span>
                  <span className="text-accent text-[12px] font-mono tabular-nums">{config.gap}px</span>
                </label>
                <Input type="range" min="0" max="32" step="1" value={config.gap} onChange={(e) => updateConfig("gap", parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                  <span>Corner Radius</span>
                  <span className="text-accent text-[12px] font-mono tabular-nums">{config.radius}px</span>
                </label>
                <Input type="range" min="0" max="32" step="1" value={config.radius} onChange={(e) => updateConfig("radius", parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          </SidebarSection>
        )}

        {hasTypographyMatch && (
          <SidebarSection label="Typography" defaultOpen={true}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                  <span>Font Size</span>
                  <span className="text-accent text-[12px] font-mono tabular-nums">{config.fontSize}px</span>
                </label>
                <Input
                  type="range" min="6" max="32" step="1"
                  value={config.fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setConfig((prev) => {
                      const next = { ...prev, fontSize: newSize };
                      if (prev.linkFontDotSize) next.dotSize = Math.max(2, Math.round(newSize * 1.5));
                      return next;
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="bg-[#141414] p-2 rounded border border-border/40">
                <Toggle id="chk-link" label="Auto-Link Cell Size to Font" checked={config.linkFontDotSize} onChange={(v) => updateConfig("linkFontDotSize", v)} />
              </div>
              <Select value={config.fontFamily} onChange={(e) => updateConfig("fontFamily", e.target.value)}>
                <option value="'Inter', sans-serif">Inter Sans (Clean)</option>
                <option value="'JetBrains Mono', monospace">Terminal (Code)</option>
                <option value="serif">Modern Serif (Editorial)</option>
              </Select>
            </div>
          </SidebarSection>
        )}
      </div>
    );
  };

  const renderContextTab = () => {
    const hasDocMatch = matches("Document Info", ["title", "text", "vision", "info", "rendered title", "document"]);
    const hasAxisMatch = matches("Axis & Watermarks", ["axis", "watermark", "month axis", "weekday axis", "year background", "completion progress", "stats", "progress bar"]);
    const hasOverlayMatch = matches("Cell Content Overlay", ["overlay", "highlight data", "active label", "label format", "week numbers", "month numbers", "day numbers", "print", "cell content"]);
    const hasPostMatch = matches("Visual Post-Processing", ["visual", "post-processing", "mute", "past", "dim", "weekends", "strength", "dim past", "mute past"]);
    const hasMementoMatch = matches("Memento Mori & Life View", ["memento", "mori", "life view"]);

    return (
      <div className="space-y-2">
        {hasMementoMatch && (
          <SidebarSection label="Memento Mori & Life View" defaultOpen={config.isLifeMode} className="pt-4">
            <div className="space-y-4">
              <Toggle id="chk-lifemode" label="Enable Life View Mode" checked={config.isLifeMode || false} onChange={(val) => updateConfig("isLifeMode", val)} />
              
              {config.isLifeMode && (
                <div className="space-y-4 p-3 bg-[#111112] rounded-lg border border-white/5">
                  <ControlGroup label="Your Birth Date">
                    <Input 
                      type="date" 
                      value={config.birthDate || "2000-01-01"} 
                      onChange={(e) => updateConfig("birthDate", e.target.value)}
                      className="font-mono text-[11px] h-9"
                    />
                  </ControlGroup>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                      <span>Life Expectancy</span>
                      <span className="text-accent text-[12px] font-mono tabular-nums">{config.lifeExpectancy || 80} Years</span>
                    </label>
                    <Input 
                      type="range" 
                      min="40" 
                      max="120" 
                      step="1" 
                      value={config.lifeExpectancy || 80} 
                      onChange={(e) => updateConfig("lifeExpectancy", parseInt(e.target.value, 10))} 
                      className="w-full"
                    />
                  </div>

                  <ControlGroup label="Matrix Granularity">
                    <Select
                      value={config.lifeGranularity || "week"}
                      onChange={(e) => updateConfig("lifeGranularity", e.target.value as AppConfig['lifeGranularity'])}
                      className="w-full text-[10px]"
                    >
                      <option value="week">Weeks (52 cols)</option>
                      <option value="month">Months (12 cols)</option>
                    </Select>
                  </ControlGroup>

                  <Toggle id="chk-lstats" label="Show Visual Progress Stats" checked={config.showLifeStats ?? true} onChange={(val) => updateConfig("showLifeStats", val)} />
                </div>
              )}

              <div className="bg-[#111112] p-3 rounded-lg border border-white/5 space-y-4 text-[11px]">
                <Toggle id="chk-headerplugin" label='Show "MEMENTO MORI" Title' checked={config.showHeaderPlugin || false} onChange={(val) => updateConfig("showHeaderPlugin", val)} />
              </div>
            </div>
          </SidebarSection>
        )}

        {hasDocMatch && (
          <SidebarSection label="Document Info" defaultOpen={true} className="pt-4">
            <ControlGroup label="Rendered Title">
              <Input type="text" placeholder="e.g. 2024 VISION" value={config.customTitle || ""} onChange={(e) => updateConfig("customTitle", e.target.value)} className="text-[11px]" />
            </ControlGroup>
          </SidebarSection>
        )}

        {hasAxisMatch && (
          <SidebarSection label="Axis & Watermarks" defaultOpen={true}>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {config.granularity !== "month" && (
                <Toggle id="chk-maxis" label="Show Month Axis Labels" checked={config.showMonthAxis} onChange={(v) => updateConfig("showMonthAxis", v)} />
              )}
              {config.granularity === "day" && (
                <Toggle id="chk-waxis" label="Show Weekday Axis labels" checked={config.showWeekdayAxis} onChange={(v) => updateConfig("showWeekdayAxis", v)} />
              )}
              <Toggle id="chk-watermark" label="Year Background Watermark" checked={config.showYearLabel} onChange={(v) => updateConfig("showYearLabel", v)} />
              <Toggle id="chk-stats" label="Show Completion Progress Bar" checked={config.showStats} onChange={(v) => updateConfig("showStats", v)} />
            </div>
          </SidebarSection>
        )}

        {hasOverlayMatch && (
          <SidebarSection label="Cell Content Overlay" defaultOpen={true}>
            <div className="grid grid-cols-1 gap-2 mb-2 text-[11px]">
              <div className="bg-[#141414] p-3 rounded-lg border border-border/40">
                <Toggle id="chk-active" label="Highlight Selected Data" checked={config.showActiveLabel} onChange={(v) => updateConfig("showActiveLabel", v)} />
                {config.showActiveLabel && (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                    <label className="text-[10px] text-gray-550 font-mono uppercase tracking-tight">Label Format</label>
                    <Select value={config.activeLabelFormat} onChange={(e) => updateConfig("activeLabelFormat", e.target.value as AppConfig['activeLabelFormat'])} className="w-full text-[10px]">
                      <option value="date">YYYY-MM-DD Value</option>
                      <option value="weekNum">ISO Week Number</option>
                      <option value="dayName">Named Day</option>
                      <option value="monthName">Named Month</option>
                      <option value="monthDate">Month/Date</option>
                      <option value="full">Full Descriptive Details</option>
                    </Select>
                  </div>
                )}
              </div>

              {config.granularity === "day" && (
                <div className="bg-[#141414] p-3 rounded-lg border border-border/40 space-y-2">
                  <Toggle id="chk-daynumbers" label="Print Day Numbers on Cells" checked={config.showDayNumbers} onChange={(v) => updateConfig("showDayNumbers", v)} />
                  {config.showDayNumbers && (
                    <div className="pl-4 border-l border-border/40 ml-2 space-y-1">
                      <Toggle id="chk-keep-cell-shape" label="Keep Cell Background Shape" checked={config.keepCellShapeWithNumbers} onChange={(v) => updateConfig("keepCellShapeWithNumbers", v)} />
                    </div>
                  )}
                </div>
              )}
              {config.granularity === "day" && config.mode === "columns" && (
                <div className="bg-[#141414] p-3 rounded-lg border border-border/40">
                  <Toggle id="chk-sidedayaxis" label="Show Side Day Axis (1-31)" checked={config.showSideDayAxis} onChange={(v) => updateConfig("showSideDayAxis", v)} />
                </div>
              )}
              {config.granularity !== "month" && <Toggle id="chk-weeknumbers" label="Print Week Numbers on Cells" checked={config.showWeekNumbers} onChange={(v) => updateConfig("showWeekNumbers", v)} />}
              {config.granularity === "month" && (
                <>
                  <Toggle id="chk-monthnumbers" label="Print Month Numbers" checked={config.showMonthNumbers} onChange={(v) => updateConfig("showMonthNumbers", v)} />
                  <Toggle id="chk-monthlabels" label="Print Month Labels" checked={config.showMonthLabels} onChange={(v) => updateConfig("showMonthLabels", v)} />
                </>
              )}
            </div>
          </SidebarSection>
        )}

        {hasPostMatch && (
          <SidebarSection label="Visual Post-Processing" defaultOpen={true}>
            <div className="grid grid-cols-1 gap-2 text-[11px] bg-[#141414] p-3 rounded-lg border border-border/40">
              <Toggle id="chk-weekends" label="Dim Weekends Automatically" checked={config.highlightWeekends} onChange={(v) => updateConfig("highlightWeekends", v)} />
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Toggle id="chk-dim" label="Mute Past Real-World Dates" checked={config.dimPastDays} onChange={(v) => updateConfig("dimPastDays", v)} />
                {config.dimPastDays && (
                  <div className="space-y-1 pt-2">
                    <label className="text-[10px] text-gray-500 font-mono uppercase">Muting Strength ({config.dimPastDaysStrength || 50}%)</label>
                    <Input type="range" min="0" max="100" step="5" value={config.dimPastDaysStrength || 50} onChange={(e) => updateConfig("dimPastDaysStrength", parseInt(e.target.value))} className="w-full animate-slide-down" />
                  </div>
                )}
              </div>
            </div>
          </SidebarSection>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
        fixed md:relative inset-y-0 left-0 w-80 flex-shrink-0 bg-[#0c0c0f]/98 border-r border-zinc-800/60 flex flex-col h-full z-40 transition-transform duration-300 shadow-2xl overflow-hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-zinc-800/50 flex justify-between items-center bg-[#0d0d11]">
          <div className="flex items-center gap-2">
            <h1 
              id="sidebar-panel-header" 
              data-toc 
              data-toc-depth="2" 
              data-toc-title={`WORKSPACE: OPTIONS`}
              className="text-xl font-extrabold tracking-[0.2em] uppercase text-white flex items-center gap-2 drop-shadow-md select-none font-sans"
            >
              <span className="material-symbols-outlined text-[#ea580c] !text-[28px] animate-pulse">
                hourglass_empty
              </span>
              MEMENTO
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Close Button Mobile */}
            <button
              onClick={onToggle}
              className="md:hidden w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Controls - UNIFIED */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[#07070a]/90">
          {/* Quick Find Options Filter */}
          <div className="px-4 py-2 bg-[#09090c] sticky top-0 z-20 border-b border-[#181820]/45">
            <div className="relative flex items-center border border-zinc-800/80 bg-[#050508]/60 rounded-lg px-2.5 focus-within:border-accent/50 transition-colors shadow-inner">
              <span className="material-symbols-outlined text-[15px] text-zinc-500 shrink-0 select-none">search</span>
              <input
                type="text"
                placeholder="FIND SETTING..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-2 py-1.5 text-[9px] font-mono uppercase tracking-wider text-white placeholder-zinc-700 outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-500 hover:text-zinc-350 transition-colors flex items-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Premium Tab Swapper */}
          {!searchQuery && (
            <div className="px-4 py-2 bg-[#09090c]/80 border-b border-zinc-800/20 flex gap-1 relative select-none">
              <button
                id="tab-btn-config"
                onClick={() => setActiveTab("config")}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.96] border cursor-pointer font-bold ${
                  activeTab === "config" 
                    ? "bg-accent/15 border-accent/20 text-accent font-semibold" 
                    : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/10"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">settings</span>
                <span>Setup</span>
              </button>
              <button
                id="tab-btn-style"
                onClick={() => setActiveTab("style")}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.96] border cursor-pointer font-bold ${
                  activeTab === "style" 
                    ? "bg-accent/15 border-accent/20 text-accent font-semibold" 
                    : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/10"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">palette</span>
                <span>Style</span>
              </button>
              <button
                id="tab-btn-layout"
                onClick={() => setActiveTab("layout")}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.96] border cursor-pointer font-bold ${
                  activeTab === "layout" 
                    ? "bg-accent/15 border-accent/20 text-accent font-semibold" 
                    : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/10"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">layers</span>
                <span>Overlays</span>
              </button>
            </div>
          )}

          {/* Search Header Banner */}
          {searchQuery && (
            <div className="px-5 py-2.5 bg-accent/5 border-b border-accent/10 flex items-center gap-2 select-none animate-fade-in shrink-0">
              <span className="material-symbols-outlined text-accent text-[14px] animate-pulse">radar</span>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                Unified Search (Tab Lock Bypassed)
              </span>
            </div>
          )}

          <div className="flex-1 px-4 pb-20 overflow-y-auto custom-scrollbar">
            {(activeTab === "config" || searchQuery) && (
              <div className="opacity-0 animate-[fade-in_300ms_ease-out_0ms_forwards]">
                {renderArchitectureTab()}
              </div>
            )}
            {(activeTab === "style" || searchQuery) && (
              <div className="opacity-0 animate-[fade-in_300ms_ease-out_0ms_forwards]">
                {renderStyleTab()}
              </div>
            )}
            {(activeTab === "layout" || searchQuery) && (
              <div className="opacity-0 animate-[fade-in_300ms_ease-out_0ms_forwards]">
                {renderContextTab()}
              </div>
            )}
          </div>

          {/* Persistent Footer */}
          <div className="p-4 bg-[#09090c]/98 border-t border-zinc-800/60 flex flex-col gap-1.5 sticky bottom-0 z-10 shadow-lg">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="primary"
                icon="image"
                label={isDownloading ? "..." : "EXPORT PNG"}
                onClick={onDownload}
                disabled={isDownloading}
                className="w-full h-11 text-[10px]"
              />
              <Button
                variant="primary"
                icon="polyline"
                label={isDownloading ? "..." : "EXPORT SVG"}
                onClick={onDownloadSvg}
                disabled={isDownloading}
                className="w-full h-11 text-[10px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="secondary"
                icon="share"
                label={shareText}
                onClick={handleShare}
                className="h-8 text-[9px] font-mono font-medium !py-1 flex items-center justify-center border-dashed border-zinc-805"
              />
              <Button
                variant="secondary"
                icon="download"
                label={downloadLinkText}
                onClick={handleCopyDownloadLink}
                className="h-8 text-[9px] font-mono font-medium !py-1 flex items-center justify-center border-dashed border-zinc-805"
              />
              <div className="col-span-2">
                <Button
                  variant="secondary"
                  icon="restart_alt"
                  label="RESET TO DEFAULT"
                  onClick={resetConfig}
                  className="w-full h-8 text-[9px] font-mono font-medium !py-1 flex items-center justify-center border-dashed border-zinc-805"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
