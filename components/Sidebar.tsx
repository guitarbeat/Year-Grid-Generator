import React, { useState } from "react";
import { AppConfig, AppColors } from "../types";
import { Button } from "./ui/Controls";
import { SetupTab } from "./sidebar/SetupTab";
import { AestheticsTab } from "./sidebar/AestheticsTab";
import { OverlaysTab } from "./sidebar/OverlaysTab";
import { motion } from "motion/react";

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onDownload: () => void;
  isDownloading: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  resetConfig: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  config,
  setConfig,
  onDownload,
  isDownloading,
  isOpen,
  onToggle,
  resetConfig,
}) => {
  const [activeTab, setActiveTab ] = useState<"config" | "layout" | "style">(
    "config",
  );
  const [searchQuery, setSearchQuery] = useState("");

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
              data-toc-title={`WORKSPACE: ${activeTab.toUpperCase()}`}
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
          {/* Premium Tab Navigation Slider */}
          <div className="p-2 border-b border-zinc-800/40 bg-[#0a0a0c] sticky top-0 z-20 flex gap-1">
            {(["config", "style", "layout"] as const).map((tab) => {
              const label = tab === "config" ? "Setup" : tab === "style" ? "Aesthetics" : "Overlays";
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  id={`tab-btn-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 py-1.5 text-[9px] font-mono tracking-widest uppercase transition-colors z-10 font-bold ${
                    isSelected ? "text-[#ea580c]" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="sidebarActiveTabIndicator"
                      className="absolute inset-0 bg-[#ea580c]/8 border border-[#ea580c]/15 rounded-md -z-10 shadow-[0_2px_10px_-4px_rgba(234,88,12,0.15)]"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick Find Options Filter */}
          <div className="px-4 py-2 bg-[#09090c] border-b border-[#181820]/45">
            <div className="relative flex items-center border border-zinc-800/80 bg-[#050508]/60 rounded-lg px-2.5 focus-within:border-accent/50 transition-all shadow-inner">
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
                  className="text-zinc-500 hover:text-zinc-350 transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 px-4 divide-y divide-zinc-800/30 pb-20">
            {activeTab === "config" && <SetupTab config={config} setConfig={setConfig} searchQuery={searchQuery} />}
            {activeTab === "style" && <AestheticsTab config={config} setConfig={setConfig} searchQuery={searchQuery} />}
            {activeTab === "layout" && <OverlaysTab config={config} setConfig={setConfig} searchQuery={searchQuery} />}
          </div>

          {/* Persistent Footer */}
          <div className="p-4 bg-[#09090c]/98 border-t border-zinc-800/60 flex flex-col gap-1.5 sticky bottom-0 z-10 shadow-lg">
            <Button
              variant="primary"
              icon="download"
              label={isDownloading ? "PROCESSING" : "DOWNLOAD ASSET"}
              onClick={onDownload}
              disabled={isDownloading}
              className="w-full h-11"
            />
            <Button
              variant="secondary"
              icon="restart_alt"
              label="RESET"
              onClick={resetConfig}
              className="w-full h-8 text-[9px] font-mono font-medium !py-1 flex items-center justify-center border-dashed border-zinc-805"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
