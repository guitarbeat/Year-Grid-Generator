import React from 'react';
import { AppConfig } from '../../types';
import { SidebarSection, Button, ControlGroup, Input, SegmentedControl, Select, Toggle } from '../ui/Controls';

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  searchQuery?: string;
}

export const SetupTab: React.FC<Props> = ({ config, setConfig, searchQuery = "" }) => {
  const updateConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const setDateToToday = () => {
    updateConfig("date", new Date().toLocaleDateString("en-CA"));
  };

  const matches = (label: string, keywords: string[] = []) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      label.toLowerCase().includes(q) ||
      keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  };

  const hasPresetsMatch = matches("Quick Presets", ["presets", "full year", "this month", "12-week", "timeline", "shortcut", "quick"]);
  const hasRangeMatch = matches("Time Range", ["range", "start date", "timeline length", "months", "year", "today"]);
  const hasMementoMatch = matches("Memento Mori & Life View", ["memento", "mori", "life view", "birth date", "expectancy", "quotes", "stoicism", "mantra", "stoic"]);
  const hasStructureMatch = matches("Structure & Detail", ["structure", "detail", "cell", "represent", "granularity", "day", "week", "month", "visual style", "layout", "wrapping", "limits", "columns", "organize", "grouping", "season", "labels", "rules", "monday"]);

  return (
    <div className="animate-fade-in space-y-2">
      {hasPresetsMatch && (
        <SidebarSection 
          key={searchQuery ? "open-presets" : "closed-presets"}
          label="Quick Presets" 
          defaultOpen={true} 
          className="pt-4"
        >
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            label="Full Year"
            icon="calendar_month"
            onClick={() => {
              const y = new Date().getFullYear();
              updateConfig("date", `${y}-01-01`);
              setConfig((prev) => ({ ...prev, monthsToShow: 12, startFromJan: true, itemsPerRow: 13, granularity: "day", mode: "grid", monthOffset: 0 }));
            }}
            className="justify-start !py-2 text-[10px]"
          />
          <Button
            variant="secondary"
            label="This Month"
            icon="today"
            onClick={() => {
              const today = new Date();
              updateConfig("date", today.toISOString().split("T")[0]);
              setConfig((prev) => ({ ...prev, monthsToShow: 1, startFromJan: false, monthsPerRow: 1, granularity: "day", mode: "grid", monthOffset: 0 }));
            }}
            className="justify-start !py-2 text-[10px]"
          />
          <Button
            variant="secondary"
            label="12-Week"
            icon="view_week"
            onClick={() => {
              const today = new Date();
              updateConfig("date", today.toISOString().split("T")[0]);
              setConfig((prev) => ({ ...prev, monthsToShow: 3, startFromJan: false, itemsPerRow: 13, granularity: "week", mode: "grid", showWeekNumbers: true, monthOffset: 0 }));
            }}
            className="justify-start !py-2 text-[10px]"
          />
          <Button
            variant="secondary"
            label="Timeline"
            icon="linear_scale"
            onClick={() => {
              const y = new Date().getFullYear();
              updateConfig("date", `${y}-01-01`);
              setConfig((prev) => ({ ...prev, monthsToShow: 6, startFromJan: false, granularity: "day", mode: "timeline", showDayNumbers: false, monthOffset: 0 }));
            }}
            className="justify-start !py-2 text-[10px]"
          />
        </div>
      </SidebarSection>
      )}

      {hasRangeMatch && (
        <SidebarSection 
          key={searchQuery ? "open-range" : "closed-range"}
          label="Time Range" 
          defaultOpen={true}
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
            <ControlGroup label="Start Date">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-1 mb-1">
                  <Button
                    variant="secondary"
                    label="Start of Year"
                    onClick={() => {
                      const y = new Date(config.date).getFullYear();
                      updateConfig("date", `${y}-01-01`);
                      setConfig(prev => ({...prev, startFromJan: true}))
                    }}
                    className="!text-[10px] !py-1"
                  />
                  <Button
                    variant="secondary"
                    label="Start Today"
                    onClick={() => {
                      setDateToToday();
                      setConfig(prev => ({...prev, startFromJan: false}))
                    }}
                    className="!text-[10px] !py-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={config.date}
                    onChange={(e) => updateConfig("date", e.target.value)}
                    className="font-mono text-[11px] h-9 flex-1"
                  />
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <Toggle
                    id="chk-anchor-today"
                    label="Anchor Past/Present to real-world Today"
                    checked={config.anchorTodayToRealTime}
                    onChange={(val) => updateConfig("anchorTodayToRealTime", val)}
                  />
                </div>
              </div>
            </ControlGroup>

            <ControlGroup label="Timeline Length">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-5 gap-1">
                  <Button variant="secondary" label="1 Mo" onClick={() => updateConfig("monthsToShow", 1)} className="!text-[10px] !px-1" />
                  <Button variant="secondary" label="1 Qtr" onClick={() => updateConfig("monthsToShow", 3)} className="!text-[10px] !px-1" />
                  <Button variant="secondary" label="6 Mo" onClick={() => updateConfig("monthsToShow", 6)} className="!text-[10px] !px-1" />
                  <Button variant="secondary" label="1 Yr" onClick={() => updateConfig("monthsToShow", 12)} className="!text-[10px] !px-1" />
                  <Button variant="secondary" label="2 Yr" onClick={() => updateConfig("monthsToShow", 24)} className="!text-[10px] !px-1" />
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="range" min="1" max="60"
                    value={config.monthsToShow}
                    onChange={(e) => updateConfig("monthsToShow", parseInt(e.target.value) || 1)}
                    className="flex-1"
                  />
                  <span className="text-[12px] font-mono text-accent w-10 text-right">{config.monthsToShow} mo</span>
                </div>
              </div>
            </ControlGroup>
          </div>
        </div>
      </SidebarSection>
      )}

      {hasMementoMatch && (
        <SidebarSection 
          key={searchQuery ? "open-memento" : "closed-memento"}
          label="Memento Mori & Life View" 
          defaultOpen={config.isLifeMode}
        >
          <div className="space-y-4">
            <Toggle 
              id="chk-lifemode" 
              label="Enable Life View Mode" 
              checked={config.isLifeMode || false} 
              onChange={(val) => updateConfig("isLifeMode", val)} 
            />
            
            {config.isLifeMode && (
              <div className="space-y-4 p-3 bg-[#111112] rounded-lg border border-white/5 animate-slide-down">
                <ControlGroup label="Your Birth Date">
                  <Input 
                    type="date" 
                    value={config.birthDate || "2000-01-01"} 
                    onChange={(e) => updateConfig("birthDate", e.target.value)}
                    className="font-mono text-[11px] h-9"
                  />
                  <p className="text-[9px] text-gray-500 mt-1">Computes weeks/months lived since birth.</p>
                </ControlGroup>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                    <span>Life Expectancy</span>
                    <span className="text-accent text-[12px] font-mono">{config.lifeExpectancy || 80} Years</span>
                  </label>
                  <Input 
                    type="range" 
                    min="40" 
                    max="120" 
                    step="1" 
                    value={config.lifeExpectancy || 80} 
                    onChange={(e) => updateConfig("lifeExpectancy", parseInt(e.target.value, 10))} 
                    className="w-full"
                  />
                  <p className="text-[9px] text-gray-500 leading-tight">
                    Sets total years in the memento mori grid.
                  </p>
                </div>

                <ControlGroup label="Matrix Granularity">
                  <SegmentedControl
                    options={[
                      { id: "week", label: "Weeks (52 cols)", icon: "view_week" },
                      { id: "month", label: "Months (12 cols)", icon: "calendar_view_month" },
                    ]}
                    activeId={config.lifeGranularity || "week"}
                    onChange={(id) => updateConfig("lifeGranularity", id as any)}
                  />
                </ControlGroup>

                <Toggle 
                  id="chk-lstats" 
                  label="Show Visual Progress Stats" 
                  checked={config.showLifeStats ?? true} 
                  onChange={(val) => updateConfig("showLifeStats", val)} 
                />
              </div>
            )}

            <div className="bg-[#111112] p-3 rounded-lg border border-white/5 space-y-4 text-[11px]">
              <Toggle 
                id="chk-headerplugin" 
                label='Show elegant "MEMENTO MORI" Title' 
                checked={config.showHeaderPlugin || false} 
                onChange={(val) => updateConfig("showHeaderPlugin", val)} 
              />

              <div className="border-t border-white/5 pt-3 space-y-3">
                <Toggle 
                  id="chk-quotes" 
                  label="Show Philosophical Wisdom Quotes" 
                  checked={config.showQiQuotes ?? true} 
                  onChange={(val) => updateConfig("showQiQuotes", val)} 
                />

                {(config.showQiQuotes ?? true) && (
                  <div className="space-y-3 animate-slide-down pl-2 border-l border-[#ea580c]/30">
                    <ControlGroup label="Wisdom Theme Category">
                      <Select 
                        value={config.quotesCategory || "all"} 
                        onChange={(e) => {
                          const cat = e.target.value as any;
                          updateConfig("quotesCategory", cat);
                        }}
                        className="w-full text-[10px]"
                      >
                        <option value="all">All Themes</option>
                        <option value="stoic">Stoicism (Aurelius, Seneca, Epictetus)</option>
                        <option value="intention">Mindfulness & Intention</option>
                        <option value="time">The Fleetingness of Time</option>
                      </Select>
                    </ControlGroup>

                    <ControlGroup label="Custom Mantra Quote (Override)">
                      <textarea
                        value={config.customQuoteText || ""}
                        onChange={(e) => updateConfig("customQuoteText", e.target.value)}
                        placeholder="Type personal reminder or mantra... (overrides built-in quotes)"
                        className="w-full bg-[#08080a] border border-[#222] rounded p-2 text-[10px] font-sans h-16 outline-none focus:border-accent text-white"
                      />
                    </ControlGroup>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarSection>
      )}

      {hasStructureMatch && (
        <SidebarSection 
          key={searchQuery ? "open-structure" : "closed-structure"}
          label="Structure & Detail" 
          defaultOpen={true}
        >
          <div className="space-y-6">
          <div>
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-2 block">
              Each Cell Represents A...
            </label>
            <SegmentedControl
              options={[
                { id: "day", label: "Day", icon: "view_agenda" },
                { id: "week", label: "Week", icon: "view_week" },
                { id: "month", label: "Month", icon: "calendar_view_month" },
              ]}
              activeId={config.granularity}
              onChange={(id) => {
                const itemsPerRow = id === "day" ? 31 : id === "week" ? 12 : 4;
                setConfig((prev) => ({ ...prev, granularity: id as any, itemsPerRow: itemsPerRow }));
              }}
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-2 block">
              Visual Layout
            </label>
            <SegmentedControl
              cols={3}
              options={[
                { id: "grid", label: config.granularity === "day" ? "Calendar" : "Wrapped", icon: "grid_view" },
                { id: "rows", label: "Horiz Strip", icon: "view_headline" },
                { id: "columns", label: "Vert Strip", icon: "view_column" },
              ]}
              activeId={config.mode}
              onChange={(id) => updateConfig("mode", id as any)}
            />

            {config.monthsToShow === 1 && (
              <p className="mt-2 text-[10px] text-[#888] font-mono leading-tight">
                {config.mode === "grid"
                  ? config.granularity === "day" ? "Draws a standard calendar grid (7 columns)." : "Tiles timeline blocks together into a dense grid."
                  : config.mode === "rows" ? "Draws all blocks sequentially in a single long horizontal strip." : "Draws all blocks sequentially stacked in a tall vertical strip."}
              </p>
            )}
          </div>

          <div className="bg-[#141414] p-3 rounded-lg border border-border/40 pb-4 space-y-4">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-1 block border-b border-white/5 pb-1 flex justify-between">
              <span>Layout Wrapping & Alignment</span>
              <span className="text-[8px] text-accent/80 font-normal">ADAPTIVE</span>
            </label>

            {/* Adaptive Max Months Per Row Control */}
            {(() => {
              const isMonthsPerRowApplicable = 
                config.mode !== "timeline" && 
                (config.mode === "columns" || 
                 (config.mode === "grid" && (
                   config.granularity === "day" || 
                   (config.granularity === "week" && config.showMonthAxis) ||
                   config.groupBy === "season"
                 )));

              let monthsPerRowLabel = "Max Months Per Row";
              if (config.mode === "columns") {
                monthsPerRowLabel = "Max Strips Side-by-Side";
              } else if (config.groupBy === "season") {
                monthsPerRowLabel = "Max Months Per Row (Within Seasons)";
              }

              let monthsPerRowHelpText = "";
              if (!isMonthsPerRowApplicable) {
                if (config.mode === "timeline") {
                  monthsPerRowHelpText = "Disabled: Timeline mode is a strictly single-column chronological list.";
                } else if (config.mode === "rows") {
                  monthsPerRowHelpText = "Disabled: Horizontal strip mode places each month/group on its own vertical row row.";
                } else {
                  monthsPerRowHelpText = "Disabled: Not applicable under the current flat structure.";
                }
              } else {
                if (config.mode === "columns") {
                  monthsPerRowHelpText = "Specifies how many vertical month strips are aligned horizontally before wrapping.";
                } else if (config.groupBy === "season") {
                  monthsPerRowHelpText = config.seasonsSideBySide 
                    ? "Controls month grid columns inside each season card (seasons are aligned side-by-side)."
                    : "Controls month grid columns inside each vertically stacked season card.";
                } else if (config.granularity === "day") {
                  monthsPerRowHelpText = "Controls how many month calendar blocks are aligned horizontally across the screen.";
                } else if (config.granularity === "week" && config.showMonthAxis) {
                  monthsPerRowHelpText = "Controls how many month-grouped week grids wrap side-by-side.";
                } else {
                  monthsPerRowHelpText = "Adjusts the horizontal wrapping count of month blocks.";
                }
              }

              return (
                <div className={`space-y-1 transition-opacity duration-200 ${isMonthsPerRowApplicable ? "" : "opacity-30"}`}>
                  <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>{monthsPerRowLabel}</span>
                      {!isMonthsPerRowApplicable && (
                        <span className="text-[8px] bg-red-500/10 text-red-400/80 px-1 py-0.2 rounded uppercase tracking-wider font-normal">Inactive</span>
                      )}
                    </span>
                    <span className="text-accent text-[12px] font-mono">{config.monthsPerRow}</span>
                  </label>
                  <Input 
                    type="range" 
                    min="1" 
                    max="12" 
                    step="1" 
                    value={config.monthsPerRow} 
                    onChange={(e) => updateConfig("monthsPerRow", parseInt(e.target.value, 10))} 
                    className="w-full"
                    disabled={!isMonthsPerRowApplicable}
                  />
                  <p className="text-[9px] text-gray-500 leading-tight">
                    {monthsPerRowHelpText}
                  </p>
                </div>
              );
            })()}

            {/* Max Blocks Per Row Control */}
            {(() => {
              const blocksPerRowLabel = config.granularity === "week" ? "Max Weeks Per Row" : "Max Blocks / Items Per Row";
              const maxLimit = config.granularity === "week" ? 52 : 24;
              const blocksPerRowHelpText = config.granularity === "week" 
                ? "Determines how many flat consecutive weeks wrap to the next line in Grid view modes."
                : "Determines how many consecutive items or month blocks wrap to the next line.";

              return (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                    <span>{blocksPerRowLabel}</span>
                    <span className="text-accent text-[12px] font-mono">{config.itemsPerRow}</span>
                  </label>
                  <Input 
                    type="range" 
                    min="1" 
                    max={maxLimit} 
                    step="1" 
                    value={config.itemsPerRow} 
                    onChange={(e) => updateConfig("itemsPerRow", parseInt(e.target.value, 10))} 
                    className="w-full"
                  />
                  <p className="text-[9px] text-gray-500 leading-tight">
                    {blocksPerRowHelpText}
                  </p>
                </div>
              );
            })()}

            {/* Vertical Block Alignment Control */}
            {(() => {
              const isAlignmentApplicable = config.mode === "grid" || config.mode === "columns";

              let alignmentHelpText = "";
              if (!isAlignmentApplicable) {
                if (config.mode === "timeline") {
                  alignmentHelpText = "Disabled: Timeline mode is a strictly linear chronological list.";
                } else if (config.mode === "rows") {
                  alignmentHelpText = "Disabled: Horizontal strip mode stacks all blocks sequentially on single continuous rows.";
                } else {
                  alignmentHelpText = "Disabled: Only applicable under 'Calendar / Wrapped' or 'Vert Strip' view modes.";
                }
              } else {
                if (config.groupBy === "season") {
                  const subtext = config.seasonsSideBySide ? "side-by-side" : "vertically stacked";
                  alignmentHelpText = config.blockAlignment === "center"
                    ? `Centers seasonal cards and their inner month grids vertically (seasons are ${subtext}).`
                    : `Aligns top edges of season cards and their inner month grids horizontally (seasons are ${subtext}).`;
                } else if (config.mode === "columns") {
                  alignmentHelpText = config.blockAlignment === "center"
                    ? "Centers vertical month/week strips relative to each other horizontally."
                    : "Aligns top edges of vertical month/week strips horizontally.";
                } else if (config.granularity === "day") {
                  alignmentHelpText = config.blockAlignment === "center"
                    ? "Centers and vertically aligns monthly calendar blocks relative to each other inside row segments."
                    : "Aligns top edges of all monthly calendar blocks horizontally inside row segments.";
                } else if (config.granularity === "week" && config.showMonthAxis) {
                  alignmentHelpText = config.blockAlignment === "center"
                    ? "Centers month-grouped week segment blocks vertically."
                    : "Aligns top edges of month-grouped week segment blocks horizontally.";
                } else {
                  alignmentHelpText = config.blockAlignment === "center"
                    ? "Centers flat timeline layout blocks vertically relative to each other inside the row wrapping track."
                    : "Aligns top edges of flat timeline layout blocks horizontally inside the row wrapping track.";
                }
              }

              return (
                <div className={`space-y-1.5 border-t border-white/5 pt-3 transition-opacity duration-200 ${isAlignmentApplicable ? "" : "opacity-30"}`}>
                  <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>Vertical Block Alignment</span>
                      {!isAlignmentApplicable && (
                        <span className="text-[8px] bg-red-500/10 text-red-500/80 px-1 py-0.2 rounded uppercase tracking-wider font-normal">Inactive</span>
                      )}
                    </span>
                  </label>
                  <SegmentedControl
                    cols={2}
                    options={[
                      { id: "top", label: "Top-Aligned", icon: "vertical_align_top" },
                      { id: "center", label: "Center-Aligned", icon: "vertical_align_center" },
                    ]}
                    activeId={config.blockAlignment || "top"}
                    onChange={(id) => updateConfig("blockAlignment", id as any)}
                  />
                  <p className="text-[9px] text-gray-500 leading-tight">
                    {alignmentHelpText}
                  </p>
                </div>
              );
            })()}

            {/* Contextual details for Horizontal Rows mode */}
            {config.mode === "rows" && (
              <div className="text-[10px] text-gray-500 font-mono py-1 border-t border-white/5 pt-2">
                <strong>Horizontal Layout Rules:</strong>{" "}
                {config.groupBy !== "none" || (config.granularity === "week" && config.showMonthAxis)
                  ? "Each major time group stacks vertically as full continuous rows."
                  : "All timeline blocks sit sequentially inside a single infinitely long row."}
              </div>
            )}
          </div>

          <ControlGroup label="Organize Groupings By">
            <Select value={config.groupBy} onChange={(e) => {
              const val = e.target.value as any;
              updateConfig("groupBy", val);
              if (val === "season") updateConfig("monthsPerRow", 3);
            }} className="w-full">
              <option value="none">Ungrouped / Continuous</option>
              <option value="day">Grouped by Day</option>
              <option value="week">Grouped by Week</option>
              <option value="month">Grouped by Month</option>
              <option value="season">Grouped by Season</option>
            </Select>
            {config.groupBy === "season" && (
              <div className="mt-4 bg-[#141414] p-3 rounded-lg border border-border/40 space-y-3">
                <Toggle id="chk-seasons" label="Show Season Title Headers" checked={config.showSeasonLabels} onChange={(val) => updateConfig("showSeasonLabels", val)} />
                <Toggle id="chk-seasons-side" label="Align Seasons Side-by-Side" checked={config.seasonsSideBySide} onChange={(val) => updateConfig("seasonsSideBySide", val)} />
              </div>
            )}
          </ControlGroup>
          <ControlGroup label="Calendar Rules">
            <div className="grid grid-cols-1 gap-2 bg-[#141414] p-3 rounded-lg border border-border/40">
              <Toggle id="opt-monday" label="Start Weeks on Monday (not Sunday)" checked={config.isMondayFirst} onChange={(val) => updateConfig("isMondayFirst", val)} />
            </div>
          </ControlGroup>
        </div>
      </SidebarSection>
      )}
    </div>
  );
};
