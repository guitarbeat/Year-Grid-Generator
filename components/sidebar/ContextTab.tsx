import React from 'react';
import { AppConfig } from '../../types';
import { SidebarSection, ControlGroup, Input, Toggle, Select } from '../ui/Controls';

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  searchQuery?: string;
}

export const ContextTab: React.FC<Props> = ({ config, setConfig, searchQuery = "" }) => {
  const updateConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const matches = (label: string, keywords: string[] = []) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      label.toLowerCase().includes(q) ||
      keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  };

  const hasDocMatch = matches("Document Info", ["title", "text", "vision", "info", "rendered title", "document"]);
  const hasAxisMatch = matches("Axis & Watermarks", ["axis", "watermark", "month axis", "weekday axis", "year background", "completion progress", "stats", "progress bar"]);
  const hasOverlayMatch = matches("Cell Content Overlay", ["overlay", "highlight data", "active label", "label format", "week numbers", "month numbers", "day numbers", "print", "cell content"]);
  const hasPostMatch = matches("Visual Post-Processing", ["visual", "post-processing", "mute", "past", "dim", "weekends", "strength", "dim past", "mute past"]);
  const hasMementoMatch = matches("Memento Mori & Life View", ["memento", "mori", "life view", "quotes", "stoicism"]);

  return (
    <div className="space-y-2">
      {hasMementoMatch && (
        <SidebarSection 
          key={searchQuery ? "open-memento" : "closed-memento"}
          label="Memento Mori & Life View" 
          defaultOpen={config.isLifeMode}
          className="pt-4"
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
                  <Select
                    value={config.lifeGranularity || "week"}
                    onChange={(e) => updateConfig("lifeGranularity", e.target.value as any)}
                    className="w-full text-[10px]"
                  >
                    <option value="week">Weeks (52 cols)</option>
                    <option value="month">Months (12 cols)</option>
                  </Select>
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

      {hasDocMatch && (
        <SidebarSection 
          key={searchQuery ? "open-doc" : "closed-doc"}
          label="Document Info" 
          defaultOpen={true} 
          className="pt-4"
        >
          <ControlGroup label="Rendered Title">
            <Input type="text" placeholder="e.g. 2024 VISION" value={config.customTitle || ""} onChange={(e) => updateConfig("customTitle", e.target.value)} className="text-[11px]" />
            <p className="text-[9px] text-gray-500 mt-1 leading-tight">Displayed boldly if left non-empty.</p>
          </ControlGroup>
        </SidebarSection>
      )}

      {hasAxisMatch && (
        <SidebarSection 
          key={searchQuery ? "open-axis" : "closed-axis"}
          label="Axis & Watermarks" 
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 gap-1 text-[11px]">
            {config.granularity !== "month" && (
              <Toggle id="chk-maxis" label="Show Month Axis Labels" checked={config.showMonthAxis} onChange={(v) => updateConfig("showMonthAxis", v)} />
            )}
            {config.granularity === "day" && (
              <Toggle id="chk-waxis" label="Show Weekday Axis labels" checked={config.showWeekdayAxis} onChange={(v) => updateConfig("showWeekdayAxis", v)} />
            )}
            <Toggle id="chk-watermark" label="Year Background Watermark" checked={config.showYearLabel} onChange={(v) => updateConfig("showYearLabel", v)} />
            <Toggle id="chk-stats" label="Show Completion Progress Bar" checked={config.showStats} onChange={(v) => updateConfig("showStats", v)} />
          </div>
        </SidebarSection>
      )}

      {hasOverlayMatch && (
        <SidebarSection 
          key={searchQuery ? "open-overlay" : "closed-overlay"}
          label="Cell Content Overlay" 
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 gap-2 mb-2 text-[11px]">
            <div className="bg-[#141414] p-3 rounded-lg border border-border/40">
              <Toggle id="chk-active" label="Highlight Selected Data" checked={config.showActiveLabel} onChange={(v) => updateConfig("showActiveLabel", v)} />
              {config.showActiveLabel && (
                <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight">Label Format</label>
                  <Select value={config.activeLabelFormat} onChange={(e) => updateConfig("activeLabelFormat", e.target.value as any)} className="w-full text-[10px]">
                    <option value="date">YYYY-MM-DD Value</option>
                    <option value="weekNum">ISO Week Number</option>
                    <option value="dayName">Named Day</option>
                    <option value="monthName">Named Month</option>
                    <option value="monthDate">Month/Date</option>
                    <option value="full">Full Descriptive Details</option>
                  </Select>
                </div>
              )}
            </div>

            {config.granularity === "day" && (
              <div className="bg-[#141414] p-3 rounded-lg border border-border/40 space-y-2">
                <Toggle id="chk-daynumbers" label="Print Day Numbers on Cells" checked={config.showDayNumbers} onChange={(v) => updateConfig("showDayNumbers", v)} />
                {config.showDayNumbers && (
                  <div className="pl-4 border-l border-border/40 ml-2 space-y-1">
                    <Toggle id="chk-keep-cell-shape" label="Keep Cell Background Shape" checked={config.keepCellShapeWithNumbers} onChange={(v) => updateConfig("keepCellShapeWithNumbers", v)} />
                  </div>
                )}
              </div>
            )}
            {config.granularity === "day" && config.mode === "columns" && (
              <div className="bg-[#141414] p-3 rounded-lg border border-border/40">
                <Toggle id="chk-sidedayaxis" label="Show Side Day Axis (1-31)" checked={config.showSideDayAxis} onChange={(v) => updateConfig("showSideDayAxis", v)} />
              </div>
            )}
            {config.granularity !== "month" && <Toggle id="chk-weeknumbers" label="Print Week Numbers on Cells" checked={config.showWeekNumbers} onChange={(v) => updateConfig("showWeekNumbers", v)} />}
            {config.granularity === "month" && (
              <>
                <Toggle id="chk-monthnumbers" label="Print Month Numbers" checked={config.showMonthNumbers} onChange={(v) => updateConfig("showMonthNumbers", v)} />
                <Toggle id="chk-monthlabels" label="Print Month Labels" checked={config.showMonthLabels} onChange={(v) => updateConfig("showMonthLabels", v)} />
              </>
            )}
          </div>
        </SidebarSection>
      )}

      {hasPostMatch && (
        <SidebarSection 
          key={searchQuery ? "open-post" : "closed-post"}
          label="Visual Post-Processing" 
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 gap-2 text-[11px] bg-[#141414] p-3 rounded-lg border border-border/40">
            <Toggle id="chk-weekends" label="Dim Weekends Automatically" checked={config.highlightWeekends} onChange={(v) => updateConfig("highlightWeekends", v)} />
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Toggle id="chk-dim" label="Mute Past Real-World Dates" checked={config.dimPastDays} onChange={(v) => updateConfig("dimPastDays", v)} />
              {config.dimPastDays && (
                <div className="space-y-1 pt-2">
                  <label className="text-[10px] text-gray-500 font-mono uppercase">Muting Strength ({config.dimPastDaysStrength || 50}%)</label>
                  <Input type="range" min="0" max="100" step="5" value={config.dimPastDaysStrength || 50} onChange={(e) => updateConfig("dimPastDaysStrength", parseInt(e.target.value))} className="w-full" />
                </div>
              )}
            </div>
          </div>
        </SidebarSection>
      )}
    </div>
  );
};
