import React from "react";
import { AppConfig } from "@/types";
import { THEMES } from "../../themes";
import { ThemeSelector, ControlGroup, SegmentedControl, TactileSlider } from "../../Controls";
import { LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AppearanceSectionProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({ config, setConfig }) => {
  return (
    <div className="space-y-8 divide-y divide-white/[0.04]">
      {/* Group A: Theme & Interface */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-sans font-semibold text-zinc-300 tracking-wide mb-1">
            Visual Theme
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Select a custom color scheme for your calendar tiles
          </p>
        </div>
        <div className="bg-zinc-950 border border-white/5 p-4 rounded-xl shadow-inner">
          <ThemeSelector
            themes={THEMES}
            activeColors={config.colors}
            onSelect={(colors) => setConfig((prev) => ({ ...prev, colors }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ControlGroup label="Canvas Background" watchValue={config.transparentBg}>
            <SegmentedControl
              layoutId="bg-style-picker"
              options={[
                { label: "Opaque", value: false },
                { label: "Transparent", value: true },
              ]}
              value={!!config.transparentBg}
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  transparentBg: val as boolean,
                }))
              }
            />
          </ControlGroup>
          <ControlGroup label="Sidebar Gloss Blur" watchValue={config.disableSidebarBlur}>
            <SegmentedControl
              layoutId="blur-picker"
              options={[
                { label: "Glass", value: false },
                { label: "Solid", value: true },
              ]}
              value={!!config.disableSidebarBlur}
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  disableSidebarBlur: val as boolean,
                }))
              }
            />
          </ControlGroup>
        </div>
      </div>

      {/* Group B: Dimensions & Geometry */}
      <div className="space-y-6 pt-6">
        <div>
          <h3 className="text-xs font-sans font-semibold text-zinc-300 tracking-wide mb-1 flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
            Cell Layout & Density
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Adjust sizes, custom padding spacing, and rounded corner styles
          </p>
        </div>

        <div className="space-y-5">
          <ControlGroup label="Cell Scale Size" value={config.dotSize}>
            <TactileSlider
              min={2}
              max={40}
              value={config.dotSize}
              onChange={(v) => setConfig((prev) => ({ ...prev, dotSize: v }))}
              className="!h-10"
            />
          </ControlGroup>
          <ControlGroup label="Grid Gap spacing" value={config.gap}>
            <TactileSlider
              min={0}
              max={20}
              value={config.gap}
              onChange={(v) => setConfig((prev) => ({ ...prev, gap: v }))}
              className="!h-10"
            />
          </ControlGroup>
          <ControlGroup label="Corner Rounding" value={config.radius}>
            <TactileSlider
              min={0}
              max={20}
              value={config.radius}
              onChange={(v) => setConfig((prev) => ({ ...prev, radius: v }))}
              className="!h-10"
            />
          </ControlGroup>
          <ControlGroup label="In-Cell Text Font Size" value={config.fontSize}>
            <TactileSlider
              min={4}
              max={32}
              value={config.fontSize}
              onChange={(v) => setConfig((prev) => ({ ...prev, fontSize: v }))}
              className="!h-10"
            />
          </ControlGroup>
        </div>
      </div>

      {/* Group C: Real-Time Highlights */}
      <div className="space-y-6 pt-6">
        <div>
          <h3 className="text-xs font-sans font-semibold text-zinc-300 tracking-wide mb-1">
            Time-Based Highlights
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Control visual fading and highlight anchors for current calendar dates
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <ControlGroup label="Past Days Style" watchValue={config.dimPastDays}>
              <SegmentedControl
                layoutId="fade-past-picker"
                options={[
                  { label: "Solid Color", value: false },
                  { label: "Dimmed Faded", value: true },
                ]}
                value={!!config.dimPastDays}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    dimPastDays: val as boolean,
                  }))
                }
              />
            </ControlGroup>
            <ControlGroup label="Live Mode Anchor" watchValue={config.anchorTodayToRealTime}>
              <SegmentedControl
                layoutId="sync-time-picker"
                options={[
                  { label: "Static Input", value: false },
                  { label: "Sync Today", value: true },
                ]}
                value={!!config.anchorTodayToRealTime}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    anchorTodayToRealTime: val as boolean,
                  }))
                }
              />
            </ControlGroup>
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            {config.dimPastDays && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.96 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              >
                <ControlGroup
                  label="Past Days Dimming Value"
                  value={config.dimPastDaysStrength}
                >
                  <TactileSlider
                    min={0.05}
                    max={1}
                    value={config.dimPastDaysStrength || 0.4}
                    onChange={(v) =>
                      setConfig((prev) => ({ ...prev, dimPastDaysStrength: v }))
                    }
                    className="!h-10"
                  />
                </ControlGroup>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
