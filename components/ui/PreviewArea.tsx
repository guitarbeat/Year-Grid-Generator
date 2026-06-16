import React, { useState, useRef, useEffect } from 'react';
import YearGrid from '../YearGrid';
import { AppConfig } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize2, Undo, Redo } from 'lucide-react';

interface PreviewAreaProps {
  config: AppConfig;
  gridRef: React.RefObject<HTMLDivElement>;
  onCellClick: (id: string) => void;
  isDownloading: boolean;
  zoom: number;
  setZoom: (z: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedCellId: string | null;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  config,
  gridRef,
  onCellClick,
  isDownloading,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedCellId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking floating bar or interactive button, don't initiate panning
    if ((e.target as HTMLElement).closest('.no-pan')) return;
    if (!containerRef.current) return;
    setIsPanning(true);
    startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPosition({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => setIsPanning(false);

  const fitToScreen = () => {
    if (!mainRef.current || !gridRef.current) return;
    const container = mainRef.current;
    const content = gridRef.current;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;
    if (contentW === 0 || contentH === 0) return;

    const padding = 40;
    const scaleX = Math.max(0, containerW - padding) / contentW;
    const scaleY = Math.max(0, containerH - padding) / contentH;
    
    setZoom(Math.min(Math.max(Math.min(scaleX, scaleY), 0.05), 3.0));
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const t = setTimeout(fitToScreen, 150);
    return () => clearTimeout(t);
  }, [config.mode, config.granularity, config.monthsToShow, config.monthsPerRow, config.itemsPerRow, config.gap, config.dotSize, config.showMonthAxis]);

  // Handle cross-component fit-to-screen triggers cleanly via custom event
  useEffect(() => {
    const handleFit = () => fitToScreen();
    window.addEventListener('fit-grid-to-screen', handleFit);
    return () => window.removeEventListener('fit-grid-to-screen', handleFit);
  }, [config.mode, config.granularity, config.monthsToShow, config.monthsPerRow, config.itemsPerRow, config.gap, config.dotSize, config.showMonthAxis]);

  return (
    <main 
      ref={mainRef}
      className="flex-1 bg-[#050505] relative flex items-center justify-center overflow-hidden h-full w-full"
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      <div 
        ref={containerRef}
         className={`origin-center drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] cursor-pointer ${isPanning ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'}`}
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}
      >
        <YearGrid config={config} domRef={gridRef} onCellClick={onCellClick} isDownloading={isDownloading} selectedCellId={selectedCellId} />
      </div>

      {/* Control Dock */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 no-pan select-none">
        <motion.div 
          initial={{ y: -24, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 400, damping: 24, delay: 0.15 }}
          className="flex items-center gap-2.5 p-1.5 rounded-full bg-zinc-950/85 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-shadow duration-300 hover:border-white/15"
        >
          {/* History Operations Pill */}
          <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] p-0.5 rounded-full">
            <motion.button
              whileHover={canUndo ? { scale: 1.1 } : {}}
              whileTap={canUndo ? { scale: 0.96 } : {}}
              disabled={!canUndo}
              onClick={(e) => { e.stopPropagation(); onUndo(); }}
              className="relative before:absolute before:-inset-1 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors cursor-pointer"
              title="Undo custom edit"
            >
              <Undo className="relative w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              whileHover={canRedo ? { scale: 1.1 } : {}}
              whileTap={canRedo ? { scale: 0.96 } : {}}
              disabled={!canRedo}
              onClick={(e) => { e.stopPropagation(); onRedo(); }}
              className="relative before:absolute before:-inset-1 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors cursor-pointer"
              title="Redo custom edit"
            >
              <Redo className="relative w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="w-[1px] h-4 bg-white/10" />

          {/* Lens Scale Controller Pill */}
          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] px-1 py-0.5 rounded-full">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.stopPropagation(); setZoom(Math.max(0.05, zoom - 0.1)); }}
              className="relative before:absolute before:-inset-1 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="relative w-3.5 h-3.5" />
            </motion.button>

            <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 min-w-[48px] text-center text-zinc-350 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.stopPropagation(); setZoom(Math.min(3.0, zoom + 0.1)); }}
              className="relative before:absolute before:-inset-1 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="relative w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="w-[1px] h-4 bg-white/10" />

          {/* Viewport Action Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); fitToScreen(); }}
            className="relative before:absolute before:-inset-1 w-8 h-8 rounded-full flex items-center justify-center text-accent hover:text-white bg-accent/10 border border-accent/20 hover:bg-accent/25 transition-colors cursor-pointer"
            title="Fit visual grid to screen"
          >
            <Maximize2 className="relative w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
};

