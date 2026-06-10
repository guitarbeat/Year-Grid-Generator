import React, { useState, useEffect } from "react";
import {
  Button,
  ControlGroup,
  Input,
  Toggle,
  ThemeSelector,
  SegmentedControl,
  TactileSlider,
  DualMonthRangeSlider,
  Combobox,
} from "../Controls";
import {
  Sparkles,
  LayoutGrid,
  Palette,
  Compass,
  Columns,
  CheckSquare,
  Calendar,
  Trash2,
  Milestone,
  ChevronRight,
  User,
} from "lucide-react";
import { THEMES } from "../themes";
import { AppConfig } from "@/types";
import { HeaderControls } from "./HeaderControls";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. STYLE & APPEARANCE SECTION
   ========================================================================== */
const AppearanceSection: React.FC<{
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}> = ({ config, setConfig }) => {
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

/* ==========================================================================
   2. AXIS & FLOW CONFIGURATION SECTION
   ========================================================================== */
const AxisFlowSection: React.FC<{
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}> = ({ config, setConfig }) => {
  return (
    <div className="space-y-8 divide-y divide-white/[0.04]">
      {/* Group A: Labels & Headers */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-sans font-semibold text-zinc-300 tracking-wide mb-1 flex items-center gap-2">
            <Columns className="w-3.5 h-3.5 text-zinc-400" />
            Grid Label Headers List
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Enable or configure visible text anchors across your layout dimensions
          </p>
        </div>

        <div className="space-y-5">
          <ControlGroup label="H-Axis Month Labels" watchValue={!config.showMonthAxis ? "none" : config.showMonthNumbers ? "numbers" : "names"}>
            <SegmentedControl
              layoutId="month-vector-picker"
              options={[
                { label: "Hide Labels", value: "none" },
                { label: "Display Names", value: "names" },
                { label: "Display Number", value: "numbers" },
              ]}
              value={
                !config.showMonthAxis
                  ? "none"
                  : config.showMonthNumbers
                    ? "numbers"
                    : "names"
              }
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  showMonthAxis: val !== "none",
                  showMonthNumbers: val === "numbers",
                }))
              }
            />
          </ControlGroup>

          <div className="grid grid-cols-2 gap-4">
            <ControlGroup label="Weekday Column Header" watchValue={config.showWeekdayAxis}>
              <SegmentedControl
                layoutId="weekday-axis-picker"
                options={[
                  { label: "Hide", value: false },
                  { label: "Display Rows", value: true },
                ]}
                value={config.showWeekdayAxis}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    showWeekdayAxis: val as boolean,
                  }))
                }
              />
            </ControlGroup>
            <ControlGroup label="V-Axis Sidebar Numbers" watchValue={!!config.showSideDayAxis}>
              <SegmentedControl
                layoutId="side-axis-picker"
                options={[
                  { label: "Hide", value: false },
                  { label: "Display Cols", value: true },
                ]}
                value={!!config.showSideDayAxis}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    showSideDayAxis: val as boolean,
                  }))
                }
              />
            </ControlGroup>
          </div>
        </div>
      </div>

      {/* Group B: Week Align & Label Spin */}
      <div className="space-y-6 pt-6">
        <div>
          <h3 className="text-xs font-sans font-semibold text-zinc-300 tracking-wide mb-1">
            Weekly Calendars & Rotations
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans">
            Configure calendar start limits, weekend alerts, and text axis rotation angles
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <ControlGroup label="Calendar Week Start" watchValue={config.isMondayFirst}>
              <SegmentedControl
                layoutId="monday-picker"
                options={[
                  { label: "Sunday First", value: false },
                  { label: "Monday First", value: true },
                ]}
                value={config.isMondayFirst}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    isMondayFirst: val as boolean,
                  }))
                }
              />
            </ControlGroup>
            <ControlGroup label="Weekend Highlight alert" watchValue={config.highlightWeekends}>
              <SegmentedControl
                layoutId="weekend-picker"
                options={[
                  { label: "Disable Accent", value: false },
                  { label: "Highlight Dim", value: true },
                ]}
                value={config.highlightWeekends}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    highlightWeekends: val as boolean,
                  }))
                }
              />
            </ControlGroup>
          </div>

          <ControlGroup label="H-Axis Title Text Rotation" watchValue={config.labelRotation}>
            <SegmentedControl
              layoutId="label-rotation-picker"
              options={[
                { value: "0", label: "0° (Flat)" },
                { value: "45", label: "45°" },
                { value: "90", label: "90°" },
                { value: "-45", label: "-45°" },
                { value: "-90", label: "-90°" },
              ]}
              value={String(config.labelRotation || 0)}
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  labelRotation: Number(val) as any,
                }))
              }
            />
          </ControlGroup>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. OVERLAYS & CANVAS LAYERS SECTION
   ========================================================================== */
const OverlaysSection: React.FC<{
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}> = ({ config, setConfig }) => {
  return (
    <div className="space-y-8 divide-y divide-white/[0.04]">
      {/* Group A: Internal Cell Markings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-sans font-semibold text-zinc-300 tracking-wide mb-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            In-Cell Inscriptions & Background
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

/* ==========================================================================
   4. GRID & TIMELINE STRUCTURE SECTION
   ========================================================================== */
const GridTimelineSection: React.FC<{
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}> = ({ config, setConfig }) => {
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

/* ==========================================================================
   5. MAIN EXPORT AND RENDER CONTAINER
   ========================================================================== */
interface AdjustPanelProps {
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

type TabType = "grid" | "style" | "axis" | "layers" | "milestones";

export const AdjustPanel: React.FC<AdjustPanelProps> = ({
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
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("grid");

  // Keep track of milestone cell highlights: snap user straight to panel overview
  useEffect(() => {
    if (selectedCellId) {
      setActiveTab("milestones");
    }
  }, [selectedCellId]);

  if (!config || !setConfig) return null;

  const TABS: { value: TabType; label: string }[] = [
    { value: "grid", label: "Grid" },
    { value: "style", label: "Style" },
    { value: "axis", label: "Axis" },
    { value: "layers", label: "Layers" },
    { value: "milestones", label: "Milestones" },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col h-full bg-[#08080a] select-none">
      <div className="space-y-1 pb-16 flex-1 flex flex-col">
        {/* TOP COMPACT ACTIONS SYSTEM */}
        <HeaderControls
          config={config}
          setConfig={setConfig}
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

        {/* LUXURIOUS MINIMAL TAB BAR */}
        <div className="px-6 pt-5 sticky top-0 bg-[#08080a]/95 backdrop-blur-md z-30 pb-4 border-b border-white/[0.04]">
          <div className="flex bg-zinc-950 border border-white/5 p-1 rounded-xl h-[40px] relative overflow-hidden select-none w-full shadow-inner">
            {TABS.map((t) => {
              const isActive = t.value === activeTab;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActiveTab(t.value)}
                  className={`flex-1 relative z-10 flex items-center justify-center font-sans text-xs font-semibold transition-all duration-200 cursor-pointer outline-none rounded-lg active:scale-[0.96] ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-350"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="hud-main-active-tab-pill"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="absolute inset-0 bg-white/[0.04] border border-white/5 rounded-lg shadow-sm"
                    />
                  )}
                  <span className="relative z-20">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CURRENT TAB VIEW PORT */}
        <div className="p-6 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {/* Tab 1: Layout, Presets & Timelines */}
            {activeTab === "grid" && (
              <motion.div
                key="tab-grid"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              >
                <GridTimelineSection config={config} setConfig={setConfig} />
              </motion.div>
            )}

            {/* Tab 2: Appearance Colors and Shapes */}
            {activeTab === "style" && (
              <motion.div
                key="tab-style"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              >
                <AppearanceSection config={config} setConfig={setConfig} />
              </motion.div>
            )}

            {/* Tab 3: Grid Axis Vectors & Spinnings */}
            {activeTab === "axis" && (
              <motion.div
                key="tab-axis"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              >
                <AxisFlowSection config={config} setConfig={setConfig} />
              </motion.div>
            )}

            {/* Tab 4: Ghost Watermarks & Layers */}
            {activeTab === "layers" && (
              <motion.div
                key="tab-layers"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              >
                <OverlaysSection config={config} setConfig={setConfig} />
              </motion.div>
            )}

            {/* Tab 5: Milestone overrides and notes */}
            {activeTab === "milestones" && (
              <motion.div
                key="tab-milestones"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="space-y-6"
              >
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
                        overrides[selectedCellId] =
                          `${colorKey}|${activeNoteText}`;
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
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to clear all custom milestones? This will roll coordinates back to template defaults.",
                            )
                          ) {
                            setConfig((prev) => ({ ...prev, overrides: {} }));
                            setSelectedCellId(null);
                          }
                        }}
                        className="w-full text-center text-xs font-sans font-semibold text-zinc-400 hover:text-red-400 py-3 border border-dashed border-white/5 hover:border-red-500/20 rounded-xl bg-black/20 hover:bg-red-500/5 transition-colors cursor-pointer"
                      >
                        Clear All Milestones
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
