import React from "react";
import { motion } from "motion/react";
import {
  Undo,
  Redo,
  Maximize2,
  RotateCcw,
  Download,
} from "lucide-react";
import { AppConfig } from "@/types";
import { cn } from "@/lib/utils";

interface HeaderControlsProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
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
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  config,
  setConfig,
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
}) => {
  const currentYear = new Date().getFullYear();

  // Preset triggers
  const applyYearPreset = () => {
    setConfig((prev) => ({
      ...prev,
      date: `${currentYear}-01-01`,
      monthsToShow: 12,
      startFromJan: true,
      itemsPerRow: 13,
      granularity: "day",
      mode: "grid",
      monthOffset: 0,
    }));
  };

  const applyMonthPreset = () => {
    const today = new Date().toISOString().split("T")[0];
    setConfig((prev) => ({
      ...prev,
      date: today,
      monthsToShow: 1,
      startFromJan: false,
      monthsPerRow: 1,
      granularity: "day",
      mode: "grid",
      monthOffset: 0,
    }));
  };

  const applyTwelveWkPreset = () => {
    const today = new Date().toISOString().split("T")[0];
    setConfig((prev) => ({
      ...prev,
      date: today,
      monthsToShow: 3,
      startFromJan: false,
      itemsPerRow: 13,
      granularity: "week",
      mode: "grid",
      showWeekNumbers: true,
      monthOffset: 0,
    }));
  };

  // Check which preset is active for gorgeous visual context feedback
  const isYearActive =
    config.monthsToShow === 12 &&
    config.granularity === "day" &&
    config.mode === "grid" &&
    config.startFromJan === true;

  const isMonthActive =
    config.monthsToShow === 1 &&
    config.granularity === "day" &&
    config.mode === "grid" &&
    !config.startFromJan;

  const isTwelveWkActive =
    config.monthsToShow === 3 &&
    config.granularity === "week" &&
    config.mode === "grid";

  return (
    <div className="bg-[#0a0a0c] p-6 space-y-6 select-none border-b border-white/[0.04] flex flex-col">
      {/* 1. Layout Presets */}
      <div className="space-y-3">
        <label className="text-[11px] font-sans font-semibold tracking-wide text-zinc-500">
          Template Templates
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Year Grid Card */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onClick={applyYearPreset}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-xl border transition-all cursor-pointer text-left h-full group",
              isYearActive
                ? "bg-accent/[0.03] border-accent/30 shadow-[0_4px_12px_rgba(234,88,12,0.05)]"
                : "bg-[#121215] border-white/5 hover:border-white/10 hover:bg-[#16161a]"
            )}
            title="Switch grid to full calendar year"
          >
            <span
              className={cn(
                "text-xs font-sans font-semibold transition-colors",
                isYearActive ? "text-accent" : "text-zinc-200 group-hover:text-white"
              )}
            >
              Year Grid
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 leading-normal">
              Full 12-month calendar at a single glance
            </span>
          </motion.button>

          {/* Month Focus Card */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onClick={applyMonthPreset}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-xl border transition-all cursor-pointer text-left h-full group",
              isMonthActive
                ? "bg-accent/[0.03] border-accent/30 shadow-[0_4px_12px_rgba(234,88,12,0.05)]"
                : "bg-[#121215] border-white/5 hover:border-white/10 hover:bg-[#16161a]"
            )}
            title="Focus starting from current month"
          >
            <span
              className={cn(
                "text-xs font-sans font-semibold transition-colors",
                isMonthActive ? "text-accent" : "text-zinc-200 group-hover:text-white"
              )}
            >
              Month Focus
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 leading-normal">
              Deep focus for the current active month
            </span>
          </motion.button>

          {/* 12-Week Cycle Card */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onClick={applyTwelveWkPreset}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-xl border transition-all cursor-pointer text-left h-full group",
              isTwelveWkActive
                ? "bg-accent/[0.03] border-accent/30 shadow-[0_4px_12px_rgba(234,88,12,0.05)]"
                : "bg-[#121215] border-white/5 hover:border-white/10 hover:bg-[#16161a]"
            )}
            title="Focus standard 12 week layout cycle"
          >
            <span
              className={cn(
                "text-xs font-sans font-semibold transition-colors",
                isTwelveWkActive ? "text-accent" : "text-zinc-200 group-hover:text-white"
              )}
            >
              12-Wk Cycle
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 leading-normal">
              Macro sprint planning across 3 months
            </span>
          </motion.button>
        </div>
      </div>

      {/* 2. Canvas Zoom and Edit Actions Rows */}
      <div className="grid grid-cols-2 gap-4">
        {/* Canvas Zoom module */}
        <div className="space-y-2">
          <span className="text-[11px] font-sans font-semibold text-zinc-500 tracking-wide block">
            Canvas Zoom
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-[#121215] border border-white/5 rounded-xl h-[44px]">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setZoom(Math.max(0.05, zoom - 0.1))}
              className="w-8 h-8 hover:bg-white/[0.04] active:bg-white/[0.08] text-zinc-400 hover:text-white rounded-lg flex items-center justify-center text-base cursor-pointer select-none transition-colors"
              title="Zoom Out"
            >
              -
            </motion.button>
            <span className="text-xs font-sans font-medium text-zinc-300 flex-1 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setZoom(Math.min(3.0, zoom + 0.1))}
              className="w-8 h-8 hover:bg-white/[0.04] active:bg-white/[0.08] text-zinc-400 hover:text-white rounded-lg flex items-center justify-center text-base cursor-pointer select-none transition-colors"
              title="Zoom In"
            >
              +
            </motion.button>
          </div>
        </div>

        {/* Quick Actions dock */}
        <div className="space-y-2">
          <span className="text-[11px] font-sans font-semibold text-zinc-500 tracking-wide block">
            Quick Actions
          </span>
          <div className="flex gap-1 bg-[#121215] border border-white/5 p-1 rounded-xl h-[44px]">
            <motion.button
              disabled={!canUndo}
              whileTap={canUndo ? { scale: 0.96 } : {}}
              onClick={onUndo}
              className="flex-1 flex items-center justify-center rounded-lg hover:bg-white/[0.04] disabled:opacity-20 text-zinc-400 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Undo"
            >
              <Undo className="h-3.5 w-3.5" />
            </motion.button>

            <motion.button
              disabled={!canRedo}
              whileTap={canRedo ? { scale: 0.96 } : {}}
              onClick={onRedo}
              className="flex-1 flex items-center justify-center rounded-lg hover:bg-white/[0.04] disabled:opacity-20 text-zinc-400 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Redo"
            >
              <Redo className="h-3.5 w-3.5" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                window.dispatchEvent(new CustomEvent("fit-grid-to-screen"))
              }
              className="flex-1 flex items-center justify-center rounded-lg hover:bg-white/[0.04] text-zinc-400 cursor-pointer transition-all"
              title="Fit to Screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={resetConfig}
              className="flex-1 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-400/80 hover:text-red-450 cursor-pointer transition-all"
              title="Reset Config Defaults"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 3. Export Options Row */}
      <div className="pt-4 border-t border-white/[0.04] space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            disabled={isDownloading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onClick={onDownload}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-accent hover:opacity-90 active:opacity-100 text-white text-xs font-sans font-semibold transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <Download className="h-4 w-4" />
            Export PNG
          </motion.button>

          <motion.button
            disabled={isDownloading}
            whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.12)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onDownloadSvg}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-white/5 bg-[#121215] hover:bg-white/[0.04] text-zinc-300 text-xs font-sans font-semibold transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="h-4 w-4 text-zinc-500" />
            Export SVG
          </motion.button>
        </div>
      </div>
    </div>
  );
};
