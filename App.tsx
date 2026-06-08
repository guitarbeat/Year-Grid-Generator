import React, { useState, useRef, useEffect } from 'react';
import YearGrid from './components/YearGrid';
import { AppConfig } from './types';
import { SystemHUD } from './components/ui/SystemHUD';
import { MotionConfig } from 'motion/react';
import { useHistory } from './hooks/useHistory';
import { useAppConfig } from './hooks/useAppConfig';
import { useUIState } from './hooks/useUIState';
import { useExport } from './hooks/useExport';

// --- Local Components --- //

import { PreviewArea } from './components/ui/PreviewArea';

// --- App Root --- //

// Augment Window interface directly here so we don't need ignore
declare global {
  interface Window {
    __imageBase64?: string;
    __imageBase64Error?: string;
  }
}

const App: React.FC = () => {
  const { config, setConfig, resetConfig, toggleOverride } = useAppConfig();
  const { isDownloading, setIsDownloading, zoom, setZoom, viewMode, isExpanded, setIsExpanded } = useUIState();
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const { handleDownload, handleDownloadSvg, handleBase64Export } = useExport(gridRef, config, setIsDownloading);
  
  // 1. Initialize viewMode removed: managed by useUIState()
 
  const { canUndo, canRedo, handleUndo, handleRedo } = useHistory(config, setConfig);

  const handleCellClick = (id: string) => {
    setSelectedCellId(id);
    setIsExpanded(true);
    // If not already in overrides, toggle it so it's active as a milestone
    if (!config.overrides[id]) {
      toggleOverride(id);
    }
  };
  
  // Export Base64 Hook
  useEffect(() => {
    if (viewMode === 'export_base64') {
      let isCancelled = false;
      const capture = async () => {
        try {
          const base64 = await handleBase64Export();
          if (!isCancelled) {
            window.__imageBase64 = base64 || "";
          }
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
  }, [viewMode, handleBase64Export]);

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
  }, [handleDownload]);

  // 4. Render Standard Editor
  return (
    <MotionConfig reducedMotion="user">
      <div className="h-screen h-[100dvh] flex bg-[#050505] text-white overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0">
          <PreviewArea 
            config={config} 
            gridRef={gridRef} 
            onCellClick={handleCellClick}
            isDownloading={isDownloading}
            zoom={zoom}
            setZoom={setZoom}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>

        <SystemHUD 
          config={config} 
          setConfig={setConfig} 
          selectedCellId={selectedCellId}
          setSelectedCellId={setSelectedCellId}
          onDownload={handleDownload}
          onDownloadSvg={handleDownloadSvg}
          isDownloading={isDownloading}
          resetConfig={resetConfig}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoom={zoom}
          setZoom={setZoom}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>
    </MotionConfig>
  );
};


export default App;