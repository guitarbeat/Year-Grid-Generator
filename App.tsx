import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import YearGrid from './components/YearGrid';
import { AppConfig } from './types';
import html2canvas from 'html2canvas';
import { DynamicIslandTOC } from './components/ui/dynamic-island-toc';
import { MotionConfig } from 'motion/react';
import { QUOTES } from './utils/quotes';

// Augment Window interface directly here so we don't need ignore
declare global {
  interface Window {
    __imageBase64?: string;
    __imageBase64Error?: string;
  }
}

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
  linkFontDotSize: true,
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
  showDayNumbers: false,
  showWeekNumbers: true,
  showMonthNumbers: false,
  showMonthLabels: true,
  showMonthAxis: true,
  showWeekdayAxis: true,
  highlightWeekends: true,
  dimPastDays: true,
  dimPastDaysStrength: 50,
  showStats: true,
  showActiveLabel: false,
  activeLabelFormat: 'date',
  startFromJan: false,
  groupBy: 'none',
  showSeasonLabels: true,
  seasonsSideBySide: false,
  anchorTodayToRealTime: true,
  blockAlignment: 'top',
  density: 'normal',
  isLifeMode: false,
  birthDate: '2000-01-01',
  lifeExpectancy: 80,
  lifeGranularity: 'week',
  showLifeStats: true,
  showQiQuotes: true,
  quotesCategory: 'all',
  selectedQuoteId: 'seneca-1',
  customQuoteText: '',
  showHeaderPlugin: false,
  labelRotation: 0,
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
    const trimmed = str.trim();
    // Try to detect URL-encoded or raw JSON directly first
    if (trimmed.startsWith('%7B') || trimmed.startsWith('{')) {
      return JSON.parse(decodeURIComponent(trimmed));
    }
    // Otherwise, try base64 decoding
    try {
      return JSON.parse(decodeURIComponent(atob(trimmed)));
    } catch {
      // Fallback to plain decodeURIComponent if atob fails
      return JSON.parse(decodeURIComponent(trimmed));
    }
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
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  
  // Initialize viewMode safely once
  const [viewMode] = useState<'editor' | 'image' | 'export_base64'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      return (view === 'image' || view === 'export_base64') ? view : 'editor';
    } catch {
      return 'editor';
    }
  });

  // Export Base64 Hook
  useEffect(() => {
    if (viewMode === 'export_base64') {
      let isCancelled = false;
      const capture = async () => {
        // Wait up to 5 seconds for gridRef to become available
        let attempts = 0;
        while (!gridRef.current && attempts < 50) {
          if (isCancelled) return;
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }

        if (!gridRef.current) {
          window.__imageBase64Error = "Grid reference element was never mounted.";
          return;
        }

        try {
          // Fast settle delay so DOM elements are fully mounted (no transitions in export mode means zero lag)
          await new Promise(r => setTimeout(r, 50));

          // Capping scale at 1.2 is critical for iOS Extension / Scriptable RAM limits (Jetsam)
          const scale = 1.2;

          const canvasPromise = html2canvas(gridRef.current, {
            backgroundColor: config.transparentBg ? null : config.colors.bg,
            scale,
            logging: false,
            useCORS: false, // Turn off for base64 to avoid cross-origin font/stylesheet stalls
          });

          // Defensive 8-second timeout on the rendering promise to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("html2canvas generation timed out after 8000ms")), 8000)
          );

          const canvas = await Promise.race([canvasPromise, timeoutPromise]);
          
          if (isCancelled) return;
          window.__imageBase64 = canvas.toDataURL('image/png');
        } catch (e: any) {
          console.error("Auto-export failed", e);
          window.__imageBase64Error = e?.message || e?.toString() || "Unknown rendering error";
        }
      };
      
      capture();
      return () => {
        isCancelled = true;
      };
    }
  }, [viewMode, config]);

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
    if (id === 'action:cycle-quote') {
      setConfig(prev => {
        const cat = prev.quotesCategory || 'all';
        const filtered = cat !== 'all'
          ? QUOTES.filter(q => q.category === cat)
          : QUOTES;
        if (filtered.length === 0) return prev;
        const currentIndex = filtered.findIndex(q => q.id === prev.selectedQuoteId);
        const nextIndex = (currentIndex + 1) % filtered.length;
        const nextQuote = filtered[nextIndex] || filtered[0];
        return {
          ...prev,
          selectedQuoteId: nextQuote?.id || 'seneca-1'
        };
      });
      return;
    }

    setSelectedCellId(id);
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
    if (!gridRef.current) {
      alert('Could not find grid element. Please try again.');
      return;
    }

    setIsDownloading(true);
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
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
  if (viewMode === 'image' || viewMode === 'export_base64') {
    return (
      <MotionConfig reducedMotion="always" transition={{ duration: 0 }}>
        <div 
          className="min-h-screen w-full flex items-center justify-center"
          style={{ 
            backgroundColor: config.transparentBg ? 'transparent' : config.colors.bg,
            padding: '0px', // No padding for easier screenshot cropping
            minWidth: 'max-content'
          }}
        >
          <YearGrid 
            config={config} 
            domRef={gridRef}
            className="shadow-none rounded-none !p-12 flex-shrink-0" // Custom padding for the image itself
          />
        </div>
      </MotionConfig>
    );
  }

  // 4. Render Standard Editor
  return (
    <MotionConfig reducedMotion="user">
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

        <DynamicIslandTOC 
          config={config} 
          setConfig={setConfig} 
          onDownload={handleDownload} 
          isDownloading={isDownloading}
          selectedCellId={selectedCellId}
          setSelectedCellId={setSelectedCellId}
        />
      </div>
    </MotionConfig>
  );
};

export default App;