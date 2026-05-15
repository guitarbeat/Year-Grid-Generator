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
  isLarge = false
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

  return (
    <motion.div
      layout
      onClick={(e) => { e.stopPropagation(); onCellClick?.(id); }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
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
        position: 'relative'
      }}
    >
      {renderLabelOverlay()}
    </motion.div>
  );
};
