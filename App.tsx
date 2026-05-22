import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import YearGrid from './components/YearGrid';
import { AppConfig, AppColors } from './types';
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
  keepCellShapeWithNumbers: false,
  showSideDayAxis: false,
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
const KEY_MAP: Record<string, string> = {
  date: 'a',
  mode: 'b',
  granularity: 'c',
  itemsPerRow: 'd',
  isMondayFirst: 'e',
  showYearLabel: 'f',
  dotSize: 'g',
  gap: 'h',
  radius: 'i',
  fontSize: 'j',
  linkFontDotSize: 'k',
  fontFamily: 'l',
  colors: 'm',
  transparentBg: 'n',
  monthsToShow: 'o',
  monthsPerRow: 'p',
  monthOffset: 'q',
  showDayNumbers: 'r',
  keepCellShapeWithNumbers: 's',
  showSideDayAxis: 't',
  showWeekNumbers: 'u',
  showMonthNumbers: 'v',
  showMonthLabels: 'w',
  showMonthAxis: 'x',
  showWeekdayAxis: 'y',
  highlightWeekends: 'z',
  dimPastDays: 'A',
  dimPastDaysStrength: 'B',
  showStats: 'C',
  showActiveLabel: 'D',
  activeLabelFormat: 'E',
  startFromJan: 'F',
  groupBy: 'G',
  showSeasonLabels: 'H',
  seasonsSideBySide: 'I',
  anchorTodayToRealTime: 'J',
  blockAlignment: 'K',
  isLifeMode: 'L',
  birthDate: 'M',
  lifeExpectancy: 'N',
  lifeGranularity: 'O',
  showLifeStats: 'P',
  showQiQuotes: 'Q',
  quotesCategory: 'R',
  selectedQuoteId: 'S',
  customQuoteText: 'T',
  showHeaderPlugin: 'U',
  labelRotation: 'V',
  customTitle: 'W',
  assetFormat: 'X',
  density: 'Y',
  resolutionScale: 'Z',
  overrides: '_',
};

const COLOR_MAP: Record<string, string> = {
  bg: 'bg',
  text: 'tx',
  empty: 'em',
  fill: 'fi',
  pastDay: 'pd',
  futureDay: 'fd',
  today: 'to',
  significant: 'sg',
  weekend: 'wk',
  stats: 'st',
};

// Create reverse maps for decoding
const REV_KEY_MAP: Record<string, keyof AppConfig> = {};
for (const [k, v] of Object.entries(KEY_MAP)) {
  REV_KEY_MAP[v] = k as keyof AppConfig;
}

const REV_COLOR_MAP: Record<string, keyof AppColors> = {};
for (const [k, v] of Object.entries(COLOR_MAP)) {
  REV_COLOR_MAP[v] = k as keyof AppColors;
}

const serializeDiff = (diff: Partial<AppConfig>): any => {
  const result: any = {};
  for (const k of Object.keys(diff) as Array<keyof AppConfig>) {
    const shortKey = KEY_MAP[k] || k;
    if (k === 'colors' && diff.colors) {
      const colorObj: any = {};
      const colorsRef = diff.colors as any;
      for (const ck of Object.keys(colorsRef)) {
        const shortColKey = COLOR_MAP[ck] || ck;
        let val = colorsRef[ck];
        if (typeof val === 'string' && val.startsWith('#')) {
          val = val.substring(1);
        }
        colorObj[shortColKey] = val;
      }
      result[shortKey] = colorObj;
    } else if (k === 'overrides' && diff.overrides) {
      const keys = Object.keys(diff.overrides);
      result[shortKey] = keys.map(id => id.startsWith('day-') ? id.slice(4) : id);
    } else {
      result[shortKey] = diff[k];
    }
  }
  return result;
};

const deserializeDiff = (compressed: any): Partial<AppConfig> => {
  const result: any = {};
  for (const k of Object.keys(compressed)) {
    const longKey = REV_KEY_MAP[k] || k;
    if (longKey === 'colors') {
      const colorObj: any = {};
      const compressedColors = compressed[k] || {};
      for (const ck of Object.keys(compressedColors)) {
        const longColKey = REV_COLOR_MAP[ck] || ck;
        let val = compressedColors[ck];
        if (typeof val === 'string' && /^[0-9A-Fa-f]{3,8}$/.test(val)) {
          val = '#' + val;
        }
        colorObj[longColKey] = val;
      }
      result[longKey] = colorObj;
    } else if (longKey === 'overrides') {
      const arr = compressed[k];
      const overridesObj: Record<string, string> = {};
      if (Array.isArray(arr)) {
        for (const rawId of arr) {
          const id = (rawId.split('-').length >= 3 && !rawId.startsWith('day-')) ? `day-${rawId}` : rawId;
          overridesObj[id] = 'significant';
        }
      }
      result[longKey] = overridesObj;
    } else {
      result[longKey] = compressed[k];
    }
  }
  return result;
};

const getDiffConfig = (config: AppConfig): Partial<AppConfig> => {
  const diff: any = {};
  for (const key of Object.keys(config) as Array<keyof AppConfig>) {
    if (key === 'colors') {
      const colorDiff: any = {};
      const currentColors = config.colors || {};
      const defaultColors = DEFAULT_CONFIG.colors || {};
      for (const ck of Object.keys(currentColors) as Array<keyof typeof currentColors>) {
        if (currentColors[ck] !== defaultColors[ck]) {
          colorDiff[ck] = currentColors[ck];
        }
      }
      if (Object.keys(colorDiff).length > 0) {
        diff.colors = colorDiff;
      }
    } else if (key === 'overrides') {
      const currentOverrides = config.overrides || {};
      const defaultOverrides = DEFAULT_CONFIG.overrides || {};
      if (JSON.stringify(currentOverrides) !== JSON.stringify(defaultOverrides)) {
        diff.overrides = currentOverrides;
      }
    } else {
      if (config[key] !== DEFAULT_CONFIG[key]) {
        diff[key] = config[key];
      }
    }
  }
  return diff;
};

const encodeConfig = (config: AppConfig): string => {
  try {
    const diff = getDiffConfig(config);
    const compressed = serializeDiff(diff);
    return btoa(unescape(encodeURIComponent(JSON.stringify(compressed))));
  } catch (e) {
    console.warn('Failed to encode config', e);
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    } catch {
      return '';
    }
  }
};

const decodeConfig = (str: string): Partial<AppConfig> | null => {
  try {
    if (!str) return null;
    const trimmed = str.trim();
    let rawParsed: any = null;
    
    if (trimmed.startsWith('%7B') || trimmed.startsWith('{')) {
      rawParsed = JSON.parse(decodeURIComponent(trimmed));
    } else {
      try {
        rawParsed = JSON.parse(decodeURIComponent(escape(atob(trimmed))));
      } catch {
        try {
          rawParsed = JSON.parse(decodeURIComponent(atob(trimmed)));
        } catch {
          rawParsed = JSON.parse(decodeURIComponent(trimmed));
        }
      }
    }
    
    // Check if it's the new compressed format
    const hasShortKeys = Object.keys(rawParsed).some(k => k.length <= 2);
    if (hasShortKeys) {
      return deserializeDiff(rawParsed);
    }
    return rawParsed;
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

  // --- State History Management (Undo / Redo) ---
  const pastRef = useRef<AppConfig[]>([]);
  const futureRef = useRef<AppConfig[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  const prevConfigRef = useRef<AppConfig>(config);
  const isUndoRedoRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const continuousStartConfigRef = useRef<AppConfig | null>(null);

  const updateHistoryFlags = () => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };

  useEffect(() => {
    const prev = prevConfigRef.current;
    prevConfigRef.current = config;

    if (JSON.stringify(prev) === JSON.stringify(config)) {
      return;
    }

    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      updateHistoryFlags();
      return;
    }

    const areColorsEqual = JSON.stringify(prev.colors) === JSON.stringify(config.colors);

    const isContinuousChange = 
      prev.dotSize !== config.dotSize ||
      prev.gap !== config.gap ||
      prev.radius !== config.radius ||
      prev.fontSize !== config.fontSize ||
      prev.dimPastDaysStrength !== config.dimPastDaysStrength ||
      prev.itemsPerRow !== config.itemsPerRow ||
      prev.customQuoteText !== config.customQuoteText ||
      prev.customTitle !== config.customTitle ||
      prev.monthsToShow !== config.monthsToShow ||
      prev.monthsPerRow !== config.monthsPerRow ||
      prev.lifeExpectancy !== config.lifeExpectancy ||
      !areColorsEqual;

    if (isContinuousChange) {
      if (!continuousStartConfigRef.current) {
        continuousStartConfigRef.current = prev;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (continuousStartConfigRef.current) {
          const startState = continuousStartConfigRef.current;
          continuousStartConfigRef.current = null;

          futureRef.current = [];
          const newPast = [...pastRef.current, startState];
          if (newPast.length > 100) {
            newPast.shift();
          }
          pastRef.current = newPast;
          updateHistoryFlags();
        }
        debounceTimerRef.current = null;
      }, 500);
    } else {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      let updatedPast = [...pastRef.current];
      if (continuousStartConfigRef.current) {
        updatedPast.push(continuousStartConfigRef.current);
        continuousStartConfigRef.current = null;
      }

      updatedPast.push(prev);
      if (updatedPast.length > 100) {
        updatedPast = updatedPast.slice(-100);
      }

      futureRef.current = [];
      pastRef.current = updatedPast;
      updateHistoryFlags();
    }
  }, [config]);

  const handleUndo = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      
      if (continuousStartConfigRef.current) {
        const startState = continuousStartConfigRef.current;
        continuousStartConfigRef.current = null;
        
        setConfig(prev => {
          futureRef.current = [prev, ...futureRef.current];
          return startState;
        });
        isUndoRedoRef.current = true;
        updateHistoryFlags();
        return;
      }
    }

    if (pastRef.current.length === 0) return;

    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    
    setConfig(prev => {
      futureRef.current = [prev, ...futureRef.current];
      return previous;
    });
    
    isUndoRedoRef.current = true;
    updateHistoryFlags();
  };

  const handleRedo = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      if (continuousStartConfigRef.current) {
        pastRef.current = [...pastRef.current, continuousStartConfigRef.current];
        continuousStartConfigRef.current = null;
      }
    }

    if (futureRef.current.length === 0) return;

    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    
    setConfig(prev => {
      pastRef.current = [...pastRef.current, prev];
      return next;
    });
    
    isUndoRedoRef.current = true;
    updateHistoryFlags();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const hasMetaOrCtrl = e.metaKey || e.ctrlKey;
      
      if (hasMetaOrCtrl && isZ) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (hasMetaOrCtrl && isY) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        <pwa-install
          manifest-url="/manifest.json"
          name="MEMENTO"
          description="A minimalist temporal visualizer and memento mori generator."
          icon="/icon.svg"
        ></pwa-install>
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
          <PreviewArea 
            config={config} 
            gridRef={gridRef} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onCellClick={handleCellClick} 
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
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