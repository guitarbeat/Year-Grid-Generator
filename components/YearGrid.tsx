import React, { useMemo, useState, useEffect } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { AppConfig } from '../types';
import { useGridData } from '../hooks/useGridData';
import { CalendarView } from './views/CalendarView';
import { FlatWeeks, FlatMonths } from './views/FlatViews';
import { Timeline } from './views/Timeline';
import { StatsBar } from './ui/StatsBar';
import { LifeView } from './views/LifeView';

interface YearGridProps {
  config: AppConfig;
  className?: string;
  domRef?: React.RefObject<HTMLDivElement>;
  onCellClick?: (id: string) => void;
  isDownloading?: boolean;
}

const YearGrid: React.FC<YearGridProps> = ({ config, className, domRef, onCellClick, isDownloading = false }) => {
  const targetDate = useMemo(() => {
    const d = new Date(config.date);
    if (isNaN(d.getTime())) return new Date();
    const parts = config.date.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }, [config.date]);

  const months = useGridData(targetDate, config);
  const currentYear = targetDate.getFullYear();

  const renderContent = () => {
    if (config.isLifeMode) {
      return <LifeView config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} isDownloading={isDownloading} />;
    }

    if (config.mode === 'timeline') {
      return <Timeline config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} isDownloading={isDownloading} />;
    }

    if (config.granularity === 'month') {
      return <FlatMonths config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} isDownloading={isDownloading} />;
    }

    if (config.granularity === 'week' && config.mode === 'grid') { // Original logic for flat weeks
      return <FlatWeeks config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} isDownloading={isDownloading} />;
    }

    return <CalendarView config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} isDownloading={isDownloading} />;
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: config.transparentBg ? 'transparent' : config.colors.bg,
    color: config.colors.text,
    fontFamily: config.fontFamily,
    padding: `${Math.max(24, config.fontSize * 3)}px`,
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: `${Math.max(16, config.fontSize * 2)}px`,
    borderRadius: `${config.radius || 16}px`,
    position: 'relative',
    transition: (typeof window !== 'undefined' && window.location.search.includes('view')) || isDownloading
      ? 'none' 
      : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  return (
    <MotionConfig reducedMotion={isDownloading ? "always" : "user"}>
      <motion.div 
        layout={!isDownloading}
        ref={domRef}
        className={`relative select-none shadow-2xl flex flex-col items-center ${className || ''}`}
        style={containerStyle}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: isDownloading ? 0 : 0.4, ease: "easeOut" }}
      >
        {/* Background Watermark Year Label */}
        {config.showYearLabel && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
            userSelect: 'none'
          }}>
            <span style={{
              fontSize: `${config.fontSize * 18}px`,
              fontWeight: 900,
              fontFamily: 'monospace',
              opacity: 0.024,
              letterSpacing: '-0.05em',
              color: config.colors.text,
              lineHeight: 1
            }}>
              {currentYear}
            </span>
          </div>
        )}

        {/* 1. Header Plugin (Memento Mori / Theme Title) */}
        {config.showHeaderPlugin && (
          <div style={{
            textAlign: 'center',
            marginBottom: `${config.gap * 2}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: `${config.fontSize * 1.8}px`,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: config.colors.text
            }} className="text-balance">
              MEMENTO MORI
            </h1>
            <span style={{
              fontSize: `${config.fontSize * 0.75}px`,
              opacity: 0.35,
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              textTransform: 'uppercase'
            }} className="text-balance">
              Remember you must die • Live with intention
            </span>
          </div>
        )}

        {config.customTitle && (
          <h2 style={{ 
            fontSize: `${config.fontSize * 2}px`, 
            fontWeight: 900, 
            letterSpacing: '-0.02em',
            marginBottom: `${config.gap * 2}px`,
            alignSelf: 'flex-start'
          }} className="text-balance">
            {config.customTitle}
          </h2>
        )}

        {renderContent()}
        
        {/* 2. Calendar Stats Bar (Only shown for calendar views) */}
        {!config.isLifeMode && config.showStats && (
          <StatsBar config={config} targetDate={targetDate} currentYear={currentYear} />
        )}
      </motion.div>
    </MotionConfig>
  );
};

export default YearGrid;
