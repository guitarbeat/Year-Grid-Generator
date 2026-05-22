import React from 'react';
import { motion } from 'motion/react';
import { AppConfig } from '../../types';

interface CellProps {
  id: string;
  color: string;
  dotSize: number;
  radius: number;
  fontSize: number;
  textColor: string;
  isActive: boolean;
  activeText: string;
  fallbackText: React.ReactNode;
  config: AppConfig;
  onCellClick?: (id: string) => void;
  isLarge?: boolean; // For weeks
  isDownloading?: boolean;
}

export const Cell: React.FC<CellProps> = ({
  id,
  color,
  dotSize,
  radius,
  fontSize,
  textColor,
  isActive,
  activeText,
  fallbackText,
  config,
  onCellClick,
  isLarge = false,
  isDownloading = false
}) => {
  const { showActiveLabel, activeLabelFormat, colors } = config;
  const size = isLarge ? dotSize * 1.5 : dotSize;
  const innerFontSize = isLarge ? Math.min(dotSize * 0.8, fontSize * 0.9) : Math.min(dotSize * 0.6, fontSize * 0.8);

  const renderLabelOverlay = () => {
    if (showActiveLabel && isActive) {
      const isLongFormat = ['monthDate', 'full', 'monthName', 'dayName'].includes(activeLabelFormat);
      if (isLongFormat) {
        return (
          <div style={{
            position: 'absolute',
            whiteSpace: 'nowrap',
            backgroundColor: colors.today,
            color: colors.bg,
            padding: `${Math.max(2, dotSize * 0.1)}px ${Math.max(6, dotSize * 0.4)}px`,
            borderRadius: `${Math.max(radius, 4)}px`,
            zIndex: 10,
            boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
            fontSize: `${Math.max(10, fontSize * 0.9)}px`,
            fontWeight: 800,
            pointerEvents: 'none',
            transform: 'translateY(-2px)'
          }}>
            {activeText}
          </div>
        );
      }
      return activeText;
    }
    return fallbackText;
  };

  const getCellTooltipText = (id: string, activeText: string, config: AppConfig) => {
    if (id.startsWith('life-')) {
      return activeText;
    }
    
    const parts = id.split('-');
    if (parts[0] === 'day') {
      const year = parseInt(parts[1]);
      const month = parseInt(parts[2]);
      const day = parseInt(parts[3]);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        const fullDate = d.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const overrideValue = config.overrides[id];
        if (overrideValue) {
          return `${fullDate} • Category: ${overrideValue.toUpperCase()}`;
        }
        return fullDate;
      }
    } else if (parts[0] === 'week') {
      const year = parseInt(parts[1]);
      const weekNum = parseInt(parts[2]);
      const d = new Date(year, 0, 1 + (weekNum - 1) * 7);
      const monthName = d.toLocaleDateString('default', { month: 'long' });
      const overrideValue = config.overrides[id];
      const base = `Week ${weekNum}, ${year} (${monthName})`;
      return overrideValue ? `${base} • Category: ${overrideValue.toUpperCase()}` : base;
    } else if (parts[0] === 'month') {
      const year = parseInt(parts[1]);
      const month = parseInt(parts[2]);
      const d = new Date(year, month, 1);
      if (!isNaN(d.getTime())) {
        const monthYear = d.toLocaleDateString('default', { year: 'numeric', month: 'long' });
        const overrideValue = config.overrides[id];
        return overrideValue ? `${monthYear} • Category: ${overrideValue.toUpperCase()}` : monthYear;
      }
    }
    return activeText || undefined;
  };

  const parts = id.split('-');
  const isDay = parts[0] === 'day';
  let isWeekend = false;
  if (isDay && parts.length >= 4) {
    const year = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10);
    const day = parseInt(parts[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      const dayOfWeek = d.getDay();
      isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    }
  }

  const dimWeekend = isWeekend && config.highlightWeekends && !isActive;

  return (
    <motion.div
      layout={!isDownloading}
      onClick={(e) => { e.stopPropagation(); onCellClick?.(id); }}
      initial={isDownloading ? false : { scale: 0 }}
      animate={isDownloading ? false : { scale: 1 }}
      title={getCellTooltipText(id, activeText, config)}
      whileHover={isDownloading ? undefined : { 
        scale: 1.25, 
        filter: "brightness(1.15)", 
        zIndex: 5,
        transition: { type: "spring", stiffness: 450, damping: 15 }
      }}
      whileTap={isDownloading ? undefined : { scale: 0.88 }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: `${radius}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${innerFontSize}px`,
        color: textColor,
        fontWeight: isLarge ? 900 : 700,
        position: 'relative',
        cursor: onCellClick ? 'pointer' : 'default',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        opacity: dimWeekend ? 0.6 : 1
      }}
    >
      <span style={{
        display: 'inline-block',
        width: '100%',
        lineHeight: `${size}px`,
        textAlign: 'center',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {renderLabelOverlay()}
      </span>
    </motion.div>
  );
};
