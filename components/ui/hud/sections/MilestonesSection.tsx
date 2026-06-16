import React, { useState } from "react";
import { AppConfig } from "@/types";
import { Input } from "../../Controls";
import {
  Milestone,
  Trash2,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MilestonesSectionProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  selectedCellId: string | null;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  config,
  setConfig,
  selectedCellId,
  setSelectedCellId,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatSelectedId = (id: string) => {
    if (id.startsWith("life-")) {
      const isWeek = id.includes("-W-");
      const index = parseInt(id.split("-").pop() || "0", 10);
      const age = Math.floor(index / (isWeek ? 52 : 12));
      const unit = (index % (isWeek ? 52 : 12)) + 1;
      return `Age ${age}, ${isWeek ? `Week ${unit}` : `Month ${unit}`}`;
    }
    const parts = id.split("-");
    if (parts[0] === "day") {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const mIdx = parseInt(parts[2], 10);
      return `${months[mIdx] || parts[2]} ${parts[3]}, ${parts[1]}`;
    } else if (parts[0] === "week") {
      return `Week ${parts[2]}, Year ${parts[1]}`;
    } else if (parts[0] === "month") {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${months[parseInt(parts[2], 10)]} ${parts[1]}`;
    }
    return id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 mb-2.5">
        <Milestone className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-sans font-semibold text-zinc-300 tracking-wide">
          Milestone Studio overriding
        </span>
      </div>

      {selectedCellId ? (
        (() => {
          const overrideVal = config.overrides[selectedCellId] || "";
          const activeColorKey = overrideVal.includes("|")
            ? overrideVal.split("|")[0]
            : overrideVal || "significant";
          const activeNoteText = overrideVal.includes("|")
            ? overrideVal.split("|")[1]
            : "";

          const handleNoteChange = (text: string) => {
            setConfig((prev) => {
              const overrides = { ...(prev.overrides || {}) };
              overrides[selectedCellId] = `${activeColorKey}|${text}`;
              return { ...prev, overrides };
            });
          };

          const handleColorChange = (colorKey: string) => {
            setConfig((prev) => {
              const overrides = { ...(prev.overrides || {}) };
              overrides[selectedCellId] = `${colorKey}|${activeNoteText}`;
              return { ...prev, overrides };
            });
          };

          const handleDelete = () => {
            setConfig((prev) => {
              const overrides = { ...(prev.overrides || {}) };
              delete overrides[selectedCellId];
              return { ...prev, overrides };
            });
            setSelectedCellId(null);
          };

          const PRESET_COLORS = [
            {
              label: "Milestone",
              value: "significant",
              hex: config.colors.significant,
            },
            {
              label: "Today",
              value: "today",
              hex: config.colors.today,
            },
            { label: "Red", value: "#ef4444", hex: "#ef4444" },
            { label: "Blue", value: "#3b82f6", hex: "#3b82f6" },
            { label: "Green", value: "#10b981", hex: "#10b981" },
            { label: "Purple", value: "#a855f7", hex: "#a855f7" },
            { label: "Orange", value: "#f97316", hex: "#f97316" },
          ];

          return (
            <div className="space-y-5 bg-[#0e0e11] border border-white/[0.04] p-5 rounded-2xl shadow-xl animate-fade-in flex flex-col gap-1">
              <div className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-sans font-semibold text-zinc-500 uppercase tracking-wider">
                    Selected Tile
                  </span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5">
                    {formatSelectedId(selectedCellId)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedCellId(null)}
                  className="text-[10px] font-sans font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors cursor-pointer"
                >
                  Deselect cell
                </motion.button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-sans font-semibold text-zinc-400 block tracking-wide">
                  Milestone Title Text
                </label>
                <Input
                  type="text"
                  placeholder="Add event name, custom label..."
                  value={activeNoteText}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  className="w-full text-xs h-11 px-4 bg-zinc-950 border-white/5 rounded-xl text-white placeholder-zinc-650"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-sans font-semibold text-zinc-400 block tracking-wide">
                  Color Theme Category
                </label>
                <div className="flex flex-wrap gap-2.5 p-3 bg-zinc-950 border border-white/5 rounded-xl">
                  {PRESET_COLORS.map((c) => {
                    const isSelected = activeColorKey === c.value;
                    return (
                      <motion.button
                        key={c.value}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                        }}
                        onClick={() => handleColorChange(c.value)}
                        className={`w-7 h-7 rounded-full cursor-pointer relative flex items-center justify-center transition-shadow border ${isSelected ? "border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "border-white/10"}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-milestone-dot"
                            className="w-2.5 h-2.5 rounded-full bg-white shadow-md animate-scale-up"
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 20,
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDelete}
                  className="flex-grow flex items-center justify-center gap-2 h-11 rounded-xl border border-red-500/10 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-sans font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Milestone Highlight
                </motion.button>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="border border-dashed border-white/5 hover:border-white/10 transition-colors py-10 px-6 rounded-xl flex flex-col items-center justify-center text-center bg-white/[0.01]">
          <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
            <Calendar className="h-4.5 w-4.5 text-zinc-450" />
          </div>
          <span className="text-xs font-sans font-semibold text-zinc-300">
            Click any grid tile
          </span>
          <p className="text-[11.5px] font-sans text-zinc-550 mt-1 max-w-[220px] leading-relaxed">
            Directly tap any day, week, month, or life block on the canvas to add a custom milestone highlight or personal label!
          </p>
        </div>
      )}

      {/* HISTORIC OVERRIDES LIST CHUNKS */}
      {Object.keys(config.overrides || {}).length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/[0.04]">
          <span className="text-[11px] font-sans font-semibold text-zinc-500 tracking-wide block">
            Active Milestones list ({Object.keys(config.overrides).length})
          </span>
          <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 divide-y divide-white/[0.04] scrollbar-thin">
            {Object.entries(config.overrides).map(([id, val]) => {
              const colorKey = val.includes("|")
                ? val.split("|")[0]
                : val;
              const textLabel = val.includes("|")
                ? val.split("|")[1]
                : "";
              const isSelected = selectedCellId === id;

              const getHexColor = (key: string) => {
                const fallbacks: Record<string, string> = {
                  significant: config.colors.significant,
                  today: config.colors.today,
                  "#ef4444": "#ef4444",
                  "#3b82f6": "#3b82f6",
                  "#10b981": "#10b981",
                  "#a855f7": "#a855f7",
                  "#f97316": "#f97316",
                };
                return fallbacks[key] || config.colors.significant;
              };

              const formatIdClean = (mId: string) => {
                if (mId.startsWith("life-")) {
                  const index = mId.split("-").pop() || "0";
                  return `Life block ${index}`;
                }
                const parts = mId.split("-");
                if (parts[0] === "day") {
                  return `${parts[1]}-${(parseInt(parts[2], 10) + 1).toString().padStart(2, "0")}-${parts[3].padStart(2, "0")}`;
                } else if (parts[0] === "week") {
                  return `Week ${parts[2]}, '` + parts[1].slice(2);
                } else if (parts[0] === "month") {
                  const mName = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                  ][parseInt(parts[2], 10)];
                  return `${mName} ${parts[1]}`;
                }
                return mId;
              };

              return (
                <div
                  key={id}
                  onClick={() => setSelectedCellId(id)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-accent/10" : "hover:bg-white/[0.02]"}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: getHexColor(colorKey),
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-sans font-semibold text-zinc-200 truncate">
                        {textLabel || "Highlighted Marker"}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-550">
                        {formatIdClean(id)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-3 w-3 text-zinc-650 shrink-0 transition-transform ${isSelected ? "rotate-90 text-accent" : ""}`}
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            {!showClearConfirm ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowClearConfirm(true)}
                className="w-full text-center text-xs font-sans font-semibold text-zinc-400 hover:text-red-400 py-3 border border-dashed border-white/5 hover:border-red-500/20 rounded-xl bg-black/20 hover:bg-red-500/5 transition-colors cursor-pointer"
              >
                Clear All Milestones
              </motion.button>
            ) : (
              <div className="flex gap-2 animate-fade-in">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, overrides: {} }));
                    setSelectedCellId(null);
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 text-center text-xs font-sans font-bold text-white py-3 rounded-xl bg-red-650 hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Yes, Clear All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 text-center text-xs font-sans font-semibold text-zinc-400 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
