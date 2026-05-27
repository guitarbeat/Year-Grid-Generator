import React, { useState, useRef } from 'react';
import { AppConfig } from '../types';
import YearGrid from './YearGrid';
import { Button } from './ui/Controls';

interface PreviewAreaProps {
  config: AppConfig;
  gridRef: React.RefObject<HTMLDivElement>;
  onToggleSidebar?: () => void;
  onCellClick?: (id: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isDownloading?: boolean;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({ 
  config, 
  gridRef, 
  onToggleSidebar, 
  onCellClick,
  canUndo = false,
  canRedo = false,
  onUndo = () => {},
  onRedo = () => {},
  isDownloading = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [is3D, setIs3D] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsPanning(true);
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
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

  // Auto-fit when major config elements modify structural size
  React.useEffect(() => {
    const t = setTimeout(() => {
      fitToScreen();
    }, 150);
    return () => clearTimeout(t);
  }, [
    config.mode, 
    config.granularity, 
    config.monthsToShow, 
    config.groupBy,
    config.monthsPerRow,
    config.itemsPerRow,
    config.gap,
    config.dotSize,
    config.showMonthAxis
  ]);

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
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out z-[0]"
        style={{
          background: `radial-gradient(1200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(234, 88, 12, 0.08), transparent 40%)`
        }}
      />
      {/* HUD Info */}
      <div 
        id="layout-hud-heading"
        data-toc 
        data-toc-depth="2" 
        data-toc-title={`PREVIEW: ${config.mode.toUpperCase()}`}
        className="absolute top-6 left-6 flex items-center gap-4 z-10 select-none animate-fade-in"
      >
        <button 
          onClick={onToggleSidebar}
          className="md:hidden w-10 h-10 bg-[#0c0c0f]/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-zinc-805 text-accent pointer-events-auto shadow-xl transition-[scale,border-color,background-color,color] active:scale-[0.96] duration-150"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex flex-col gap-0.5 pointer-events-none md:hidden text-left">
          <span className="text-[13px] font-extrabold tracking-[0.2em] text-white">MEMENTO</span>
          <span className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-[#ea580c]">{config.mode} view</span>
        </div>
        <div className="hidden md:flex flex-col gap-0.5 pointer-events-none opacity-40 text-left select-none">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-300">{config.mode} view</span>
          <span className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-zinc-400 tabular-nums">{Math.round(zoom * 100)}% zoom</span>
        </div>
      </div>

      {/* Undo/Redo History HUD Controls */}
      <div 
        className="absolute top-6 right-6 flex items-center gap-1 p-1 bg-[#09090b]/80 backdrop-blur-md border border-zinc-800/60 rounded-xl z-20 select-none shadow-[0_12px_40px_-8px_rgba(0,0,0,0.85)] animate-fade-in"
        onMouseDown={e => e.stopPropagation()}
      >
        <Button 
          variant="action"
          icon="undo"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo change (Ctrl+Z)"
          className="!w-9 !h-9 !bg-transparent hover:!bg-white/5 !border-0 !shadow-none disabled:!opacity-20 text-zinc-400 hover:text-white"
        />
        <div className="w-[1px] h-4 bg-zinc-800/80" />
        <Button 
          variant="action"
          icon="redo"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo change (Ctrl+Y / Ctrl+Shift+Z)"
          className="!w-9 !h-9 !bg-transparent hover:!bg-white/5 !border-0 !shadow-none disabled:!opacity-20 text-zinc-400 hover:text-white"
        />
      </div>

      {/* Zoom Controls HUD Deck */}
      <div 
        className="absolute bottom-6 right-6 flex items-center gap-1 p-1 bg-[#09090b]/80 backdrop-blur-md border border-zinc-800/60 rounded-xl z-10 select-none shadow-[0_12px_40px_-8px_rgba(0,0,0,0.85)]" 
        onMouseDown={e => e.stopPropagation()}
      >
        <Button 
          variant="action"
          icon="remove"
          onClick={() => handleZoom(-0.1)}
          className="!w-9 !h-9 !bg-transparent hover:!bg-white/5 !border-0 !shadow-none text-zinc-400"
        />
        <div className="w-[1px] h-4 bg-zinc-800/80" />
        <Button 
          variant="action"
          className="w-auto !h-9 px-4 text-[10px] !bg-transparent hover:!bg-white/5 !border-0 !shadow-none text-zinc-300 hover:text-white"
          label="Fit View"
          onClick={fitToScreen}
        />
        <div className="w-[1px] h-4 bg-zinc-800/80" />
        <Button 
          variant="action"
          icon="add"
          onClick={() => handleZoom(0.1)}
          className="!w-9 !h-9 !bg-transparent hover:!bg-white/5 !border-0 !shadow-none text-zinc-400"
        />
        <div className="w-[1px] h-4 bg-zinc-800/80" />
        <Button 
          variant="action"
          icon="view_in_ar"
          onClick={() => setIs3D(!is3D)}
          className={`!w-9 !h-9 !bg-transparent hover:!bg-white/5 !border-0 !shadow-none ${is3D ? 'text-accent' : 'text-zinc-400'}`}
          title="Toggle 3D Perspective"
        />
      </div>

      {/* Render Content */}
      <div 
        ref={containerRef}
        className={`origin-center drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] cursor-pointer ${
          isPanning ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
        }`}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) ${is3D ? 'rotateX(55deg) rotateZ(-40deg) translateY(-100px) scale3d(1.2, 1.2, 1.2)' : ''}`,
          transformStyle: 'preserve-3d',
          perspective: '1200px'
        }}
      >
        <YearGrid config={config} domRef={gridRef} onCellClick={onCellClick} isDownloading={isDownloading} />
      </div>
    </main>
  );
};

export default PreviewArea;
