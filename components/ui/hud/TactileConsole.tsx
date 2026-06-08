import React from "react";
import { motion } from "motion/react";
import { Undo, Redo, Maximize2, RotateCcw, Download, CalendarRange } from "lucide-react";
import { AppConfig } from "@/types";
import { Button } from "../Controls";

interface TactileConsoleProps {
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

export const TactileConsole: React.FC<TactileConsoleProps> = ({
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

  return (
    <div className="bg-[#09090b]/90 border-b border-white/5 p-4 space-y-4 select-none">
      {/* Layout Presets */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-450 block">
          Layout Presets
        </span>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#101012] border border-white/5 rounded-xl">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={applyYearPreset}
            className="py-2 text-[9px] font-mono font-extrabold uppercase text-zinc-400 hover:text-white rounded-lg bg-[#141416]/50 hover:bg-[#1c1c20]/60 active:bg-black/40 border border-white/[0.02] cursor-pointer transition-colors text-center"
            title="Switch grid to full calendar year"
          >
            Year Grid
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={applyMonthPreset}
            className="py-2 text-[9px] font-mono font-extrabold uppercase text-zinc-400 hover:text-white rounded-lg bg-[#141416]/50 hover:bg-[#1c1c20]/60 active:bg-black/40 border border-white/[0.02] cursor-pointer transition-colors text-center"
            title="Focus starting from current month"
          >
            Month Focus
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={applyTwelveWkPreset}
            className="py-2 text-[9px] font-mono font-extrabold uppercase text-zinc-400 hover:text-white rounded-lg bg-[#141416]/50 hover:bg-[#1c1c20]/60 active:bg-black/40 border border-white/[0.02] cursor-pointer transition-colors text-center"
            title="Focus standard 12 week layout cycle"
          >
            12-Wk Cycle
          </motion.button>
        </div>
      </div>

      {/* Primary Commands Band: Undo, Redo, Fit Screen, Soft Reset */}
      <div className="flex gap-1.5">
        <motion.button
          disabled={!canUndo}
          whileHover={canUndo ? { scale: 1.05 } : {}}
          whileTap={canUndo ? { scale: 0.96 } : {}}
          onClick={onUndo}
          className="flex-1 flex items-center justify-center py-2 px-1.5 rounded-lg border border-white/5 bg-[#101012] hover:bg-[#161619] disabled:opacity-30 disabled:hover:bg-[#101012] text-zinc-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Undo modification"
        >
          <Undo className="h-3.5 w-3.5" />
        </motion.button>

        <motion.button
          disabled={!canRedo}
          whileHover={canRedo ? { scale: 1.05 } : {}}
          whileTap={canRedo ? { scale: 0.96 } : {}}
          onClick={onRedo}
          className="flex-1 flex items-center justify-center py-2 px-1.5 rounded-lg border border-white/5 bg-[#101012] hover:bg-[#161619] disabled:opacity-30 disabled:hover:bg-[#101012] text-zinc-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Redo modification"
        >
          <Redo className="h-3.5 w-3.5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => window.dispatchEvent(new CustomEvent('fit-grid-to-screen'))}
          className="flex-1 flex items-center justify-center py-2 px-1.5 rounded-lg border border-white/5 bg-[#101012] hover:bg-[#161619] text-zinc-350 cursor-pointer transition-colors"
          title="Fit visual canvas grid to screen size"
        >
          <Maximize2 className="h-3.5 w-3.5 text-accent-dim hover:text-accent" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, rotate: -30 }}
          whileTap={{ scale: 0.96 }}
          onClick={resetConfig}
          className="flex-1 flex items-center justify-center py-2 px-1.5 rounded-lg border border-white/5 bg-[#101012] hover:bg-[#161619] text-red-400 cursor-pointer transition-colors"
          title="Reload system config defaults"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Dynamic Tactile Zoom Dial */}
      <div className="flex items-center justify-between p-1 px-3 bg-[#101012] border border-white/5 rounded-xl">
        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#71717a]">
          Lens Scale
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(Math.max(0.05, zoom - 0.1))}
            className="w-5 h-5 bg-[#161619] hover:bg-[#1e1e24] text-zinc-400 hover:text-white rounded flex items-center justify-center text-xs cursor-pointer select-none transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-[10px] font-mono font-extrabold text-zinc-300 w-11 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3.0, zoom + 0.1))}
            className="w-5 h-5 bg-[#161619] hover:bg-[#1e1e24] text-zinc-400 hover:text-white rounded flex items-center justify-center text-xs cursor-pointer select-none transition-colors"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      {/* Smashed Export Drawer: Unifies SVG and PNG into double pill */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <motion.button
          disabled={isDownloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onDownload}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-accent/20 bg-accent/10 hover:bg-accent/20 text-accent text-[10px] font-bold font-mono transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download className="h-3 w-3" />
          PNG FILE
        </motion.button>

        <motion.button
          disabled={isDownloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onDownloadSvg}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-700/35 bg-zinc-800/30 hover:bg-zinc-800/50 text-zinc-300 text-[10px] font-bold font-mono transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download className="h-3 w-3" />
          SVG FILE
        </motion.button>
      </div>
    </div>
  );
};
