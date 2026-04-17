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

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onDownload, isDownloading, isOpen, onToggle }) => {
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
            { id: 'config', label: 'Setup', icon: 'settings' },
            { id: 'layout', label: 'Space', icon: 'grid_guides' },
            { id: 'style', label: 'Vis', icon: 'palette' }
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
              <SidebarSection label="Core Definition">
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
                        const itemsPerRow = id === 'day' ? 31 : id === 'week' ? 13 : 4;
                        setConfig(prev => ({ 
                          ...prev, 
                          granularity: id as any,
                          itemsPerRow: itemsPerRow
                        }));
                      }}
                    />
                  </ControlGroup>
                  <ControlGroup label="Blueprint">
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
              <SidebarSection label="Temporal Constraints">
                <div className="space-y-4">
                  <ControlGroup label="Origin">
                    <div className="flex gap-2">
                      <Input 
                        type="date"
                        value={config.date}
                        onChange={(e) => updateConfig('date', e.target.value)}
                        className="font-mono text-[11px]"
                      />
                      <button 
                        onClick={setDateToToday}
                        className="bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-sm px-3 flex items-center justify-center text-gray-500 hover:text-accent transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">today</span>
                      </button>
                    </div>
                  </ControlGroup>

                  <ControlGroup label="Span" value={`${config.monthsToShow} ${config.granularity === 'day' ? 'Mos' : config.granularity === 'week' ? 'Wks' : 'Yrs'}`}>
                    <Input 
                      type="range" min="1" max="60" step="1"
                      value={config.monthsToShow}
                      onChange={(e) => updateConfig('monthsToShow', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>
                </div>
              </SidebarSection>

              {/* Automation */}
              <SidebarSection label="Automation">
                <div className="space-y-4">
                  <Button 
                    variant="secondary"
                    icon="link"
                    label={copyStatus === 'shortcut' ? 'COPIED' : 'AUTOMATION LINK'}
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
                    className="w-full"
                  />
                  <p className="text-[9px] text-gray-500 font-mono leading-tight">
                    STATIC ASSET LINK FOR IOS SHORTCUTS. FETCHES DYNAMIC GRID BASED ON CURRENT DATE.
                  </p>
                </div>
              </SidebarSection>
            </>
          )}

          {activeTab === 'layout' && (
            <>
              <SidebarSection label="Geometry">
                <div className="space-y-5">
                  <ControlGroup label="Unit Scale" value={`${config.dotSize}px`}>
                    <Input 
                      type="range" min="4" max="60" step="1"
                      value={config.dotSize}
                      onChange={(e) => updateConfig('dotSize', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>

                  <ControlGroup label="Internal Spacing" value={`${config.gap}px`}>
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

              <SidebarSection label="Arrangement">
                <div className="space-y-5">
                  {config.mode === 'grid' && config.granularity !== 'month' && (
                    <ControlGroup label="Modules Per Line" value={config.monthsPerRow}>
                      <Input 
                        type="range" min="1" max="12" step="1"
                        value={config.monthsPerRow}
                        onChange={(e) => updateConfig('monthsPerRow', parseInt(e.target.value))}
                        className="range-input"
                      />
                    </ControlGroup>
                  )}

                  <ControlGroup 
                    label={config.startFromJan ? 'Year Offset' : 'Month Start Offset'}
                    value={`${config.monthOffset > 0 ? '+' : ''}${config.monthOffset} ${config.startFromJan ? 'Yrs' : 'Mos'}`}
                  >
                    <Input 
                      type="range" min={config.startFromJan ? -4 : -24} max={config.startFromJan ? 4 : 24} step="1" 
                      value={config.monthOffset}
                      onChange={(e) => updateConfig('monthOffset', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>

                  {!(config.mode === 'rows' || config.mode === 'columns' || (config.mode === 'grid' && config.granularity === 'day')) && (
                    <ControlGroup label="Items Per Row" value={config.itemsPerRow}>
                      <Input 
                        type="range" min="1" max="100" step="1"
                        value={config.itemsPerRow}
                        onChange={(e) => updateConfig('itemsPerRow', parseInt(e.target.value))}
                        className="range-input"
                      />
                    </ControlGroup>
                  )}
                </div>
              </SidebarSection>

              <SidebarSection label="Typography">
                <div className="space-y-5">
                  <ControlGroup label="Label Size" value={`${config.fontSize}px`}>
                    <Input 
                      type="range" min="8" max="24" step="1"
                      value={config.fontSize}
                      onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                      className="range-input"
                    />
                  </ControlGroup>
                  <ControlGroup label="Font Family">
                    <Select 
                      value={config.fontFamily}
                      onChange={(e) => updateConfig('fontFamily', e.target.value)}
                    >
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                      <option value="serif">Classic Serif</option>
                    </Select>
                  </ControlGroup>
                </div>
              </SidebarSection>
            </>
          )}

          {activeTab === 'style' && (
            <>
              <SidebarSection label="Visibility">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'check-jan', label: 'ALIGN JANUARY 1st', key: 'startFromJan' },
                    { id: 'check-monday', label: 'MONDAY FIRST', key: 'isMondayFirst', hide: config.granularity === 'month' },
                    { id: 'check-numbers', label: 'SHOW DIGITS', key: 'showDayNumbers', hide: config.granularity !== 'day' },
                    { id: 'check-weekends', label: 'WEEKEND EMPHASIS', key: 'highlightWeekends', hide: config.granularity === 'month' },
                    { id: 'check-dim', label: 'DIM HISTORICAL', key: 'dimPastDays' },
                    { id: 'check-stats', label: 'PROGRESS BAR', key: 'showStats' },
                    { id: 'check-year-lbl', label: 'YEAR BACKGROUND', key: 'showYearLabel' },
                    { id: 'check-transparent', label: 'ALPHA EXPORT', key: 'transparentBg' },
                  ].filter(opt => !opt.hide).map((opt) => (
                    <Toggle 
                      key={opt.id}
                      id={opt.id}
                      label={opt.label}
                      checked={config[opt.key as keyof AppConfig] as boolean}
                      onChange={(val) => updateConfig(opt.key as any, val)}
                    />
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection label="Themes">
                <div className="space-y-6">
                  <div className="grid grid-cols-5 gap-2">
                    {THEMES.map(t => (
                      <button 
                        key={t.name}
                        onClick={() => applyTheme(t.colors)}
                        className="w-full aspect-square rounded-sm border border-border hover:border-accent transition-all relative overflow-hidden active:scale-95 shadow-lg group"
                        title={t.name}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${t.colors.bg} 50%, ${t.colors.fill} 50%)` }}></div>
                        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      { label: 'Surface', key: 'bg' },
                      { label: 'Highlight', key: 'today' },
                      { label: 'Future', key: 'futureDay' },
                      { label: 'Legacy', key: 'pastDay' },
                      { label: 'Rest', key: 'weekend' },
                      { label: 'Metric', key: 'stats' },
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
