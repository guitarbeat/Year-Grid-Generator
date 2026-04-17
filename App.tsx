import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import YearGrid from './components/YearGrid';
import { AppConfig } from './types';

// Declare html2canvas for TS since it is loaded via CDN
declare const html2canvas: any;

const STORAGE_KEY = 'year-grid-config-v1';

const DEFAULT_CONFIG: AppConfig = {
  date: new Date().toISOString().split('T')[0],
  mode: 'grid',
  granularity: 'day',
  itemsPerRow: 12,
  isMondayFirst: false,
  showYearLabel: true,
  dotSize: 14,
  gap: 4,
  radius: 2,
  fontSize: 10,
  fontFamily: "'Inter', sans-serif",
  colors: {
    bg: '#0a0a0a',
    text: '#525252',
    empty: '#1f1f1f',
    fill: '#ea580c',
    pastDay: '#ffffff',
    futureDay: '#2c2c2e',
    today: '#ff3b30',
    significant: '#FFD60A',
    weekend: '#515155',
    stats: '#ff9f0a'
  },
  transparentBg: false,
  monthsToShow: 12,
  monthsPerRow: 3,
  monthOffset: 0,
  showDayNumbers: false,
  showWeekNumbers: true,
  showMonthLabels: true,
  showMonthAxis: true,
  showWeekdayAxis: true,
  highlightWeekends: true,
  dimPastDays: true,
  showStats: true,
  showActiveLabel: false,
  activeLabelFormat: 'date',
  startFromJan: false,
  groupBySeason: false,
  showSeasonLabels: true,
  customTitle: '',
  assetFormat: 'auto',
  resolutionScale: 2,
  overrides: {}
};

// --- URL Helpers ---
const encodeConfig = (config: AppConfig): string => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(config)));
  } catch (e) {
    console.warn('Failed to encode config', e);
    return '';
  }
};

const decodeConfig = (str: string): Partial<AppConfig> | null => {
  try {
    if (!str) return null;
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch (e) {
    console.warn('Failed to decode config from URL', e);
    return null;
  }
};

const migrateConfig = (config: Partial<AppConfig>): AppConfig => {
  const migrated = { ...config };
  if (migrated.mode === ('horizontal' as any)) migrated.mode = 'grid';
  if (migrated.mode === ('vertical' as any)) migrated.mode = 'rows';
  
  return {
    ...DEFAULT_CONFIG,
    ...migrated,
    colors: { ...DEFAULT_CONFIG.colors, ...(migrated.colors || {}) },
    overrides: { ...(migrated.overrides || {}) }
  };
};

const App: React.FC = () => {
  // 1. Initialize state from URL > LocalStorage > Default
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const configParam = searchParams.get('config');
      
      let baseConfig: AppConfig;

      if (configParam) {
        const decoded = decodeConfig(configParam);
        baseConfig = decoded ? migrateConfig(decoded) : DEFAULT_CONFIG;
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          baseConfig = migrateConfig(parsed);
        } else {
          baseConfig = DEFAULT_CONFIG;
        }
      }

      // URL Overrides (for iOS Shortcuts and dynamic sharing)
      const dateOverride = searchParams.get('date');
      if (dateOverride === 'today') {
        baseConfig.date = new Date().toISOString().split('T')[0];
      } else if (dateOverride && /^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) {
        baseConfig.date = dateOverride;
      }

      const transparentOverride = searchParams.get('transparent');
      if (transparentOverride === 'true') {
        baseConfig.transparentBg = true;
      } else if (transparentOverride === 'false') {
        baseConfig.transparentBg = false;
      }

      return baseConfig;
    } catch (error) {
      console.warn('Failed to load initial config:', error);
    }
    return DEFAULT_CONFIG;
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize viewMode safely once
  const [viewMode] = useState<'editor' | 'image'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'image' ? 'image' : 'editor';
    } catch {
      return 'editor';
    }
  });

  // 3. Sync Config to URL & LocalStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = encodeConfig(config);
      
      if (params.get('config') !== encoded) {
        params.set('config', encoded);
        window.history.replaceState(null, '', `?${params.toString()}`);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error syncing state:', e);
    }
  }, [config]);

  const resetConfig = () => {
    if (confirm('Reset all configurations to default?')) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const handleCellClick = (id: string) => {
    setConfig(prev => {
      const overrides = { ...(prev.overrides || {}) };
      
      // Simple toggle: default <-> significant (accent color)
      if (overrides[id]) {
        delete overrides[id];
      } else {
        overrides[id] = 'significant';
      }

      return { ...prev, overrides };
    });
  };

  const handleDownload = async () => {
    if (!gridRef.current || typeof html2canvas === 'undefined') {
      alert('Image generation library not loaded yet. Please wait a moment.');
      return;
    }

    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: config.transparentBg ? null : config.colors.bg,
        scale: config.resolutionScale || 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `year-grid-${config.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 3. Render "Image View" (Standalone)
  if (viewMode === 'image') {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center"
        style={{ 
          backgroundColor: config.transparentBg ? 'transparent' : config.colors.bg,
          padding: '0px' // No padding for easier screenshot cropping
        }}
      >
        <YearGrid 
          config={config} 
          className="shadow-none rounded-none !p-12" // Custom padding for the image itself
        />
      </div>
    );
  }

  // 4. Render Standard Editor
  return (
    <div className="h-screen flex bg-[#050505] text-white overflow-hidden relative">
      <Sidebar 
        config={config} 
        setConfig={setConfig} 
        onDownload={handleDownload}
        isDownloading={isDownloading}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        resetConfig={resetConfig}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <PreviewArea config={config} gridRef={gridRef} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onCellClick={handleCellClick} />
      </div>
    </div>
  );
};

export default App;