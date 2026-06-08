import React, { ReactNode, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence, Transition } from "motion/react";
import { Settings2 } from "lucide-react";
import { ClosedPill } from "./hud/ClosedPill";
import { ExpandedDeck } from "./hud/ExpandedDeck";
import { AppConfig } from "@/types";

// --- Shared Animation Configs ---
const islandTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 26,
};

// --- Main HUD Navigation Component ---

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

  // Settings icon
  const TabIconComponent = <Settings2 className="h-3.5 w-3.5 text-accent" />;

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
            className={`fixed inset-0 z-[9998] cursor-pointer transition-all duration-300 ${
              config?.disableSidebarBlur
                ? "bg-transparent backdrop-blur-none"
                : "bg-black/60 backdrop-blur-[4px]"
            }`}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Island Wrapper (Now Right-Side Panel) */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed top-0 right-0 h-full z-[9999] flex flex-col items-center"
      >
        <motion.div
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
          initial={false}
          animate={{
            width: isExpanded ? 320 : 60,
            height: "100%",
            borderRadius: isExpanded ? "16px 0 0 16px" : "16px 0 0 16px",
          }}
          transition={islandTransition}
          style={{ cursor: isExpanded ? "default" : "pointer" }}
          className="relative overflow-hidden border border-white/10 bg-[#0c0c0e]/95 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          {/* CLOSED PILL CONTENT */}
          <ClosedPill
            isExpanded={isExpanded}
            islandTransition={islandTransition}
            TabIconComponent={TabIconComponent}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            zoom={zoom}
            setZoom={setZoom}
          />

          {/* EXPANDED DECK CONTENT */}
          <ExpandedDeck
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            islandTransition={islandTransition}
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

        </motion.div>
      </motion.div>
    </>
  );
}
