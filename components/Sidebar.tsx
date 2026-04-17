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
    updateConfig('date', new Date().toISOString().split('T')[0]);
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
            <button onClick={onToggle} className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Tab Switcher */}
        <div className="flex bg-[#0a0a0a] border-b border-border sticky top-0 z-10">
          {[
            { id: 'config', label: 'Plan', icon: 'event_note' },
            { id: 'layout', label: 'Grid', icon: 'grid_view' },
            { id: 'style', label: 'Look', icon: 'auto_fix' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2
                ${activeTab === tab.id 
                  ? 'border-accent text-accent bg-accent/5' 
                  : 'border-transparent text-gray-600 hover:text-gray-400'}
              `}
            >
              <span className="material-symbols-outlined !text-[18px]">{tab.icon}</span>
              <span className="text-[9px] uppercase font-mono font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 px-4 divide-y divide-border/40 pb-20">
          
          {activeTab === 'config' && (
            <>
              {/* Definition */}
              <SidebarSection label="Structure">
                <div className="space-y-4">
                  <ControlGroup label="Resolution">
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
                  </ControlGroup>
                  <ControlGroup label="Canvas Mode">
                    <SegmentedControl 
                      cols={2}
                      options={[
                        { id: 'grid', label: 'Grid', icon: 'grid_view' },
                        { id: 'rows', label: 'Rows', icon: 'view_headline' },
                        { id: 'columns', label: 'Columns', icon: 'view_column' },
                        { id: 'timeline', label: 'Timeline', icon: 'view_timeline' }
                      ]}
                      activeId={config.mode}
                      onChange={(id) => updateConfig('mode', id as any)}
                    />
                  </ControlGroup>
                </div>
              </SidebarSection>

              {/* Time */}
              <SidebarSection label="Timeframe">
                <div className="space-y-4">
                  <ControlGroup label="Asset Name (Export Meta)">
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
                          className="bg-[#111] hover:bg-[#1a1a1a] border border-border/60 rounded-sm px-3 flex items-center justify-center text-gray-500 hover:text-accent transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">today</span>
                        </button>
                      </div>
                    </ControlGroup>

                    <ControlGroup label="Length of View" value={`${config.monthsToShow} units`}>
                      <Input 
                        type="range" min="1" max="60" step="1"
                        value={config.monthsToShow}
                        onChange={(e) => updateConfig('monthsToShow', parseInt(e.target.value))}
                        className="range-input"
                      />
                    </ControlGroup>
                    
                    <ControlGroup 
                      label={config.startFromJan ? 'Year Shift' : 'Calendar Scroll'}
                      value={`${config.monthOffset > 0 ? '+' : ''}${config.monthOffset} ${config.startFromJan ? 'Yrs' : 'Mos'}`}
                    >
                      <Input 
                        type="range" min={config.startFromJan ? -10 : -36} max={config.startFromJan ? 10 : 36} step="1" 
                        value={config.monthOffset}
                        onChange={(e) => updateConfig('monthOffset', parseInt(e.target.value))}
                        className="range-input"
                      />
                    </ControlGroup>
                  </div>

                  <ControlGroup label="Chronology Rules">
                    <div className="grid grid-cols-1 gap-1">
                      <Toggle 
                        id="opt-jan"
                        label="Align January 1st"
                        checked={config.startFromJan}
                        onChange={(val) => updateConfig('startFromJan', val)}
                      />
                      <Toggle 
                        id="opt-monday"
                        label="Monday First"
                        checked={config.isMondayFirst}
                        onChange={(val) => updateConfig('isMondayFirst', val)}
                      />
                      <Toggle 
                        id="opt-season"
                        label="Group By Season"
                        checked={config.groupBySeason}
                        onChange={(val) => {
                          if (val) {
                            if (config.mode === 'grid') setConfig(prev => ({ ...prev, groupBySeason: val, monthsPerRow: 3 }));
                            else if (config.mode === 'timeline') setConfig(prev => ({ ...prev, groupBySeason: val, itemsPerRow: 31 }));
                            else setConfig(prev => ({ ...prev, groupBySeason: val }));
                          } else {
                            updateConfig('groupBySeason', val);
                          }
                        }}
                      />
                    </div>
                  </ControlGroup>

                  <SidebarSection className="p-0 border-t border-border/20 pt-4 mt-2" label="Export Canvas">
                    <div className="space-y-4">
                      <ControlGroup label="Asset Format">
                        <Select 
                          value={config.assetFormat}
                          onChange={(e) => updateConfig('assetFormat', e.target.value as any)}
                        >
                          <option value="auto">Adaptive</option>
                          <option value="square">Square (1:1)</option>
                          <option value="ios-widget">iOS Widget</option>
                          <option value="ios-wallpaper">iOS Wallpaper</option>
                        </Select>
                      </ControlGroup>
                      <ControlGroup label="Resolution Scale" value={`${config.resolutionScale}x`}>
                        <Input 
                          type="range" min="1" max="4" step="1"
                          value={config.resolutionScale}
                          onChange={(e) => updateConfig('resolutionScale', parseInt(e.target.value) as any)}
                          className="range-input"
                        />
                      </ControlGroup>
                    </div>
                  </SidebarSection>
                </div>
              </SidebarSection>

              {/* Automation & Storage */}
              <SidebarSection label="Actions">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="secondary"
                      icon="restart_alt"
                      label="RESET"
                      onClick={resetConfig}
                      className="h-10 col-span-1"
                    />
                    <Button 
                      variant="secondary"
                      icon="content_copy"
                      label="COPY JSON"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
                          setCopyStatus('shortcut');
                          setTimeout(() => setCopyStatus('idle'), 2000);
                        });
                      }}
                      className="h-10 col-span-1"
                    />
                  </div>
                  <Button 
                    variant="secondary"
                    icon="link"
                    label={copyStatus === 'shortcut' ? 'COPIED' : 'IOS SYNC LINK'}
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set('view', 'image');
                      params.set('date', 'today');
                      const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
                      navigator.clipboard.writeText(url).then(() => {
                        setCopyStatus('shortcut');
                        setTimeout(() => setCopyStatus('idle'), 2000);
                      });
                    }}
                    className="w-full h-10"
                  />
                  <p className="text-[9px] text-gray-500 font-mono leading-tight">
                    STATIC ASSET LINK. FETCHES DYNAMIC GRID BASED ON CURRENT DATE FOR WIDGETS.
                  </p>
                </div>
              </SidebarSection>
            </>
          )}

          {activeTab === 'layout' && (
            <>
              <SidebarSection label="Metric Scale">
                <div className="space-y-5">
                  <ControlGroup label="Dot Diameter" value={`${config.dotSize}px`}>
                    <Input 
                      type="range" min="4" max="60" step="1"
                      value={config.dotSize}
                      onChange={(e) => updateConfig('dotSize', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>

                  <ControlGroup label="Inter-Gap" value={`${config.gap}px`}>
                    <Input 
                      type="range" min="0" max="20" step="1"
                      value={config.gap}
                      onChange={(e) => updateConfig('gap', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>

                  <ControlGroup label="Rounding" value={`${config.radius}px`}>
                    <Input 
                      type="range" min="0" max="30" step="1"
                      value={config.radius}
                      onChange={(e) => updateConfig('radius', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>
                </div>
              </SidebarSection>

              <SidebarSection label="Flow">
                <div className="space-y-5">
                  {(config.mode === 'grid' || config.mode === 'timeline') && config.granularity !== 'month' && (
                    <ControlGroup 
                      label={config.mode === 'timeline' ? 'Units Per Line' : 'Blocks Per Line'} 
                      value={config.mode === 'timeline' ? config.itemsPerRow : config.monthsPerRow}
                    >
                      <Input 
                        type="range" 
                        min="1" 
                        max={config.mode === 'timeline' ? (config.groupBySeason ? 31 : 366) : (config.groupBySeason ? 4 : 12)} 
                        step="1"
                        value={config.mode === 'timeline' ? config.itemsPerRow : config.monthsPerRow}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (config.mode === 'timeline') updateConfig('itemsPerRow', val);
                          else updateConfig('monthsPerRow', val);
                        }}
                        className="range-input"
                      />
                    </ControlGroup>
                  )}
                </div>
              </SidebarSection>
            </>
          )}

          {activeTab === 'style' && (
            <>
              <SidebarSection label="Typography">
                <div className="space-y-5">
                  <ControlGroup label="Label Scale" value={`${config.fontSize}px`}>
                    <Input 
                      type="range" min="6" max="32" step="1"
                      value={config.fontSize}
                      onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>
                  <ControlGroup label="Typeface">
                    <Select 
                      value={config.fontFamily}
                      onChange={(e) => updateConfig('fontFamily', e.target.value)}
                    >
                      <option value="'Inter', sans-serif">Inter Sans</option>
                      <option value="'JetBrains Mono', monospace">Terminal Mono</option>
                      <option value="serif">Modern Serif</option>
                    </Select>
                  </ControlGroup>
                </div>
              </SidebarSection>

              <SidebarSection label="Aesthetics">
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] text-gray-600 font-bold tracking-widest mb-3 block uppercase">Global Presets</span>
                    <div className="grid grid-cols-5 gap-2">
                      {THEMES.map(t => (
                        <button 
                          key={t.name}
                          onClick={() => applyTheme(t.colors)}
                          className={`
                            w-full aspect-square rounded-full border-2 transition-all relative overflow-hidden active:scale-95 shadow-lg group
                            ${JSON.stringify(config.colors) === JSON.stringify(t.colors) ? 'border-accent' : 'border-transparent'}
                          `}
                          title={t.name}
                        >
                          <div className="absolute inset-0" style={{ backgroundColor: t.colors.fill }}></div>
                          <div className="absolute inset-0 opacity-40" style={{ background: `linear-gradient(45deg, ${t.colors.bg}, transparent)` }} />
                          <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      { label: 'Surface', key: 'bg' },
                      { label: 'Today', key: 'today' },
                      { label: 'Inactive', key: 'futureDay' },
                      { label: 'History', key: 'pastDay' },
                      { label: 'Weekend', key: 'weekend' },
                      { label: 'Accent', key: 'stats' },
                    ].map(({ label, key }) => (
                      <ColorInput 
                        key={key}
                        label={label}
                        value={config.colors[key as keyof AppConfig['colors']]}
                        onChange={(val) => updateColor(key as keyof AppConfig['colors'], val)}
                      />
                    ))}
                  </div>
                </div>
              </SidebarSection>

              <SidebarSection label="Features & Guides">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5">
                    
                    <ControlGroup label="Cell Content">
                      <Select 
                        value={
                          config.showActiveLabel ? `active-${config.activeLabelFormat}` :
                          (config.showDayNumbers || config.showWeekNumbers || config.showMonthLabels) ? 'all' : 'none'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
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
                          } else if (val.startsWith('active-')) {
                            updateConfig('showActiveLabel', true);
                            updateConfig('activeLabelFormat', val.replace('active-', '') as any);
                            updateConfig('showDayNumbers', false);
                            updateConfig('showWeekNumbers', false);
                            updateConfig('showMonthLabels', false);
                          }
                        }}
                      >
                        <option value="none">Empty (Data Driven)</option>
                        <option value="all">Standard Units</option>
                        <option disabled>── Active Unit Only ──</option>
                        <option value="active-date">Date Context</option>
                        <option value="active-weekNum">Week Number</option>
                        <option value="active-dayName">Day Name</option>
                        <option value="active-monthName">Month Name</option>
                        <option value="active-monthDate">Month-Date</option>
                        <option value="active-full">Full Detail</option>
                      </Select>
                    </ControlGroup>

                    <ControlGroup label="Canvas Elements">
                      <div className="grid grid-cols-1 gap-1">
                        <Toggle id="chk-maxis" label="Month Headers" checked={config.showMonthAxis} onChange={(v) => updateConfig('showMonthAxis', v)} />
                        <Toggle id="chk-waxis" label="Weekday Axis" checked={config.showWeekdayAxis} onChange={(v) => updateConfig('showWeekdayAxis', v)} />
                        {config.groupBySeason && <Toggle id="chk-seasons" label="Season Names" checked={config.showSeasonLabels} onChange={(v) => updateConfig('showSeasonLabels', v)} />}
                        <Toggle id="chk-watermark" label="Year Watermark" checked={config.showYearLabel} onChange={(v) => updateConfig('showYearLabel', v)} />
                        <Toggle id="chk-stats" label="Progress Bar" checked={config.showStats} onChange={(v) => updateConfig('showStats', v)} />
                      </div>
                    </ControlGroup>

                    <ControlGroup label="Visual Rules">
                      <div className="grid grid-cols-1 gap-1">
                        <Toggle id="chk-weekends" label="Highlight Weekends" checked={config.highlightWeekends} onChange={(v) => updateConfig('highlightWeekends', v)} />
                        <Toggle id="chk-dim" label="Dim Past Units" checked={config.dimPastDays} onChange={(v) => updateConfig('dimPastDays', v)} />
                        <Toggle id="chk-alpha" label="Transparent Export" checked={config.transparentBg} onChange={(v) => updateConfig('transparentBg', v)} />
                      </div>
                    </ControlGroup>
                  </div>
                </div>
              </SidebarSection>
            </>
          )}
        </div>

        {/* Persistent Action Footer */}
        <div className="p-4 bg-[#0a0a0a] border-t border-border mt-auto sticky bottom-0">
          <Button 
            variant="primary"
            icon="download"
            label={isDownloading ? 'PROCESSING' : 'DOWNLOAD ASSET'}
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full h-11"
          />
        </div>
      </div>
    </aside>
  </>
);
};

export default Sidebar;
