import React from "react";
import { AppConfig } from "@/types";
import { SegmentedControl, Input, TactileSlider, DualMonthRangeSlider, ControlGroup } from "../../Controls";
import { motion, AnimatePresence } from "motion/react";

interface GridTimelineSectionProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const GridTimelineSection: React.FC<GridTimelineSectionProps> = ({ config, setConfig }) => {
  return (
    <div className="space-y-8 select-none flex flex-col">
      {/* Structural mode switch header */}
      <div className="flex justify-between items-center bg-[#0e0e11] border border-white/[0.04] p-4.5 rounded-xl">
        <div className="flex flex-col">
          <span className="text-xs font-sans font-semibold text-zinc-300">
            Structural Timeline Core
          </span>
          <span className="text-[10px] text-zinc-500 font-sans mt-0.5">
            Switch between conventional calendar dates and life cycle views
          </span>
        </div>
        <SegmentedControl
          layoutId="calendar-flow-toggle"
          options={[
            { label: "Standard Calendar", value: false },
            { label: "Life Mori Grid", value: true },
          ]}
          value={!!config.isLifeMode}
          onChange={(val) =>
            setConfig((prev) => ({ ...prev, isLifeMode: val as boolean }))
          }
          className="!h-9 !w-[240px]"
        />
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {config.isLifeMode ? (
          <motion.div
            key="lifemode"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="space-y-6"
          >
            {/* Life mode settings - single logical dividerless list */}
            <div className="grid grid-cols-2 gap-5 items-end">
              <div className="space-y-2.5">
                <span className="text-[11px] font-sans font-semibold text-zinc-400 block tracking-wide">
                  Your Date of Birth (DOB)
                </span>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={config.birthDate || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig((prev) => ({
                        ...prev,
                        birthDate: e.target.value,
                      }))
                    }
                    className="font-mono text-xs h-11 w-full bg-zinc-950 border-white/5 focus:border-accent/40 rounded-xl px-4"
                  />
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, birthDate: "1995-01-01" }))
                    }
                    className="h-11 px-4.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-xl text-zinc-350 hover:text-white transition duration-150 ease-out flex items-center justify-center text-xs font-sans font-semibold select-none whitespace-nowrap cursor-pointer"
                    title="Set DOB to default demo birth date (1995)"
                  >
                    Set Default
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-sans font-semibold text-zinc-400 block tracking-wide">
                  Life Horizon Segment Size
                </span>
                <SegmentedControl
                  layoutId="life-granularity-picker"
                  options={[
                    { value: "week", label: "Weeks Cycle" },
                    { value: "month", label: "Months Cycle" },
                  ]}
                  value={config.lifeGranularity || "week"}
                  onChange={(val) =>
                    setConfig((prev) => ({
                      ...prev,
                      lifeGranularity: val as any,
                    }))
                  }
                  className="!h-11 shadow-inner"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.04]">
              <ControlGroup
                label="Expected Lifespan (Years Horizon)"
                value={config.lifeExpectancy || 80}
              >
                <TactileSlider
                  min={10}
                  max={120}
                  value={config.lifeExpectancy || 80}
                  onChange={(v) =>
                    setConfig((prev) => ({ ...prev, lifeExpectancy: v }))
                  }
                />
              </ControlGroup>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="standardmode"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="space-y-6"
          >
            {/* Standard Mode Layout */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <span className="text-[11px] font-sans font-semibold text-zinc-400 block tracking-wide">
                  Main Layout Style Mode
                </span>
                <SegmentedControl
                  layoutId="spatial-dimension-mode"
                  options={[
                    { value: "grid", label: "2D Grid Block" },
                    { value: "rows", label: "Grid Rows" },
                    { value: "columns", label: "Grid Columns" },
                    { value: "timeline", label: "Timeline Row" },
                  ]}
                  value={config.mode}
                  onChange={(val) =>
                    setConfig((prev) => ({ ...prev, mode: val as any }))
                  }
                  className="!h-11 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-sans font-semibold text-zinc-400 tracking-wide block">
                    Active Calendar Range
                  </span>
                  <motion.span
                    key={`${config.monthOffset}-${config.monthsToShow}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="tabular-nums text-[10px] font-mono text-accent bg-accent/5 px-2.5 py-0.5 rounded border border-accent/15 font-semibold"
                  >
                    Month {config.monthOffset} - {config.monthOffset! + config.monthsToShow}
                  </motion.span>
                </div>
                <div className="h-11 flex items-center bg-zinc-950 px-4 rounded-xl border border-white/5 shadow-inner">
                  <DualMonthRangeSlider
                    min={0}
                    max={60}
                    value={[
                      config.monthOffset || 0,
                      (config.monthOffset || 0) + config.monthsToShow,
                    ]}
                    onChange={([start, end]) =>
                      setConfig((prev) => ({
                        ...prev,
                        monthOffset: start,
                        monthsToShow: Math.max(1, end - start),
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.04] grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-sans font-semibold text-zinc-400 block tracking-wide">
                  Timeline Core Start Date
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={config.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="font-mono text-xs h-11 w-full bg-zinc-950 border-white/5 focus:border-accent/40 rounded-xl px-4"
                  />
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        date: new Date().toISOString().split("T")[0],
                      }))
                    }
                    className="h-11 px-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-xl text-zinc-350 hover:text-white transition duration-150 ease-out flex items-center justify-center text-xs font-sans font-semibold select-none whitespace-nowrap cursor-pointer"
                    title="Set start date to today"
                  >
                    Today
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-sans font-semibold text-zinc-400 block tracking-wide">
                  Cell Temporal Resolution
                </label>
                <SegmentedControl
                  layoutId="temporal-resolution-picker"
                  options={[
                    { value: "day", label: "Days (24h)" },
                    { value: "week", label: "Weeks (7d)" },
                    { value: "month", label: "Months (30d)" },
                  ]}
                  value={config.granularity}
                  onChange={(val) =>
                    setConfig((prev) => ({ ...prev, granularity: val as any }))
                  }
                  className="!h-11 shadow-inner"
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {config.mode === "grid" && (
                <motion.div
                  key="grid-modifiers"
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                  className="pt-6 border-t border-white/[0.04] space-y-5"
                >
                  {config.granularity !== "month" && (
                    <ControlGroup
                      label="Months Plotted Per Row"
                      value={config.monthsPerRow || 3}
                    >
                      <TactileSlider
                        min={1}
                        max={12}
                        value={config.monthsPerRow || 3}
                        onChange={(v) =>
                          setConfig((prev) => ({ ...prev, monthsPerRow: v }))
                        }
                      />
                    </ControlGroup>
                  )}
                  <ControlGroup
                    label="Row Column Cell Limit Size"
                    value={config.itemsPerRow}
                  >
                    <TactileSlider
                      min={1}
                      max={52}
                      value={config.itemsPerRow}
                      onChange={(v) =>
                        setConfig((prev) => ({ ...prev, itemsPerRow: v }))
                      }
                    />
                  </ControlGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
