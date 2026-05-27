import React, { useState } from "react";
import { AppConfig, AppColors } from "../types";
import { Button } from "./ui/Controls";
import { ArchitectureTab } from "./sidebar/ArchitectureTab";
import { StyleTab } from "./sidebar/StyleTab";
import { ContextTab } from "./sidebar/ContextTab";
import { motion } from "motion/react";

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
  const [shareText, setShareText] = useState("SHARE LINK");
  const [downloadLinkText, setDownloadLinkText] = useState("COPY DL LINK");

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
                  className="text-zinc-500 hover:text-zinc-350 transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 px-4 divide-y divide-zinc-800/30 pb-20 [&_>_div]:opacity-0 [&_>_div:nth-child(1)]:animate-[fade-in_400ms_ease-out_0ms_forwards] [&_>_div:nth-child(2)]:animate-[fade-in_400ms_ease-out_100ms_forwards] [&_>_div:nth-child(3)]:animate-[fade-in_400ms_ease-out_200ms_forwards]">
            <ArchitectureTab config={config} setConfig={setConfig} searchQuery={searchQuery} />
            <StyleTab config={config} setConfig={setConfig} searchQuery={searchQuery} />
            <ContextTab config={config} setConfig={setConfig} searchQuery={searchQuery} />
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
                className="h-8 text-[9px] font-mono font-medium !py-1 flex items-center justify-center border-dashed border-zinc-800"
              />
              <Button
                variant="secondary"
                icon="download"
                label={downloadLinkText}
                onClick={handleCopyDownloadLink}
                className="h-8 text-[9px] font-mono font-medium !py-1 flex items-center justify-center border-dashed border-zinc-800"
              />
              <div className="col-span-2">
                <Button
                  variant="secondary"
                  icon="restart_alt"
                  label="RESET"
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
