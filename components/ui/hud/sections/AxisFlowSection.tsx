import React from "react";
import { AppConfig } from "@/types";
import { ControlGroup, SegmentedControl, TactileSlider } from "../../Controls";
import { Columns } from "lucide-react";

interface AxisFlowSectionProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const AxisFlowSection: React.FC<AxisFlowSectionProps> = ({ config, setConfig }) => {
  return (
    <div className="space-y-8 divide-y divide-white/[0.04]">
      {/* Group A: Labels & Headers */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-sans font-bold text-zinc-300 tracking-wide mb-1 flex items-center gap-2">
            <Columns className="w-3.5 h-3.5 text-zinc-400" />
            Axes & Orientation Labels
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

          <ControlGroup label="Month Label Font Scale" value={`${Math.round((config.monthLabelScale ?? 1.0) * 100)}%`}>
            <TactileSlider
              min={40}
              max={200}
              value={Math.round((config.monthLabelScale ?? 1.0) * 100)}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  monthLabelScale: v / 100,
                }))
              }
              className="!h-10"
            />
          </ControlGroup>

          <ControlGroup label="Axis Space Padding" value={`${config.axisPadding ?? 0}px`}>
            <TactileSlider
              min={0}
              max={60}
              value={config.axisPadding ?? 0}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  axisPadding: v,
                }))
              }
              className="!h-10"
            />
          </ControlGroup>
        </div>
      </div>
    </div>
  );
};
