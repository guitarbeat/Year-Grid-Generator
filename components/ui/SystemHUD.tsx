import React, { ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { motion, AnimatePresence, Transition } from "motion/react";
import { Settings2, X, Sliders } from "lucide-react";
import { AdjustPanel } from "./hud/AdjustPanel";
import { AppConfig } from "@/types";

const sidebarTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 28,
};

type SystemHUDProps = {
  children?: ReactNode;
  config?: AppConfig;
  setConfig?: React.Dispatch<React.SetStateAction<AppConfig>>;
  selectedCellId?: string | null;
  setSelectedCellId?: React.Dispatch<React.SetStateAction<string | null>>;
  onDownload: () => Promise<void>;
  onDownloadSvg: () => Promise<void>;
  isDownloading: boolean;
  resetConfig: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};

export function SystemHUD({
  children,
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
  isExpanded,
  setIsExpanded,
}: SystemHUDProps) {

  // Auto-refit the grid boundaries in real-time as the sidebar expands or collapses
  useEffect(() => {
    // Dispatch immediate fit event
    window.dispatchEvent(new CustomEvent("fit-grid-to-screen"));

    // Continuously dispatch during the spring transition to guarantee seamless resynchronization
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent("fit-grid-to-screen"));
    }, 30);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      window.dispatchEvent(new CustomEvent("fit-grid-to-screen"));
    }, 450);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isExpanded]);

  return (
    <>
      {children}

      {/* Mobile-Only Backdrop Scrim */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Structural Sidebar Wrapper */}
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 420 : 64,
          // Hide/Show sidebar entirely offscreen on mobile when not expanded
          x: typeof window !== "undefined" && window.innerWidth < 768 && !isExpanded ? "100%" : "0%",
        }}
        transition={sidebarTransition}
        className="h-full bg-[#0c0c0e]/95 text-white flex flex-col relative overflow-hidden flex-shrink-0 z-[9999] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl max-md:fixed max-md:top-0 max-md:right-0 max-md:h-screen max-md:w-[85vw] max-md:max-w-[420px]"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* --- COLLAPSED STATE (VERTICAL RAIL) --- */
            <motion.div
              key="collapsed-rail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col items-center py-6 px-3 select-none"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsExpanded(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 hover:bg-[#1a1a24] hover:bg-white/[0.08] hover:border-white/10 text-accent transition-[background-color,border-color,transform] duration-200 cursor-pointer"
                title="Expand Options Sidebar"
              >
                <Settings2 className="h-4 w-4 text-accent animate-[spin_12s_linear_infinite]" />
              </motion.button>

              <div className="h-[1px] w-8 bg-white/10 my-6" />

              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex-1 flex items-center justify-center cursor-pointer transition-transform duration-150" 
                onClick={() => setIsExpanded(true)}
              >
                <span className="text-[10px] [writing-mode:vertical-lr] rotate-180 uppercase tracking-[0.25em] font-mono font-bold text-zinc-500 hover:text-accent transition-colors duration-200">
                  GRID OPTIONS
                </span>
              </motion.div>

              <div className="h-[1px] w-8 bg-white/10 my-6" />

              <div className="text-[9px] font-mono font-extrabold text-zinc-650 tracking-wider hover:text-zinc-400 transition-colors duration-200 cursor-default select-none">
                Y-GRID
              </div>
            </motion.div>
          ) : (
            /* --- EXPANDED STATE (FULL OPTIONS DECK) --- */
            <motion.div
              key="expanded-deck"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between px-6 pb-3 pt-5 border-b border-white/[0.04] bg-[#0a0a0c]">
                <div className="flex items-center gap-2.5">
                  <Sliders className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-sans font-semibold text-zinc-250 tracking-tight">
                    Grid Settings
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsExpanded(false)}
                  className="relative before:absolute before:-inset-2 flex items-center justify-center h-8 w-8 text-zinc-400 hover:text-white transition-all bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl cursor-pointer"
                  title="Minimize Sidebar"
                >
                  <X className="h-4 w-4 relative z-10" />
                </motion.button>
              </div>

              {/* Adjust Panel Content */}
              <div className="flex-1 overflow-hidden flex flex-col bg-[#08080a]">
                {config && setConfig && (
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
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile-Only Floating Action Button (Only visible when sidebar is closed) */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-40 md:hidden no-pan">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsExpanded(true)}
            className="flex h-12 px-4 items-center gap-2 rounded-full bg-zinc-950 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-white font-mono text-[11px] font-bold tracking-wider cursor-pointer"
          >
            <Settings2 className="h-4 w-4 text-accent animate-[spin_10s_linear_infinite]" />
            <span>GRID SETTINGS</span>
          </motion.button>
        </div>
      )}
    </>
  );
}
