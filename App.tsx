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
  mode: 'horizontal',
  granularity: 'day',
  itemsPerRow: 12,
  isMondayFirst: false,
  showMonths: true,
  showDays: true,
  showYearLabel: true,
  showActiveLabel: false,
  activeLabelFormat: 'date',
  dotSize: 14,
  gap: 4,
  radius: 2,
  fontSize: 10,
  fontFamily: "'Inter', sans-serif",
  colors: {
    bg: '#0a0a0a',
    text: '#525252',
    empty: '#1f1f1f',
    fill: '#ea580c'
  },
  transparentBg: false
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

const App: React.FC = () => {
  // 1. Initialize state from URL > LocalStorage > Default
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const configParam = searchParams.get('config');
      
      if (configParam) {
        const decoded = decodeConfig(configParam);
        if (decoded) {
          return {
            ...DEFAULT_CONFIG,
            ...decoded,
            colors: { ...DEFAULT_CONFIG.colors, ...(decoded.colors || {}) }
          };
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          colors: { ...DEFAULT_CONFIG.colors, ...(parsed.colors || {}) }
        };
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error);
    }
    return DEFAULT_CONFIG;
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Initialize viewMode safely once
  const [viewMode] = useState<'editor' | 'image'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'image' ? 'image' : 'editor';
    } catch {
      return 'editor';
    }
  });

  // 2. Sync Config to URL & LocalStorage
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
        scale: 3,
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
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{ backgroundColor: config.transparentBg ? 'transparent' : config.colors.bg }}
      >
        <YearGrid config={config} />
      </div>
    );
  }

  // 4. Render Standard Editor
  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#050505] text-white overflow-hidden">
      <Sidebar 
        config={config} 
        setConfig={setConfig} 
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      <PreviewArea config={config} gridRef={gridRef} />
    </div>
  );
};

export default App;