import React, { useState, useEffect } from "react";
import { Button, ControlGroup, Input, Toggle, ThemeSelector, SegmentedControl, TactileSlider } from "../Controls";
import { Sparkles, LayoutGrid, Palette, Compass, Columns, CheckSquare, Calendar, Trash2, Milestone, ChevronRight } from "lucide-react";
import { THEMES } from "../themes";
import { AppConfig } from "@/types";
import { TactileConsole } from "./TactileConsole";
import { motion, AnimatePresence } from "motion/react";

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
  setZoom
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("grid");

  // Auto-switch to "milestones" tab when a user clicks a cell on the grid
  useEffect(() => {
    if (selectedCellId) {
      setActiveTab("milestones");
    }
  }, [selectedCellId]);

  if (!config || !setConfig) return null;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col h-full">
      <div className="space-y-1 pb-12 flex-1">
        {/* TOP ACTIONS - Unified Smashed Console Deck */}
        <TactileConsole
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

        {/* MODERN TAB SELECTOR STATION */}
        <div className="px-4 pt-4 sticky top-0 bg-[#08080a]/95 backdrop-blur-md z-30 pb-3 border-b border-white/5">
          <SegmentedControl<TabType>
            layoutId="dashboard-hud-tabs"
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: "grid", label: "Grid" },
              { value: "style", label: "Style" },
              { value: "axis", label: "Axis" },
              { value: "layers", label: "Layers" },
              { value: "milestones", label: "Milestones" }
            ]}
          />
        </div>

        <div className="p-4 space-y-6">
          <AnimatePresence mode="wait" initial={false}>
            {/* TAB 1: STRUCTURE & GRID */}
            {activeTab === "grid" && (
              <motion.div
                key="tab-grid"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="space-y-6"
              >
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.15em] text-gray-300">Layout Dimensions</span>
              </div>

              <Toggle 
                id="chk-life-mode" 
                label="Life Mode (Memento Mori)" 
                checked={!!config.isLifeMode} 
                onChange={(v: boolean) => setConfig((prev) => ({ ...prev, isLifeMode: v }))} 
              />

              {config.isLifeMode ? (
                <div className="space-y-4 pl-3 border-l-2 border-accent/20">
                  <ControlGroup label="DoB">
                    <Input 
                      type="date" 
                      value={config.birthDate || ''} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig((prev) => ({ ...prev, birthDate: e.target.value }))} 
                      className="font-mono text-[11px] h-9 w-full" 
                    />
                  </ControlGroup>
                  <ControlGroup label="Expectancy Years" value={config.lifeExpectancy || 80}>
                    <TactileSlider 
                      min={10} 
                      max={120} 
                      value={config.lifeExpectancy || 80} 
                      onChange={(v) => setConfig((prev) => ({ ...prev, lifeExpectancy: v }))} 
                    />
                  </ControlGroup>
                  <ControlGroup label="Unit Partition">
                    <SegmentedControl<'week' | 'month'>
                      layoutId="life-gran-picker"
                      options={[
                        { value: 'week', label: 'Weeks' },
                        { value: 'month', label: 'Months' }
                      ]}
                      value={config.lifeGranularity || 'week'}
                      onChange={(val) => setConfig((prev) => ({ ...prev, lifeGranularity: val }))}
                    />
                  </ControlGroup>
                </div>
              ) : (
                <div className="space-y-4">
                  <ControlGroup label="Start Date">
                    <Input 
                      type="date" 
                      value={config.date} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig((prev) => ({ ...prev, date: e.target.value }))} 
                      className="font-mono text-[11px] h-9 w-full" 
                    />
                  </ControlGroup>
                  <ControlGroup label="Display Span (Months)" value={config.monthsToShow}>
                    <TactileSlider 
                      min={1} 
                      max={60} 
                      value={config.monthsToShow} 
                      onChange={(v) => setConfig((prev) => ({ ...prev, monthsToShow: v }))} 
                    />
                  </ControlGroup>
                </div>
              )}

              <div className="space-y-4 pt-2 border-t border-white/5">
                <ControlGroup label="Presentation Mode">
                  <SegmentedControl<AppConfig['mode']>
                    layoutId="present-mode-picker"
                    options={[
                      { value: 'grid', label: 'Grid' },
                      { value: 'rows', label: 'Row' },
                      { value: 'columns', label: 'Col' },
                      { value: 'timeline', label: 'Line' }
                    ]}
                    value={config.mode}
                    onChange={(val) => setConfig((prev) => ({ ...prev, mode: val }))}
                  />
                </ControlGroup>

                <ControlGroup label="Gridded Resolution">
                  <SegmentedControl<AppConfig['granularity']>
                    layoutId="gran-picker"
                    options={[
                      { value: 'day', label: 'Day' },
                      { value: 'week', label: 'Week' },
                      { value: 'month', label: 'Month' }
                    ]}
                    value={config.granularity}
                    onChange={(val) => setConfig((prev) => ({ ...prev, granularity: val }))}
                  />
                </ControlGroup>
              </div>

              {config.mode === 'grid' && (
                <div className="pt-2 border-t border-white/5 space-y-4">
                  {config.granularity !== 'month' && (
                    <ControlGroup label="Months Per Row Line" value={config.monthsPerRow || 3}>
                      <TactileSlider 
                        min={1} 
                        max={12} 
                        value={config.monthsPerRow || 3} 
                        onChange={(v) => setConfig((prev) => ({ ...prev, monthsPerRow: v }))} 
                      />
                    </ControlGroup>
                  )}

                  <ControlGroup label="Items Per Row Line" value={config.itemsPerRow}>
                    <TactileSlider 
                      min={1} 
                      max={52} 
                      value={config.itemsPerRow} 
                      onChange={(v) => setConfig((prev) => ({ ...prev, itemsPerRow: v }))} 
                    />
                  </ControlGroup>
                </div>
              )}
            </motion.div>
          )}

            {/* TAB 2: APPEARANCE & STYLING */}
            {activeTab === "style" && (
              <motion.div
                key="tab-style"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="space-y-6"
              >
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.15em] text-gray-300">Styling & Palettes</span>
              </div>

              <ControlGroup label="Custom Watermark Heading">
                <Input 
                  type="text" 
                  placeholder="e.g., Year in review" 
                  value={config.customTitle || ''} 
                  onChange={(e) => setConfig((prev) => ({ ...prev, customTitle: e.target.value }))}
                  className="font-sans text-xs h-9 w-full"
                />
              </ControlGroup>

              <Toggle 
                id="chk-transparent-bg" 
                label="Transparent Background" 
                checked={!!config.transparentBg} 
                onChange={(v) => setConfig((prev) => ({ ...prev, transparentBg: v }))} 
              />

              <Toggle 
                id="chk-disable-sidebar-blur" 
                label="Disable Sidebar Backdrop Blur" 
                checked={!!config.disableSidebarBlur} 
                onChange={(v) => setConfig((prev) => ({ ...prev, disableSidebarBlur: v }))} 
              />

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-widest block mb-1">Color Theme Preset</label>
                <ThemeSelector 
                  themes={THEMES} 
                  activeColors={config.colors} 
                  onSelect={(colors) => setConfig((prev) => ({ ...prev, colors }))} 
                />
              </div>

              {/* GORGEOUS CONTROLS SMASH: History Fading & Time Sync */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-zinc-400 block mb-1">Time Travel & Aging Aesthetics</span>
                  
                  <Toggle 
                    id="chk-dim-past-days" 
                    label="Fade Completed / Lived Days" 
                    checked={!!config.dimPastDays} 
                    onChange={(v) => setConfig((prev) => ({ ...prev, dimPastDays: v }))} 
                  />

                  {config.dimPastDays && (
                    <ControlGroup label="Completed Days Fading Level" value={config.dimPastDaysStrength}>
                      <TactileSlider 
                        min={0} 
                        max={100} 
                        value={config.dimPastDaysStrength} 
                        onChange={(v) => setConfig((prev) => ({ ...prev, dimPastDaysStrength: v }))} 
                      />
                    </ControlGroup>
                  )}

                  <Toggle 
                    id="chk-anchor-today" 
                    label="Sync 'Today' with Real-Time Clock" 
                    checked={!!config.anchorTodayToRealTime} 
                    onChange={(v) => setConfig((prev) => ({ ...prev, anchorTodayToRealTime: v }))} 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/5">
                <ControlGroup label="Node Size" value={config.dotSize}>
                  <TactileSlider 
                    min={2} 
                    max={40} 
                    value={config.dotSize} 
                    onChange={(v) => setConfig((prev) => ({ ...prev, dotSize: v }))} 
                  />
                </ControlGroup>

                <ControlGroup label="Node Spacing (Gap)" value={config.gap}>
                  <TactileSlider 
                    min={0} 
                    max={20} 
                    value={config.gap} 
                    onChange={(v) => setConfig((prev) => ({ ...prev, gap: v }))} 
                  />
                </ControlGroup>

                <ControlGroup label="Corner Radius" value={config.radius}>
                  <TactileSlider 
                    min={0} 
                    max={20} 
                    value={config.radius} 
                    onChange={(v) => setConfig((prev) => ({ ...prev, radius: v }))} 
                  />
                </ControlGroup>

                <ControlGroup label="Font Scaling Size" value={config.fontSize}>
                  <TactileSlider 
                    min={4} 
                    max={32} 
                    value={config.fontSize} 
                    onChange={(v) => setConfig((prev) => ({ ...prev, fontSize: v }))} 
                  />
                </ControlGroup>
              </div>
            </motion.div>
          )}

            {/* TAB 3: AXES & ALIGNMENT */}
            {activeTab === "axis" && (
              <motion.div
                key="tab-axis"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="space-y-6"
              >
              <div className="flex items-center gap-2 mb-2">
                <Compass className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.15em] text-gray-300">Axes & Labels</span>
              </div>

              <ControlGroup label="Label Angle Rotation">
                <SegmentedControl<number>
                  layoutId="label-angle-picker"
                  options={[
                    { value: 0, label: "0°" },
                    { value: 45, label: "45°" },
                    { value: 90, label: "90°" },
                    { value: -45, label: "-45°" },
                    { value: -90, label: "-90°" }
                  ]}
                  value={config.labelRotation || 0}
                  onChange={(val) => setConfig((prev) => ({ ...prev, labelRotation: val as any }))}
                />
              </ControlGroup>

              <div className="space-y-1 pt-2 border-t border-white/5 mt-4">
                <Toggle id="chk-show-month-axis" label="Show Month Axis Line" checked={config.showMonthAxis} onChange={(v) => setConfig((prev) => ({ ...prev, showMonthAxis: v }))} />
                <Toggle id="chk-show-month-nums" label="Month by Numbers" checked={config.showMonthNumbers} onChange={(v) => setConfig((prev) => ({ ...prev, showMonthNumbers: v }))} />
                <Toggle id="chk-show-weekday-axis" label="Show Weekday Axis Line" checked={config.showWeekdayAxis} onChange={(v) => setConfig((prev) => ({ ...prev, showWeekdayAxis: v }))} />
                <Toggle id="chk-show-side-axis" label="Show Side Grid Axis" checked={!!config.showSideDayAxis} onChange={(v) => setConfig((prev) => ({ ...prev, showSideDayAxis: v }))} />
                <Toggle id="chk-highlight-weekends" label="Highlight Weekends" checked={config.highlightWeekends} onChange={(v) => setConfig((prev) => ({ ...prev, highlightWeekends: v }))} />
                <Toggle id="chk-mon-first" label="Monday First" checked={config.isMondayFirst} onChange={(v) => setConfig((prev) => ({ ...prev, isMondayFirst: v }))} />
              </div>
            </motion.div>
          )}

            {/* TAB 4: CELL OVERLAYS & LAYERS */}
            {activeTab === "layers" && (
              <motion.div
                key="tab-layers"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="space-y-6"
              >
              <div className="flex items-center gap-2 mb-2">
                <Columns className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.15em] text-gray-300">Overlays & Overrides</span>
              </div>

              <div className="space-y-1">
                <Toggle id="chk-show-year-label" label="Layer Year Background" checked={config.showYearLabel} onChange={(v) => setConfig((prev) => ({ ...prev, showYearLabel: v }))} />
                <Toggle id="chk-show-day-nums" label="Layer Day Text Inside" checked={config.showDayNumbers} onChange={(v) => setConfig((prev) => ({ ...prev, showDayNumbers: v }))} />
                <Toggle id="chk-show-week-nums" label="Layer Week Text Inside" checked={config.showWeekNumbers} onChange={(v) => setConfig((prev) => ({ ...prev, showWeekNumbers: v }))} />
                <Toggle id="chk-keep-shape" label="Keep Circle Shape with Text" checked={config.keepCellShapeWithNumbers} onChange={(v) => setConfig((prev) => ({ ...prev, keepCellShapeWithNumbers: v }))} />
                <Toggle id="chk-show-stats" label="Layer Stats Status Bar" checked={config.showStats} onChange={(v) => setConfig((prev) => ({ ...prev, showStats: v }))} />
                <Toggle id="chk-header-plugin" label="MEMENTO MORI Watermark Header" checked={!!config.showHeaderPlugin} onChange={(v) => setConfig((prev) => ({ ...prev, showHeaderPlugin: v }))} />
              </div>
            </motion.div>
          )}

            {/* TAB 5: MILESTONES & OVERRIDES */}
            {activeTab === "milestones" && (
              <motion.div
                key="tab-milestones"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="space-y-6"
              >
              <div className="flex items-center gap-2 mb-2">
                <Milestone className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.15em] text-gray-300">Milestone Studio</span>
              </div>

              {selectedCellId ? (() => {
                const overrideVal = config.overrides[selectedCellId] || "";
                const activeColorKey = overrideVal.includes('|') ? overrideVal.split('|')[0] : (overrideVal || "significant");
                const activeNoteText = overrideVal.includes('|') ? overrideVal.split('|')[1] : "";

                const formatSelectedId = (id: string) => {
                  if (id.startsWith("life-")) {
                    const isWeek = id.includes("-W-");
                    const index = parseInt(id.split("-").pop() || "0", 10);
                    const age = Math.floor(index / (isWeek ? 52 : 12));
                    const unit = (index % (isWeek ? 52 : 12)) + 1;
                    return `Age ${age}, ${isWeek ? `Week ${unit}` : `Month ${unit}`}`;
                  }
                  const parts = id.split('-');
                  if (parts[0] === 'day') {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const mIdx = parseInt(parts[2], 10);
                    return `${months[mIdx] || parts[2]} ${parts[3]}, ${parts[1]}`;
                  } else if (parts[0] === 'week') {
                    return `Week ${parts[2]}, Year ${parts[1]}`;
                  } else if (parts[0] === 'month') {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${months[parseInt(parts[2], 10)]} ${parts[1]}`;
                  }
                  return id;
                };

                const handleNoteChange = (text: string) => {
                  setConfig(prev => {
                    const overrides = { ...(prev.overrides || {}) };
                    overrides[selectedCellId] = `${activeColorKey}|${text}`;
                    return { ...prev, overrides };
                  });
                };

                const handleColorChange = (colorKey: string) => {
                  setConfig(prev => {
                    const overrides = { ...(prev.overrides || {}) };
                    overrides[selectedCellId] = `${colorKey}|${activeNoteText}`;
                    return { ...prev, overrides };
                  });
                };

                const handleDelete = () => {
                  setConfig(prev => {
                    const overrides = { ...(prev.overrides || {}) };
                    delete overrides[selectedCellId];
                    return { ...prev, overrides };
                  });
                  setSelectedCellId(null);
                };

                const PRESET_COLORS = [
                  { label: "Milestone", value: "significant", hex: config.colors.significant },
                  { label: "Today", value: "today", hex: config.colors.today },
                  { label: "Red", value: "#ef4444", hex: "#ef4444" },
                  { label: "Blue", value: "#3b82f6", hex: "#3b82f6" },
                  { label: "Green", value: "#10b981", hex: "#10b981" },
                  { label: "Purple", value: "#a855f7", hex: "#a855f7" },
                  { label: "Orange", value: "#f97316", hex: "#f97316" }
                ];

                return (
                  <div className="space-y-4 border border-white/5 bg-white/[0.02] p-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 px-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono font-bold text-accent uppercase tracking-wider">Selected Node</span>
                        <span className="text-xs font-mono font-bold text-white mt-0.5">{formatSelectedId(selectedCellId)}</span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedCellId(null)}
                        className="text-[9px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded-md bg-[#141416] hover:bg-[#1a1a1e] border border-white/5 transition-colors cursor-pointer"
                      >
                        Deselect
                      </motion.button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500 block">Milestone Label</label>
                      <Input
                        type="text"
                        placeholder="Add note, event name..."
                        value={activeNoteText}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500 block">Color Category</label>
                      <div className="flex flex-wrap gap-2 p-1.5 bg-[#0e0e11] border border-white/5 rounded-lg">
                        {PRESET_COLORS.map(c => {
                          const isSelected = activeColorKey === c.value;
                          return (
                            <motion.button
                              key={c.value}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.92 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                              onClick={() => handleColorChange(c.value)}
                              className={`w-6.5 h-6.5 rounded-full cursor-pointer relative flex items-center justify-center transition-shadow border ${isSelected ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'border-white/10'}`}
                              style={{ backgroundColor: c.hex }}
                              title={c.label}
                            >
                              {isSelected && (
                                <motion.div 
                                  layoutId="active-milestone-dot"
                                  className="w-2 h-2 rounded-full bg-white shadow-md"
                                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleDelete}
                        className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-red-500/10 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Milestone
                      </motion.button>
                    </div>
                  </div>
                );
              })() : (
                <div className="border border-dashed border-white/10 hover:border-white/20 transition-colors p-6 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center mb-3">
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Click any grid cell</span>
                  <p className="text-[9px] font-mono text-zinc-500 mt-1 max-w-[200px]">Directly tap any day, week, month, or life block to highlight it and add a custom milestone!</p>
                </div>
              )}

              {/* ALL MILESTONES LIST */}
              {Object.keys(config.overrides || {}).length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500 block">Configured Milestones ({Object.keys(config.overrides).length})</span>
                  <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5">
                    {Object.entries(config.overrides).map(([id, val]) => {
                      const colorKey = val.includes('|') ? val.split('|')[0] : val;
                      const textLabel = val.includes('|') ? val.split('|')[1] : "";
                      const isSelected = selectedCellId === id;

                      const getHexColor = (key: string) => {
                        const fallbacks: Record<string, string> = {
                          significant: config.colors.significant,
                          today: config.colors.today,
                          "#ef4444": "#ef4444",
                          "#3b82f6": "#3b82f6",
                          "#10b981": "#10b981",
                          "#a855f7": "#a855f7",
                          "#f97316": "#f97316"
                        };
                        return fallbacks[key] || config.colors.significant;
                      };

                      const formatIdClean = (mId: string) => {
                        if (mId.startsWith("life-")) {
                          const index = mId.split("-").pop() || "0";
                          return `Life Item ${index}`;
                        }
                        const parts = mId.split('-');
                        if (parts[0] === 'day') {
                          return `${parts[1]}-${(parseInt(parts[2], 10)+1).toString().padStart(2, '0')}-${parts[3].padStart(2, '0')}`;
                        } else if (parts[0] === 'week') {
                          return `Wk ${parts[2]}, '` + parts[1].slice(2);
                        } else if (parts[0] === 'month') {
                          const mName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(parts[2],10)];
                          return `${mName} ${parts[1]}`;
                        }
                        return mId;
                      };

                      return (
                        <div 
                          key={id}
                          onClick={() => setSelectedCellId(id)}
                          className={`flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-accent/10 hover:bg-accent/15' : 'hover:bg-white/[0.02]'}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getHexColor(colorKey) }} />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-mono font-extrabold text-white truncate">{textLabel || "Active Marker"}</span>
                              <span className="text-[9px] font-mono text-zinc-500">{formatIdClean(id)}</span>
                            </div>
                          </div>
                          <ChevronRight className={`h-3 w-3 text-zinc-600 shrink-0 transition-transform ${isSelected ? 'rotate-90 text-accent' : ''}`} />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all milestones? This will reload the grid back to clean default colors.")) {
                        setConfig(prev => ({ ...prev, overrides: {} }));
                        setSelectedCellId(null);
                      }
                    }}
                    className="w-full text-center text-[10px] font-mono text-zinc-500 hover:text-red-400 py-2 border border-dashed border-white/5 hover:border-red-500/20 rounded-lg bg-black/20 hover:bg-red-500/5 transition-colors"
                  >
                    Clear All Milestones
                  </button>
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
