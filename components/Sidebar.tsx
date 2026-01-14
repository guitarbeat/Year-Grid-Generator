import React, { useState } from 'react';
import { AppConfig, AppColors, ActiveLabelFormat } from '../types';

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onDownload: () => void;
  isDownloading: boolean;
}

const THEMES: { name: string; colors: AppColors }[] = [
  { 
    name: 'Ember', 
    colors: { bg: '#0a0a0a', text: '#525252', empty: '#1f1f1f', fill: '#ea580c' } 
  },
  { 
    name: 'GitHub', 
    colors: { bg: '#0d1117', text: '#8b949e', empty: '#161b22', fill: '#39d353' } 
  },
  { 
    name: 'Ocean', 
    colors: { bg: '#0f172a', text: '#94a3b8', empty: '#1e293b', fill: '#38bdf8' } 
  },
  { 
    name: 'Forest', 
    colors: { bg: '#1a2e05', text: '#ecfccb', empty: '#2f4d0d', fill: '#a3e635' } 
  },
  { 
    name: 'Berry', 
    colors: { bg: '#2e020f', text: '#fbcfe8', empty: '#500724', fill: '#ec4899' } 
  },
];

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onDownload, isDownloading }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'editor' | 'image'>('idle');
  
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

  const copyLink = (type: 'editor' | 'image') => {
    const params = new URLSearchParams(window.location.search);
    if (type === 'image') {
      params.set('view', 'image');
    } else {
      params.delete('view');
    }
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus(type);
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  return (
    <aside className="w-full md:w-80 flex-shrink-0 bg-[#111] border-r border-[#222] flex flex-col h-full z-20 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#222] flex justify-between items-center bg-[#111]">
        <h1 className="text-sm font-bold tracking-widest uppercase text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">calendar_view_week</span>
          Year Grid
        </h1>
        <button 
          onClick={onDownload}
          disabled={isDownloading}
          className="text-xs bg-white text-black px-3 py-1.5 rounded font-bold hover:bg-gray-200 transition-colors uppercase tracking-wider flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          {isDownloading ? 'Wait...' : 'Save'}
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        
        {/* Share Section */}
        <section className="space-y-3 bg-[#161616] -mx-5 px-5 py-4 border-b border-[#222]">
           <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Share & Embed</h2>
           <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={() => copyLink('editor')}
               className="flex flex-col items-center justify-center p-2 rounded bg-[#1f1f1f] hover:bg-[#252525] border border-[#333] transition-colors group"
             >
               <span className="material-symbols-outlined text-gray-400 group-hover:text-white mb-1">link</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">
                 {copyStatus === 'editor' ? 'Copied!' : 'Copy Link'}
               </span>
             </button>
             <button 
               onClick={() => copyLink('image')}
               className="flex flex-col items-center justify-center p-2 rounded bg-[#1f1f1f] hover:bg-[#252525] border border-[#333] transition-colors group"
             >
               <span className="material-symbols-outlined text-gray-400 group-hover:text-white mb-1">image</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">
                 {copyStatus === 'image' ? 'Copied!' : 'Image Link'}
               </span>
             </button>
           </div>
           <p className="text-[10px] text-gray-600 leading-tight">
             Use "Image Link" to embed a live-updating view of this grid in supported apps (Notion, etc.) or as an iframe.
           </p>
        </section>

        {/* Progress Settings */}
        <section className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Progress Settings</h2>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 block">Current Date (Fill up to)</label>
            <div className="flex gap-2">
              <input 
                type="date"
                value={config.date}
                onChange={(e) => updateConfig('date', e.target.value)}
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition-colors font-mono"
              />
              <button 
                onClick={setDateToToday}
                title="Set to Today"
                className="bg-[#222] hover:bg-[#333] border border-[#333] rounded px-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">today</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
             <label className="text-xs text-gray-400 block">Granularity</label>
             <div className="grid grid-cols-3 gap-1 bg-[#1a1a1a] p-1 rounded border border-[#333]">
                {['day', 'week', 'month'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateConfig('granularity', g as any)}
                    className={`text-[10px] uppercase py-1.5 rounded transition-all ${config.granularity === g ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {g}
                  </button>
                ))}
             </div>
          </div>

          {config.granularity === 'day' && (
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="check-monday"
                checked={config.isMondayFirst}
                onChange={(e) => updateConfig('isMondayFirst', e.target.checked)}
                className="accent-orange-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="check-monday" className="text-xs text-gray-400 cursor-pointer">Start week on Monday</label>
            </div>
          )}
        </section>

        {/* Layout Settings */}
        <section className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Grid Layout</h2>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => updateConfig('mode', 'horizontal')}
              className={`text-xs py-2 rounded border transition-all ${config.mode === 'horizontal' ? 'bg-[#222] text-gray-300 border-[#444]' : 'bg-[#1a1a1a] text-gray-500 border-transparent hover:bg-[#333]'}`}
            >
              Horizontal
            </button>
            <button 
              onClick={() => updateConfig('mode', 'vertical')}
              className={`text-xs py-2 rounded border transition-all ${config.mode === 'vertical' ? 'bg-[#222] text-gray-300 border-[#444]' : 'bg-[#1a1a1a] text-gray-500 border-transparent hover:bg-[#333]'}`}
            >
              Vertical
            </button>
          </div>
          
          {config.granularity !== 'day' && (
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Items Per {config.mode === 'horizontal' ? 'Row' : 'Column'}</span>
                <span>{config.itemsPerRow}</span>
              </div>
              <input 
                type="range" min="1" max={config.granularity === 'week' ? 53 : 12} step="1" 
                value={config.itemsPerRow}
                onChange={(e) => updateConfig('itemsPerRow', parseInt(e.target.value))}
              />
            </div>
          )}

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-gray-400"><span>Square Size</span><span>{config.dotSize}px</span></div>
            <input 
              type="range" min="4" max="100" step="1" 
              value={config.dotSize}
              onChange={(e) => updateConfig('dotSize', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400"><span>Gap</span><span>{config.gap}px</span></div>
            <input 
              type="range" min="0" max="50" step="1" 
              value={config.gap}
              onChange={(e) => updateConfig('gap', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400"><span>Roundness</span><span>{config.radius}px</span></div>
            <input 
              type="range" min="0" max="50" step="1" 
              value={config.radius}
              onChange={(e) => updateConfig('radius', parseInt(e.target.value))}
            />
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Color Palette</h2>
          
          {/* Theme Presets */}
          <div className="grid grid-cols-5 gap-1 mb-2">
             {THEMES.map(t => (
               <button 
                 key={t.name}
                 onClick={() => applyTheme(t.colors)}
                 className="w-full aspect-square rounded border border-[#333] hover:border-white transition-colors relative overflow-hidden group"
                 title={t.name}
               >
                 <div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${t.colors.bg} 50%, ${t.colors.fill} 50%)` }}></div>
               </button>
             ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Background', key: 'bg' },
              { label: 'Text', key: 'text' },
              { label: 'Empty Day', key: 'empty' },
              { label: 'Filled Day', key: 'fill' },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase">{label}</label>
                <div className="flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded border border-[#333]">
                  <input 
                    type="color" 
                    value={config.colors[key as keyof AppConfig['colors']]}
                    onChange={(e) => updateColor(key as keyof AppConfig['colors'], e.target.value)}
                  />
                  <span className="text-[10px] font-mono text-gray-400 uppercase">
                    {config.colors[key as keyof AppConfig['colors']]}
                  </span>
                </div>
              </div>
            ))}
            <div className="col-span-2 pt-2 border-t border-[#222]">
               <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="check-transparent"
                  checked={config.transparentBg}
                  onChange={(e) => updateConfig('transparentBg', e.target.checked)}
                  className="accent-orange-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="check-transparent" className="text-xs text-gray-400 cursor-pointer">Transparent Background (Save)</label>
              </div>
            </div>
          </div>
        </section>

        {/* Labels & Font */}
        <section className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Labels & Font</h2>
          
          <div className="flex items-center justify-between">
            <label htmlFor="check-year" className="text-xs text-gray-400 cursor-pointer">Show Year Watermark</label>
            <input 
              type="checkbox" id="check-year"
              checked={config.showYearLabel}
              onChange={(e) => updateConfig('showYearLabel', e.target.checked)}
              className="accent-orange-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <label htmlFor="check-active-label" className="text-xs text-gray-400 cursor-pointer">Show Active Label</label>
                <input 
                  type="checkbox" id="check-active-label"
                  checked={config.showActiveLabel}
                  onChange={(e) => updateConfig('showActiveLabel', e.target.checked)}
                  className="accent-orange-500 w-4 h-4 cursor-pointer"
                />
              </div>
              
              {/* Active Label Format Selector - Only show if active label is enabled */}
              {config.showActiveLabel && config.granularity === 'day' && (
                <div className="pl-2 border-l border-[#333]">
                   <label className="text-[10px] text-gray-500 block mb-1">Label Content</label>
                   <select 
                      value={config.activeLabelFormat || 'date'}
                      onChange={(e) => updateConfig('activeLabelFormat', e.target.value as ActiveLabelFormat)}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                    >
                      <option value="date">Date (13)</option>
                      <option value="week">Week Number (1-53)</option>
                      <option value="day">Day Name (M)</option>
                      <option value="month">Month Name (Jan)</option>
                      <option value="month-date">Date & Month (Jan 13)</option>
                      <option value="full">Combined (Mon 13 Wk2)</option>
                    </select>
                </div>
              )}
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="check-months" className="text-xs text-gray-400 cursor-pointer">
              {config.granularity === 'day' ? 'Show Month Labels' : 'Show Cell Labels'}
            </label>
            <input 
              type="checkbox" id="check-months"
              checked={config.showMonths}
              onChange={(e) => updateConfig('showMonths', e.target.checked)}
              className="accent-orange-500 w-4 h-4 cursor-pointer"
            />
          </div>
          
          {config.granularity === 'day' && (
            <div className="flex items-center justify-between">
              <label htmlFor="check-days" className="text-xs text-gray-400 cursor-pointer">Show Day Labels</label>
              <input 
                type="checkbox" id="check-days"
                checked={config.showDays}
                onChange={(e) => updateConfig('showDays', e.target.checked)}
                className="accent-orange-500 w-4 h-4 cursor-pointer"
              />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400"><span>Label Size</span><span>{config.fontSize}px</span></div>
            <input 
              type="range" min="8" max="32" step="1" 
              value={config.fontSize}
              onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 block">Font Family</label>
            <select 
              value={config.fontFamily}
              onChange={(e) => updateConfig('fontFamily', e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-orange-500"
            >
              <option value="'Inter', sans-serif">Inter (Sans-Serif)</option>
              <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
              <option value="serif">Serif (Classic)</option>
              <option value="cursive">Handwritten</option>
            </select>
          </div>
        </section>

      </div>
    </aside>
  );
};

export default Sidebar;