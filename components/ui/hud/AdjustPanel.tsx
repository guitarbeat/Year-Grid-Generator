import React, { useState, useEffect } from "react";
import {
  Button,
  ControlGroup,
  Input,
  Toggle,
  ThemeSelector,
  SegmentedControl,
  TactileSlider,
  DualMonthRangeSlider,
  Combobox,
} from "../Controls";
import {
  Sparkles,
  LayoutGrid,
  Palette,
  Compass,
  Columns,
  CheckSquare,
  Calendar,
  Trash2,
  Milestone,
  ChevronRight,
  User,
  ExternalLink,
  Pin,
} from "lucide-react";
import { THEMES } from "../themes";
import { AppConfig } from "@/types";
import { HeaderControls } from "./HeaderControls";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Decomposed Subsections
import { AppearanceSection } from "./sections/AppearanceSection";
import { AxisFlowSection } from "./sections/AxisFlowSection";
import { OverlaysSection } from "./sections/OverlaysSection";
import { GridTimelineSection } from "./sections/GridTimelineSection";
import { MilestonesSection } from "./sections/MilestonesSection";

/* ==========================================================================
   UNDOCKED PLACEHOLDER HELPER
   ========================================================================== */
interface UndockedPlaceholderProps {
  title: string;
  icon: React.ReactNode;
  onDock: () => void;
}

const UndockedPlaceholder: React.FC<UndockedPlaceholderProps> = ({ title, icon, onDock }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center bg-zinc-950/40 border border-white/5 rounded-2xl shadow-inner space-y-5 relative overflow-hidden select-none"
    >
      {/* Decorative pulse blur glow in the background */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-accent/8 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-accent/8 rounded-full blur-2xl pointer-events-none" />

      <motion.div 
        animate={{ 
          y: [0, -4, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="p-4 bg-white/[0.02] border border-white/8 rounded-2xl flex items-center justify-center text-accent shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
      >
        {icon}
      </motion.div>
      <div className="space-y-1.5 z-10">
        <h4 className="text-[11px] font-sans font-extrabold text-zinc-150 uppercase tracking-[0.2em]">
          {title} Undocked
        </h4>
        <p className="text-[11px] text-zinc-500 font-sans max-w-[220px] mx-auto leading-relaxed">
          Floating as an active workspace overlay. Customize seamlessly right on the grid canvas!
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDock}
        className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-[11px] font-extrabold uppercase tracking-widest text-accent hover:text-white bg-accent/8 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 rounded-xl transition-all duration-150 cursor-pointer shadow-lg active:scale-[0.96]"
      >
        <span className="rotate-45 transform">
          <Pin className="w-3.5 h-3.5" />
        </span>
        Dock to Sidebar
      </motion.button>
    </motion.div>
  );
};

/* ==========================================================================
   MAIN EXPORT AND RENDER CONTAINER
   ========================================================================== */
interface AdjustPanelProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  selectedCellId: string | null;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | null>>;
  onDownload: () => void;
  onDownloadSvg: () => void;
  isDownloading: boolean;
  resetConfig: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  undockedTabs: Record<string, { x: number; y: number; isMinimized: boolean }>;
  undockTab: (tab: string) => void;
  dockTab: (tab: string) => void;
}

type TabType = "grid" | "style" | "axis" | "layers" | "milestones";

export const AdjustPanel: React.FC<AdjustPanelProps> = ({
  config,
  setConfig,
  selectedCellId,
  setSelectedCellId,
  onDownload,
  onDownloadSvg,
  isDownloading,
  resetConfig,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  setZoom,
  undockedTabs,
  undockTab,
  dockTab,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("grid");

  // Keep track of milestone cell highlights: snap user straight to panel overview
  useEffect(() => {
    if (selectedCellId) {
      setActiveTab("milestones");
    }
  }, [selectedCellId]);

  if (!config || !setConfig) return null;

  const TABS: { value: TabType; label: string }[] = [
    { value: "grid", label: "Grid" },
    { value: "style", label: "Style" },
    { value: "axis", label: "Axis" },
    { value: "layers", label: "Layers" },
    { value: "milestones", label: "Milestones" },
  ];

  const isTabUndocked = (tab: TabType) => !!undockedTabs[tab];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col h-full bg-[#08080a] select-none">
      <div className="space-y-1 pb-16 flex-1 flex flex-col">
        {/* TOP COMPACT ACTIONS SYSTEM */}
        <HeaderControls
          config={config}
          setConfig={setConfig}
          onDownload={onDownload}
          onDownloadSvg={onDownloadSvg}
          isDownloading={isDownloading}
          resetConfig={resetConfig}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          zoom={zoom}
          setZoom={setZoom}
        />

        {/* LUXURIOUS MINIMAL TAB BAR */}
        <div className="px-5 pt-5 sticky top-0 bg-[#08080a]/95 backdrop-blur-md z-30 pb-4 border-b border-b-white/[0.04]">
          <div className="flex bg-zinc-950 border border-white/5 p-1 rounded-xl h-[40px] relative overflow-hidden select-none w-full shadow-inner">
            {TABS.map((t) => {
              const isActive = t.value === activeTab;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActiveTab(t.value)}
                  className={`flex-1 relative z-10 flex items-center justify-center gap-1 md:gap-1.5 font-sans text-[10.5px] font-bold transition-all duration-200 cursor-pointer outline-none rounded-lg active:scale-[0.96] ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-350"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="hud-main-active-tab-pill"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="absolute inset-0 bg-white/[0.04] border border-white/5 rounded-lg shadow-sm"
                    />
                  )}
                  {t.value === "grid" && <LayoutGrid className="w-3.5 h-3.5 shrink-0" />}
                  {t.value === "style" && <Palette className="w-3.5 h-3.5 shrink-0" />}
                  {t.value === "axis" && <Compass className="w-3.5 h-3.5 shrink-0" />}
                  {t.value === "layers" && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
                  {t.value === "milestones" && <Milestone className="w-3.5 h-3.5 shrink-0" />}
                  <span className="relative z-20 hidden md:flex items-center gap-1.5">
                    <span>{t.label}</span>
                    {isTabUndocked(t.value) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CURRENT TAB VIEW PORT */}
        <div className="p-6 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {/* Tab 1: Layout, Presets & Timelines */}
            {activeTab === "grid" && (
              <motion.div
                key="tab-grid"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="space-y-4"
              >
                {isTabUndocked("grid") ? (
                  <UndockedPlaceholder
                    title="Grid Timeline"
                    icon={<LayoutGrid className="w-[22px] h-[22px] text-accent" />}
                    onDock={() => dockTab("grid")}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                        Active Grid Section
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => undockTab("grid")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg text-zinc-400 hover:text-zinc-250 font-sans text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Undock overlay</span>
                      </motion.button>
                    </div>
                    <GridTimelineSection config={config} setConfig={setConfig} />
                  </>
                )}
              </motion.div>
            )}

            {/* Tab 2: Appearance Colors and Shapes */}
            {activeTab === "style" && (
              <motion.div
                key="tab-style"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="space-y-4"
              >
                {isTabUndocked("style") ? (
                  <UndockedPlaceholder
                    title="Appearance Style"
                    icon={<Palette className="w-[22px] h-[22px] text-emerald-400" />}
                    onDock={() => dockTab("style")}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                        Design Theme Section
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => undockTab("style")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg text-zinc-400 hover:text-zinc-250 font-sans text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Undock overlay</span>
                      </motion.button>
                    </div>
                    <AppearanceSection config={config} setConfig={setConfig} />
                  </>
                )}
              </motion.div>
            )}

            {/* Tab 3: Grid Axis Vectors & Spinnings */}
            {activeTab === "axis" && (
              <motion.div
                key="tab-axis"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="space-y-4"
              >
                {isTabUndocked("axis") ? (
                  <UndockedPlaceholder
                    title="Axis Alignment"
                    icon={<Compass className="w-[22px] h-[22px] text-amber-400" />}
                    onDock={() => dockTab("axis")}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                        Label Orientations Section
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => undockTab("axis")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg text-zinc-400 hover:text-zinc-250 font-sans text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Undock overlay</span>
                      </motion.button>
                    </div>
                    <AxisFlowSection config={config} setConfig={setConfig} />
                  </>
                )}
              </motion.div>
            )}

            {/* Tab 4: Ghost Watermarks & Layers */}
            {activeTab === "layers" && (
              <motion.div
                key="tab-layers"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="space-y-4"
              >
                {isTabUndocked("layers") ? (
                  <UndockedPlaceholder
                    title="Watermarks & Overlays"
                    icon={<Sparkles className="w-[22px] h-[22px] text-violet-400" />}
                    onDock={() => dockTab("layers")}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                        Overlays & Backdrops
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => undockTab("layers")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg text-zinc-400 hover:text-zinc-250 font-sans text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Undock overlay</span>
                      </motion.button>
                    </div>
                    <OverlaysSection config={config} setConfig={setConfig} />
                  </>
                )}
              </motion.div>
            )}

            {/* Tab 5: Milestone overrides and notes */}
            {activeTab === "milestones" && (
              <motion.div
                key="tab-milestones"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="space-y-4"
              >
                {isTabUndocked("milestones") ? (
                  <UndockedPlaceholder
                    title="Milestone Notes"
                    icon={<Milestone className="w-[22px] h-[22px] text-rose-400" />}
                    onDock={() => dockTab("milestones")}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                        Overrides & Logbook
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => undockTab("milestones")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg text-zinc-400 hover:text-zinc-250 font-sans text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Undock overlay</span>
                      </motion.button>
                    </div>
                    <MilestonesSection
                      config={config}
                      setConfig={setConfig}
                      selectedCellId={selectedCellId}
                      setSelectedCellId={setSelectedCellId}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

