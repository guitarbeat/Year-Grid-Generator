import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { AppConfig } from '../types';
import { useGridData } from '../hooks/useGridData';
import { CalendarView } from './views/CalendarView';
import { FlatWeeks } from './views/FlatWeeks';
import { FlatMonths } from './views/FlatMonths';
import { Timeline } from './views/Timeline';
import { StatsBar } from './ui/StatsBar';
import { LifeView } from './views/LifeView';
import { QUOTES } from '../utils/quotes';

interface YearGridProps {
  config: AppConfig;
  className?: string;
  domRef?: React.RefObject<HTMLDivElement>;
  onCellClick?: (id: string) => void;
}

const YearGrid: React.FC<YearGridProps> = ({ config, className, domRef, onCellClick }) => {
  const targetDate = useMemo(() => {
    const d = new Date(config.date);
    if (isNaN(d.getTime())) return new Date();
    const [y, m, day] = config.date.split('-').map(Number);
    return new Date(y, m - 1, day);
  }, [config.date]);

  const months = useGridData(targetDate, config);
  const currentYear = targetDate.getFullYear();

  const activeQuote = useMemo(() => {
    if (config.customQuoteText) {
      return { text: config.customQuoteText, author: 'Self' };
    }
    return QUOTES.find(q => q.id === config.selectedQuoteId) || QUOTES[0];
  }, [config.selectedQuoteId, config.customQuoteText]);

  const renderContent = () => {
    if (config.isLifeMode) {
      return <LifeView config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} />;
    }

    if (config.mode === 'timeline') {
      return <Timeline config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} />;
    }

    if (config.granularity === 'month') {
      return <FlatMonths config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} />;
    }

    if (config.granularity === 'week' && config.mode === 'grid') { // Original logic for flat weeks
      return <FlatWeeks config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} />;
    }

    return <CalendarView config={config} months={months} currentDate={targetDate} onCellClick={onCellClick} />;
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
    transition: typeof window !== 'undefined' && window.location.search.includes('view') 
      ? 'none' 
      : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  return (
    <motion.div 
      layout
      ref={domRef}
      className={`relative select-none shadow-2xl flex flex-col items-center ${className || ''}`}
      style={containerStyle}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
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
          }}>
            MEMENTO MORI
          </h1>
          <span style={{
            fontSize: `${config.fontSize * 0.75}px`,
            opacity: 0.35,
            letterSpacing: '0.12em',
            fontFamily: 'monospace',
            textTransform: 'uppercase'
          }}>
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
        }}>
          {config.customTitle}
        </h2>
      )}

      {renderContent()}
      
      {/* 2. Calendar Stats Bar (Only shown for calendar views) */}
      {!config.isLifeMode && config.showStats && (
        <StatsBar config={config} targetDate={targetDate} currentYear={currentYear} />
      )}

      {/* 3. Interactive Memento Mori Quotes Plugin (from Ti-03/remainders) */}
      {config.showQiQuotes && activeQuote && (
        <div 
          onClick={() => onCellClick?.('action:cycle-quote')}
          style={{ 
            maxWidth: '420px', 
            textAlign: 'center', 
            border: `1px solid ${config.colors.text}10`,
            backgroundColor: `${config.colors.text}04`,
            padding: `${config.gap * 3.5}px ${config.gap * 5}px`, 
            borderRadius: `${config.radius * 2 || 8}px`,
            marginTop: `${config.gap * 3}px`,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'all 0.2s',
            width: '100%',
            boxSizing: 'border-box'
          }}
          className="hover:bg-white/[0.02] active:scale-[0.99]"
        >
          <p style={{ 
            fontSize: `${config.fontSize * 1.1}px`, 
            lineHeight: '1.45',
            fontStyle: 'italic',
            color: config.colors.text,
            opacity: 0.8,
            marginBottom: `${config.gap * 1.5}px`
          }}>
            "{activeQuote.text}"
          </p>
          <span style={{ 
            fontSize: `${config.fontSize * 0.8}px`, 
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.35,
            fontFamily: 'monospace'
          }}>
            — {activeQuote.author} <span style={{ opacity: 0.7, color: config.colors.stats }} className="ml-1 text-[7px] font-normal tracking-normal">(CYCLE ↻)</span>
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default YearGrid;
