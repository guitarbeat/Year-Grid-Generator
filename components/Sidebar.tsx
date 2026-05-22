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
        fixed md:relative inset-y-0 left-0 w-80 flex-shrink-0 bg-surface border-r border-border flex flex-col h-full z-40 transition-transform duration-300 shadow-2xl overflow-hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
          <div className="flex items-center gap-2">
            <h1 
              id="sidebar-panel-header" 
              data-toc 
              data-toc-depth="2" 
              data-toc-title={`WORKSPACE: ${activeTab.toUpperCase()}`}
              className="text-2xl font-black tracking-[0.25em] uppercase text-white flex items-center gap-3 drop-shadow-md"
            >
              <span className="material-symbols-outlined text-[#ea580c] !text-[32px]">
                hourglass_empty
              </span>
              MEMENTO
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Close Button Mobile */}
            <button
              onClick={onToggle}
              aria-label="Close settings menu"
              title="Close settings menu"
              className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white"
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        {/* Controls - UNIFIED */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Premium Tab Navigation Slider */}
          <div className="p-2 border-b border-border/40 bg-[#08080a] sticky top-0 z-20 flex gap-1">
            {(["config", "style", "layout"] as const).map((tab) => {
              const label = tab === "config" ? "Setup" : tab === "style" ? "Aesthetics" : "Overlays";
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  id={`tab-btn-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 py-2 text-[9px] font-mono tracking-widest uppercase transition-colors z-10 font-bold ${
                    isSelected ? "text-[#ea580c]" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="sidebarActiveTabIndicator"
                      className="absolute inset-0 bg-[#ea580c]/10 border border-[#ea580c]/25 rounded-md -z-10 shadow-[0_2px_10px_-4px_rgba(234,88,12,0.15)]"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick Find Options Filter */}
          <div className="px-4 py-2 bg-[#0a0a0c] border-b border-border/40">
            <div className="relative flex items-center border border-border bg-[#050507] rounded-md px-2 focus-within:border-accent/50 transition-all">
              <span className="material-symbols-outlined text-[16px] text-gray-500 shrink-0 select-none">search</span>
              <input
                type="text"
                placeholder="FIND SETTING..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-2 py-1.5 text-[9px] font-mono uppercase tracking-wider text-white placeholder-gray-600 outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  title="Clear search"
                  className="text-gray-500 hover:text-gray-300 transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 px-4 divide-y divide-border/40 pb-20">
            {activeTab === "config" && <SetupTab config={config} setConfig={setConfig} searchQuery={searchQuery} />}
            {activeTab === "style" && <AestheticsTab config={config} setConfig={setConfig} searchQuery={searchQuery} />}
            {activeTab === "layout" && <OverlaysTab config={config} setConfig={setConfig} searchQuery={searchQuery} />}
          </div>

          {/* Persistent Footer */}
          <div className="p-4 bg-[#0a0a0a] border-t border-border flex flex-col gap-2 sticky bottom-0">
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
              className="w-full h-8 text-[10px]"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
