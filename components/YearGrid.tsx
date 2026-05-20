import React, { useMemo } from 'react';
import { AppConfig } from '../types';
import { useGridData } from '../hooks/useGridData';
import { CalendarView } from './views/CalendarView';
import { FlatWeeks } from './views/FlatWeeks';
import { FlatMonths } from './views/FlatMonths';
import { Timeline } from './views/Timeline';
import { StatsBar } from './ui/StatsBar';

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

  const renderContent = () => {
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
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  return (
    <div 
      ref={domRef}
      className={`relative select-none shadow-2xl ${className || ''}`}
      style={containerStyle}
    >
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
      
      <StatsBar config={config} targetDate={targetDate} currentYear={currentYear} />
    </div>
  );
};

// ⚡ Bolt: Wrapped YearGrid in React.memo. This prevents expensive recalculations and 365+ child re-renders when PreviewArea updates its zoom or pan state.
export default React.memo(YearGrid);
