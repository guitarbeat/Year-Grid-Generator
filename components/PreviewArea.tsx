import React, { useState, useRef } from 'react';
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
          className="md:hidden w-10 h-10 bg-[#161616] rounded flex items-center justify-center border border-[#222] text-accent pointer-events-auto shadow-xl transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">menu</span>
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
          onClick={() => handleZoom(-0.1)}
          className="shadow-2xl"
        />
        <Button 
          variant="action"
          className="w-auto px-6 md:px-4 text-[11px] md:text-[10px] shadow-2xl"
          label="Reset"
          onClick={fitToScreen}
        />
        <Button 
          variant="action"
          icon="add"
          onClick={() => handleZoom(0.1)}
          className="shadow-2xl"
        />
      </div>

      {/* Render Content */}
      {/* ⚡ Bolt: Disabled transition-transform during panning to ensure 1:1 mouse tracking without visual lag */}
      <div 
        ref={containerRef}
        className={`${!isPanning ? 'transition-transform duration-300 ease-out' : ''} origin-center drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] cursor-pointer`}
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
