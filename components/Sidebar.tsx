import React, { useState } from 'react';
import { AppConfig, AppColors } from '../types';
import { 
  SidebarSection, 
  ControlGroup, 
  Toggle, 
  SegmentedControl, 
  ColorInput,
  Input,
  Select,
  Button
} from './ui/Controls';

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onDownload: () => void;
  isDownloading: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  resetConfig: () => void;
}

const THEMES: { name: string; colors: AppColors }[] = [
  // ... (keep themes same)
  { 
    name: 'Ember', 
    colors: { 
      bg: '#0a0a0a', text: '#525252', empty: '#1f1f1f', fill: '#ea580c',
      pastDay: '#ffffff', futureDay: '#2c2c2e', today: '#ff3b30', significant: '#FFD60A', weekend: '#515155', stats: '#ff9f0a'
    } 
  },
  { 
    name: 'GitHub', 
    colors: { 
      bg: '#0d1117', text: '#8b949e', empty: '#161b22', fill: '#39d353',
      pastDay: '#ffffff', futureDay: '#161b22', today: '#f85149', significant: '#d29922', weekend: '#30363d', stats: '#39d353'
    } 
  },
  { 
    name: 'Ocean', 
    colors: { 
      bg: '#0f172a', text: '#94a3b8', empty: '#1e293b', fill: '#38bdf8',
      pastDay: '#ffffff', futureDay: '#1e293b', today: '#f43f5e', significant: '#fbbf24', weekend: '#334155', stats: '#38bdf8'
    } 
  },
  { 
    name: 'Forest', 
    colors: { 
      bg: '#1a2e05', text: '#ecfccb', empty: '#2f4d0d', fill: '#a3e635',
      pastDay: '#ffffff', futureDay: '#2f4d0d', today: '#ef4444', significant: '#facc15', weekend: '#3f6212', stats: '#a3e635'
    } 
  },
  { 
    name: 'Berry', 
    colors: { 
      bg: '#2e020f', text: '#fbcfe8', empty: '#500724', fill: '#ec4899',
      pastDay: '#ffffff', futureDay: '#500724', today: '#f43f5e', significant: '#fbbf24', weekend: '#831843', stats: '#ec4899'
    } 
  },
];

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onDownload, isDownloading, isOpen, onToggle, resetConfig }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'shortcut'>('idle');
  const [activeTab, setActiveTab] = useState<'config' | 'layout' | 'style'>('config');
  
  const updateConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateColor = (key: keyof AppConfig['colors'], value: string) => {
    setConfig(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };

  const setDateToToday = () => {
    updateConfig('date', new Date().toLocaleDateString('en-CA'));
  };

  const applyTheme = (colors: AppColors) => {
    setConfig(prev => ({ ...prev, colors }));
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

      <aside className={`
        fixed md:relative inset-y-0 left-0 w-80 flex-shrink-0 bg-surface border-r border-border flex flex-col h-full z-40 transition-transform duration-300 shadow-2xl overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-accent !text-[20px]">calendar_apps</span>
              Grid Gen
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Close Button Mobile */}
            <button onClick={onToggle} aria-label="Close sidebar" className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none rounded-sm">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

      {/* Controls - UNIFIED */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="flex-1 px-4 divide-y divide-border/40 pb-20">
          
          {/* Structure */}
          <SidebarSection label="Structure">
            <div className="space-y-4">
              <ControlGroup label="Canvas Layout">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" label="Grid" icon="grid_view" onClick={() => updateConfig('mode', 'grid')} className={config.mode === 'grid' ? 'border-accent text-accent' : ''} />
                  <Button variant="secondary" label="Rows" icon="view_headline" onClick={() => updateConfig('mode', 'rows')} className={config.mode === 'rows' ? 'border-accent text-accent' : ''} />
                  <Button variant="secondary" label="Columns" icon="view_column" onClick={() => updateConfig('mode', 'columns')} className={config.mode === 'columns' ? 'border-accent text-accent' : ''} />
                </div>
              </ControlGroup>
              <ControlGroup label="Grid Density">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="number" min="1" max="100"
                    placeholder="Items/Row"
                    value={config.itemsPerRow}
                    disabled={config.groupBy === 'season'}
                    onChange={(e) => updateConfig('itemsPerRow', parseInt(e.target.value) || 1)}
                    className="text-[11px]"
                  />
                  <Input 
                    type="number" min="1" max="12"
                    placeholder="Months/Row"
                    value={config.monthsPerRow}
                    disabled={config.groupBy === 'season'}
                    onChange={(e) => updateConfig('monthsPerRow', parseInt(e.target.value) || 1)}
                    className="text-[11px]"
                  />
                </div>
                {config.groupBy === 'season' && (
                  <p className="mt-1 text-[9px] text-accent font-mono italic">Density locked to Group By</p>
                )}
              </ControlGroup>
              <ControlGroup label="Unit Precision">
                <SegmentedControl 
                  options={[
                    { id: 'day', label: 'Day', icon: 'calendar_view_day' },
                    { id: 'week', label: 'Week', icon: 'date_range' },
                    { id: 'month', label: 'Month', icon: 'calendar_month' }
                  ]}
                  activeId={config.granularity}
                  onChange={(id) => {
                    const itemsPerRow = id === 'day' ? 31 : id === 'week' ? 12 : 4;
                    setConfig(prev => ({ 
                      ...prev, 
                      granularity: id as any,
                      itemsPerRow: itemsPerRow
                    }));
                  }}
                />
                <div className="mt-2 text-[10px] text-gray-500 font-mono uppercase tracking-tight">Group By</div>
                <Select 
                    value={config.groupBy}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      updateConfig('groupBy', val);
                      if (val === 'season') {
                        updateConfig('monthsPerRow', 3);
                      }
                    }}
                    className="mt-1"
                >
                    <option value="none">None</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="season">Season</option>
                </Select>
                {config.groupBy === 'season' && (
                  <div className="mt-2 text-xs">
                    <Toggle id="chk-seasons" label="Season Names" checked={config.showSeasonLabels} onChange={(val) => updateConfig('showSeasonLabels', val)} />
                  </div>
                )}
              </ControlGroup>
            </div>
          </SidebarSection>

          {/* Timeframe */}
          <SidebarSection label="Timeframe">
            <div className="space-y-4">
              <ControlGroup label="Document Title">
                <Input 
                  type="text"
                  placeholder="e.g. 2024 VISION"
                  value={config.customTitle || ''}
                  onChange={(e) => updateConfig('customTitle', e.target.value)}
                  className="text-[11px]"
                />
              </ControlGroup>

              <div className="flex flex-col gap-3">
                <ControlGroup label="Origin Month">
                  <div className="flex gap-2">
                    <Input 
                      type="date"
                      value={config.date}
                      onChange={(e) => updateConfig('date', e.target.value)}
                      className="font-mono text-[11px] h-10"
                    />
                    <button 
                      onClick={setDateToToday}
                      aria-label="Set date to today"
                      className="bg-[#111] hover:bg-[#1a1a1a] border border-border/60 rounded-sm px-3 flex items-center justify-center text-gray-500 hover:text-accent transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">today</span>
                    </button>
                  </div>
                </ControlGroup>

                <ControlGroup label="Length of View">
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-5 gap-1">
                      <Button variant="secondary" label="1M" onClick={() => updateConfig('monthsToShow', 1)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="6M" onClick={() => updateConfig('monthsToShow', 6)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="1Y" onClick={() => updateConfig('monthsToShow', 12)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="2Y" onClick={() => updateConfig('monthsToShow', 24)} className="!text-[10px] !px-1" />
                      <Button variant="secondary" label="5Y" onClick={() => updateConfig('monthsToShow', 60)} className="!text-[10px] !px-1" />
                    </div>
                    <Input 
                      type="number" min="1" max="60"
                      value={config.monthsToShow}
                      onChange={(e) => updateConfig('monthsToShow', parseInt(e.target.value) || 1)}
                      className="text-[11px]"
                    />
                  </div>
                </ControlGroup>
              </div>

              <ControlGroup label="Preferences">
                <div className="grid grid-cols-1 gap-1">
                  <Toggle id="opt-jan" label="Align Jan 1st" checked={config.startFromJan} onChange={(val) => updateConfig('startFromJan', val)} />
                  <Toggle id="opt-monday" label="Start Week Mon" checked={config.isMondayFirst} onChange={(val) => updateConfig('isMondayFirst', val)} />
                </div>
              </ControlGroup>
            </div>
          </SidebarSection>

          {/* Labels & Font */}
          <SidebarSection label="Labels & Font">
            <div className="space-y-6">
              <ControlGroup label="Visibility">
                {config.granularity !== 'month' && (
                  <Toggle id="chk-weeknumbers" label="Show Week Numbers" checked={config.showWeekNumbers} onChange={(v) => updateConfig('showWeekNumbers', v)} />
                )}
                <Toggle id="chk-daynumbers" label="Show Day Numbers" checked={config.showDayNumbers} onChange={(v) => updateConfig('showDayNumbers', v)} />
                <Toggle id="chk-monthnumbers" label="Show Month Numbers" checked={config.showMonthNumbers} onChange={(v) => updateConfig('showMonthNumbers', v)} />
                <Toggle id="chk-monthlabels" label="Show Month Labels" checked={config.showMonthLabels} onChange={(v) => updateConfig('showMonthLabels', v)} />
              </ControlGroup>
              <ControlGroup label="Typography">
                <div className="space-y-2">
                  <ControlGroup label="Dot Size" value={config.dotSize}>
                    <Input 
                      type="range" min="2" max="64" step="1"
                      value={config.dotSize}
                      onChange={(e) => updateConfig('dotSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </ControlGroup>
                  <ControlGroup label="Gap" value={config.gap}>
                    <Input 
                      type="range" min="0" max="32" step="1"
                      value={config.gap}
                      onChange={(e) => updateConfig('gap', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </ControlGroup>
                  <ControlGroup label="Radius" value={config.radius}>
                    <Input 
                      type="range" min="0" max="32" step="1"
                      value={config.radius}
                      onChange={(e) => updateConfig('radius', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </ControlGroup>
                  <Toggle id="chk-link" label="Link Font/Dot Ratio" checked={config.linkFontDotSize} onChange={(v) => updateConfig('linkFontDotSize', v)} />
                  <Input 
                    type="range" min="6" max="32" step="1"
                    value={config.fontSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      setConfig(prev => {
                        const next = { ...prev, fontSize: newSize };
                        if (prev.linkFontDotSize) {
                          next.dotSize = Math.max(2, Math.round(newSize * 1.5));
                        }
                        return next;
                      });
                    }}
                    className="range-input"
                  />
                  <Select value={config.fontFamily} onChange={(e) => updateConfig('fontFamily', e.target.value)}>
                    <option value="'Inter', sans-serif">Inter Sans</option>
                    <option value="'JetBrains Mono', monospace">Terminal Mono</option>
                    <option value="serif">Modern Serif</option>
                  </Select>
                </div>
              </ControlGroup>


              <div>
                <span className="text-[9px] text-gray-600 font-bold tracking-widest mb-3 block uppercase">Color Theme</span>
                <div className="grid grid-cols-5 gap-2">
                  {THEMES.map(t => (
                    <button 
                      key={t.name}
                      onClick={() => applyTheme(t.colors)}
                      className={`
                        w-full aspect-square rounded-full border-2 transition-all relative overflow-hidden active:scale-95 shadow-lg
                        ${JSON.stringify(config.colors) === JSON.stringify(t.colors) ? 'border-accent' : 'border-transparent'}
                      `}
                      title={t.name}
                    >
                      <div className="absolute inset-0" style={{ backgroundColor: t.colors.fill }}></div>
                    </button>
                  ))}
                </div>
              </div>

              <ControlGroup label="Layering">
                <Toggle id="chk-trans" label="Transparent Background" checked={config.transparentBg} onChange={(v) => updateConfig('transparentBg', v)} />
              </ControlGroup>
            </div>
          </SidebarSection>
          
          <SidebarSection label="Guides & Visibility">
            <div className="space-y-6">
              <ControlGroup label="Cell Content">
                {(() => {
                  const activeType = config.showActiveLabel 
                    ? 'active' 
                    : ((config.showDayNumbers || config.showWeekNumbers || config.showMonthLabels) ? 'all' : 'none');
                  
                  return (
                    <div className="space-y-4">
                      <SegmentedControl
                        cols={3}
                        options={[
                          { id: 'none', label: 'Empty', icon: 'visibility_off' },
                          { id: 'all', label: 'Standard', icon: 'visibility' },
                          { id: 'active', label: 'Active', icon: 'adjust' }
                        ]}
                        activeId={activeType}
                        onChange={(val) => {
                          if (val === 'none') {
                            updateConfig('showActiveLabel', false);
                            updateConfig('showDayNumbers', false);
                            updateConfig('showWeekNumbers', false);
                            updateConfig('showMonthLabels', false);
                          } else if (val === 'all') {
                            updateConfig('showActiveLabel', false);
                            updateConfig('showDayNumbers', true);
                            updateConfig('showWeekNumbers', true);
                            updateConfig('showMonthLabels', true);
                          } else if (val === 'active') {
                            updateConfig('showActiveLabel', true);
                          }
                        }}
                      />
                      
                      {activeType === 'active' && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-mono uppercase">Label Format</label>
                          <Select 
                            value={config.activeLabelFormat}
                            onChange={(e) => updateConfig('activeLabelFormat', e.target.value as any)}
                          >
                            <option value="date">Date Value</option>
                            <option value="weekNum">Week Number</option>
                            <option value="dayName">Day Name</option>
                            <option value="monthName">Month Name</option>
                            <option value="monthDate">Month/Date</option>
                            <option value="full">Full Details</option>
                          </Select>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </ControlGroup>

              <div className="grid grid-cols-1 gap-2">
                  {config.granularity !== 'month' && (
                    <Toggle id="chk-maxis" label="Month Headers" checked={config.showMonthAxis} onChange={(v) => updateConfig('showMonthAxis', v)} />
                  )}
                  {config.granularity === 'day' && (
                    <Toggle id="chk-waxis" label="Weekday Axis" checked={config.showWeekdayAxis} onChange={(v) => updateConfig('showWeekdayAxis', v)} />
                  )}
                  {config.groupBy === 'season' && (
                    <Toggle id="chk-seasons" label="Season Names" checked={config.showSeasonLabels} onChange={(v) => updateConfig('showSeasonLabels', v)} />
                  )}
                  <Toggle id="chk-watermark" label="Year Watermark" checked={config.showYearLabel} onChange={(v) => updateConfig('showYearLabel', v)} />
                  <Toggle id="chk-stats" label="Progress Bar" checked={config.showStats} onChange={(v) => updateConfig('showStats', v)} />
                  <Toggle id="chk-weekends" label="Weekend Dim" checked={config.highlightWeekends} onChange={(v) => updateConfig('highlightWeekends', v)} />
                  <div className="space-y-1">
                    <Toggle id="chk-dim" label="Dim Past" checked={config.dimPastDays} onChange={(v) => updateConfig('dimPastDays', v)} />
                    {config.dimPastDays && (
                      <Input 
                        type="range" min="0" max="100" step="5"
                        value={config.dimPastDaysStrength || 50}
                        onChange={(e) => updateConfig('dimPastDaysStrength', parseInt(e.target.value))}
                        className="w-full"
                      />
                    )}
                  </div>
              </div>
            </div>
          </SidebarSection>
        </div>

        {/* Persistent Footer */}
        <div className="p-4 bg-[#0a0a0a] border-t border-border flex flex-col gap-2 sticky bottom-0">
          <Button 
            variant="primary"
            icon="download"
            label={isDownloading ? 'PROCESSING' : 'DOWNLOAD ASSET'}
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full h-11"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" icon="restart_alt" label="RESET" onClick={resetConfig} className="h-8 text-[10px]" />
            <Button variant="secondary" icon="link" label="SYNC LINK" onClick={() => { /* ...clipboard logic */ }} className="h-8 text-[10px]" />
          </div>
        </div>
      </div>
    </aside>
  </>
);
};

export default Sidebar;
