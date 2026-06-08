import React from "react";
import { motion, Transition } from "motion/react";
import { X, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdjustPanel } from "./AdjustPanel";
import { AppConfig } from "@/types";

interface ExpandedDeckProps {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  islandTransition: Transition;
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
}

export const ExpandedDeck = ({
  isExpanded,
  setIsExpanded,
  islandTransition,
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
}: ExpandedDeckProps) => (
  <motion.div
    initial={false}
    animate={{
      opacity: isExpanded ? 1 : 0,
      scale: isExpanded ? 1 : 1.05,
    }}
    transition={{ ...islandTransition, delay: isExpanded ? 0.08 : 0 }}
    className={cn("absolute inset-0 flex flex-col h-full", !isExpanded && "pointer-events-none")}
  >
    <div className="flex shrink-0 items-center justify-between px-5 pb-2.5 pt-4 border-b border-white/5 bg-black/40">
      <div className="flex items-center gap-2">
        <Sliders className="h-3.5 w-3.5 text-accent" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-300 uppercase">
          Grid Settings
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
 
    <div className="flex-1 overflow-hidden flex flex-col bg-[#08080a]">
        <AdjustPanel
          config={config}
          setConfig={setConfig}
          selectedCellId={selectedCellId}
          setSelectedCellId={setSelectedCellId}
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
    </div>
  </motion.div>
);

