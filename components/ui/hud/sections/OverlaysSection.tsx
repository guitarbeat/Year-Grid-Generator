import React from "react";
import { AppConfig } from "@/types";
import { ControlGroup, SegmentedControl, Input } from "../../Controls";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OverlaysSectionProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const OverlaysSection: React.FC<OverlaysSectionProps> = ({ config, setConfig }) => {
  return (
    <div className="space-y-8 divide-y divide-white/[0.04]">
      {/* Group A: Internal Cell Markings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-sans font-bold text-zinc-300 tracking-wide mb-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            Overlay Inscriptions & Titles
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Overlay calendar count indicators or ghost text watermarks on active canvas
          </p>
        </div>

        <div className="space-y-5">
          <ControlGroup label="Tile Inscription Label" watchValue={config.showDayNumbers ? "days" : config.showWeekNumbers ? "weeks" : "none"}>
            <SegmentedControl
              layoutId="internal-cell-inscription-picker"
              options={[
                { value: "none", label: "No Inscription" },
                { value: "days", label: "Day Index" },
                { value: "weeks", label: "Week Index" },
              ]}
              value={
                config.showDayNumbers
                  ? "days"
                  : config.showWeekNumbers
                    ? "weeks"
                    : "none"
              }
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  showDayNumbers: val === "days",
                  showWeekNumbers: val === "weeks",
                }))
              }
            />
          </ControlGroup>

          <AnimatePresence mode="popLayout" initial={false}>
            {(config.showDayNumbers || config.showWeekNumbers) && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.96 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              >
                <ControlGroup label="Aspect Grid Boundary Form" watchValue={config.keepCellShapeWithNumbers}>
                  <SegmentedControl
                    layoutId="shape-force-picker"
                    options={[
                      { label: "Fill Ratio (Square)", value: false },
                      { label: "Keep Standard Circle", value: true },
                    ]}
                    value={config.keepCellShapeWithNumbers}
                    onChange={(val) =>
                      setConfig((prev) => ({
                        ...prev,
                        keepCellShapeWithNumbers: val as boolean,
                      }))
                    }
                  />
                </ControlGroup>
              </motion.div>
            )}
          </AnimatePresence>

          <ControlGroup label="Ghost Year Watermark Style" watchValue={config.showYearLabel}>
            <SegmentedControl
              layoutId="year-watermark-picker"
              options={[
                { label: "Hide Ghost Year", value: false },
                { label: "Display Year Overlay", value: true },
              ]}
              value={!!config.showYearLabel}
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  showYearLabel: val as boolean,
                }))
              }
            />
          </ControlGroup>
        </div>
      </div>

      {/* Group B: Top Headers & Statistics Footers */}
      <div className="space-y-6 pt-6">
        <div>
          <h3 className="text-xs font-sans font-semibold text-zinc-300 tracking-wide mb-1">
            Canvas Decorators & Headers
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Configure metadata headers, Custom Title banner blocks and footer charts
          </p>
        </div>

        <div className="space-y-5">
          <ControlGroup label="Top Header Banner Plot" watchValue={config.showHeaderPlugin}>
            <SegmentedControl
              layoutId="header-vis-picker"
              options={[
                { label: "Hide Banner", value: false },
                { label: "Display Title Banner", value: true },
              ]}
              value={!!config.showHeaderPlugin}
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  showHeaderPlugin: val as boolean,
                }))
              }
            />
          </ControlGroup>

          <AnimatePresence mode="popLayout" initial={false}>
            {config.showHeaderPlugin && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.96 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              >
                <ControlGroup label="Custom Interactive Banner Text" watchValue={config.customTitle}>
                  <Input
                    type="text"
                    placeholder="e.g., Memento Mori, Year review, Habits..."
                    value={config.customTitle || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        customTitle: e.target.value,
                      }))
                    }
                    className="w-full h-11 bg-zinc-950 border-white/5 focus:border-accent/40 rounded-xl px-4 text-xs font-sans font-medium text-white placeholder-zinc-650 transition-colors"
                  />
                </ControlGroup>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 border-t border-white/[0.04]">
            <ControlGroup label="Live Analytics Footer" watchValue={config.showStats}>
              <SegmentedControl
                layoutId="stats-bar-picker"
                options={[
                  { label: "Hide Analytics", value: false },
                  { label: "Display Live Stats Footer", value: true },
                ]}
                value={config.showStats}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, showStats: val as boolean }))
                }
              />
            </ControlGroup>
          </div>
        </div>
      </div>
    </div>
  );
};
