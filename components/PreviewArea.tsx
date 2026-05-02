import React, { useState, useRef, useEffect } from 'react';
import { AppConfig } from '../types';
import YearGrid from './YearGrid';
import { Button } from './ui/Controls';

interface PreviewAreaProps {
  config: AppConfig;
  gridRef: React.RefObject<HTMLDivElement>;
  onToggleSidebar?: () => void;
  onCellClick?: (id: string) => void;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({ config, gridRef, onToggleSidebar, onCellClick }) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsPanning(true);
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => setIsPanning(false);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.05, Math.min(3.0, prev + delta)));
  };
  
  const fitToScreenRef = useRef<() => void>(() => {});
  const handleZoomRef = useRef<(delta: number) => void>(() => {});

  useEffect(() => {
    handleZoomRef.current = handleZoom;
  }, [zoom]); // Add zoom as dependency to correctly apply relative zoom

  const fitToScreen = () => {
    if (!mainRef.current || !gridRef.current) return;
    
    const container = mainRef.current;
    const content = gridRef.current;
    
    // Get dimensions
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;
    
    if (contentW === 0 || contentH === 0) return;

    const padding = 40;
    const availableW = Math.max(0, containerW - padding);
    const availableH = Math.max(0, containerH - padding);
    
    const scaleX = availableW / contentW;
    const scaleY = availableH / contentH;
    
    const newZoom = Math.min(scaleX, scaleY);
    const clampedZoom = Math.min(Math.max(newZoom, 0.05), 3.0);
    
    setZoom(clampedZoom);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    fitToScreenRef.current = fitToScreen;
  }, [fitToScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore modifier keys to allow browser native zoom
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === '+' || e.key === '=' || e.key === 'NumpadAdd') {
        handleZoomRef.current(0.1);
      } else if (e.key === '-' || e.key === '_' || e.key === 'NumpadSubtract') {
        handleZoomRef.current(-0.1);
      } else if (e.key === '0' || e.key === 'Numpad0') {
        fitToScreenRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main 
      ref={mainRef}
      className="flex-1 bg-[#050505] relative flex items-center justify-center overflow-hidden h-full w-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ 
        cursor: isPanning ? 'grabbing' : 'grab',
        backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* HUD Info */}
      <div className="absolute top-6 left-6 flex items-center gap-4 z-10 select-none">
        <button 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="md:hidden w-10 h-10 bg-[#161616] rounded flex items-center justify-center border border-[#222] text-accent pointer-events-auto shadow-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
        >
          <span className="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>
        <div className="flex flex-col gap-1 pointer-events-none opacity-40">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{config.mode} view</span>
          <span className="text-[8px] font-mono uppercase tracking-[0.2em]">{Math.round(zoom * 100)}% zoom</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex gap-2 md:gap-1.5 z-10 select-none" onMouseDown={e => e.stopPropagation()}>
        <Button 
          variant="action"
          icon="remove"
          aria-label="Zoom out"
          title="Zoom out (-)"
          onClick={() => handleZoom(-0.1)}
          className="shadow-2xl"
        />
        <Button 
          variant="action"
          className="w-auto px-6 md:px-4 text-[11px] md:text-[10px] shadow-2xl"
          label="Reset"
          title="Reset zoom (0)"
          onClick={fitToScreen}
        />
        <Button 
          variant="action"
          icon="add"
          aria-label="Zoom in"
          title="Zoom in (+)"
          onClick={() => handleZoom(0.1)}
          className="shadow-2xl"
        />
      </div>

      {/* Render Content */}
      <div 
        ref={containerRef}
        className={`origin-center drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] cursor-pointer ${
          isPanning ? '!transition-none !duration-0' : 'transition-transform duration-300 ease-out'
        }`}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        }}
      >
        <YearGrid config={config} domRef={gridRef} onCellClick={onCellClick} />
      </div>
    </main>
  );
};

export default PreviewArea;
