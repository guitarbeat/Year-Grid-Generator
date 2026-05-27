import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import YearGrid from './components/YearGrid';
import { AppConfig } from './types';
import html2canvas from 'html2canvas';
import { DynamicIslandTOC } from './components/ui/dynamic-island-toc';
import { MotionConfig } from 'motion/react';
import { QUOTES } from './utils/quotes';
import { useHistory } from './hooks/useHistory';
import {
  DEFAULT_CONFIG,
  STORAGE_KEY,
  decodeConfig,
  encodeConfig,
  migrateConfig
} from './utils/configSync';

// Augment Window interface directly here so we don't need ignore
declare global {
  interface Window {
    __imageBase64?: string;
    __imageBase64Error?: string;
  }
}

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

  const { canUndo, canRedo, handleUndo, handleRedo } = useHistory(config, setConfig);

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
        } catch (e: unknown) {
          console.error("Auto-export failed", e);
          const errorMessage = e instanceof Error ? e.message : String(e);
          window.__imageBase64Error = errorMessage || "Unknown rendering error";
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
      // Wait for React state, Framer MotionConfig, and transitions to settle
      await new Promise(resolve => setTimeout(resolve, 150));

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

  const handleDownloadSvg = async () => {
    if (!gridRef.current) {
      alert('Could not find grid element. Please try again.');
      return;
    }

    setIsDownloading(true);
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // Wait for React state, Framer MotionConfig, and transitions to settle
      await new Promise(resolve => setTimeout(resolve, 150));

      const { toSvg } = await import('html-to-image');
      
      const svgDataUrl = await toSvg(gridRef.current, {
        backgroundColor: config.transparentBg ? null : config.colors.bg,
        pixelRatio: config.resolutionScale || 2,
      });

      const link = document.createElement('a');
      link.download = `year-grid-${config.date}.svg`;
      link.href = svgDataUrl;
      link.click();
    } catch (error) {
      console.error('SVG Download failed:', error);
      alert('Failed to generate SVG. Please try again.');
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

  // Auto-trigger download if requested
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('triggerDownload') === 'true') {
      const waitAndDownload = async () => {
        // Wait for gridRef to be populated
        let attempts = 0;
        while(!gridRef.current && attempts < 50) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        if (gridRef.current) {
          await handleDownload();
        }
      };
      waitAndDownload();
    }
  }, []);

  // 4. Render Standard Editor
  return (
    <MotionConfig reducedMotion="user">
      <div className="h-screen h-[100dvh] flex bg-[#050505] text-white overflow-hidden relative">
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
          onDownloadSvg={handleDownloadSvg}
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
            isDownloading={isDownloading}
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