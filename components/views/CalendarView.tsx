import React from 'react';
import { motion } from 'motion/react';
import { ViewProps } from './types';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDayColor } from '../../utils/colorUtils';
import { getWeekNumber } from '../../utils/dateUtils';
import { Cell } from '../ui/Cell';
import { getLayoutStrategyRenderer } from './layouts/factory';

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 0.15 } 
  }
};

export const CalendarView: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick, isDownloading = false }) => {
  const {
    mode,
    granularity,
    groupBy,
    showMonthAxis,
    showWeekdayAxis,
    showMonthNumbers,
    showDayNumbers,
    keepCellShapeWithNumbers,
    gap,
    fontSize,
    colors,
    radius,
    dotSize,
    isMondayFirst,
    labelRotation = 0
  } = config;

  const rotateStyle: React.CSSProperties = labelRotation ? {
    transform: `rotate(${labelRotation}deg)`,
    display: 'inline-block',
    transformOrigin: 'center center',
    width: 'max-content'
  } : {};

  const anchorDate = config.anchorTodayToRealTime ? new Date() : currentDate;
  const currentYear = anchorDate.getFullYear();
  const currentMonth = anchorDate.getMonth();
  const currentDay = anchorDate.getDate();

  const dayHeaderLabels = isMondayFirst 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const DAY_LABEL_HEIGHT = Math.ceil(fontSize * 1.8);
  const MONTH_LABEL_WIDTH = Math.ceil(fontSize * 5.5);

  const renderMonthItem = (m: any) => {
    return (
      <motion.div 
        layout
        key={`${m.year}-${m.month}`} 
        variants={itemVariants}
        style={{ 
          display: 'flex', 
          flexDirection: mode === 'rows' ? 'row' : 'column', 
          alignItems: 'center',
          gap: `${gap * 2}px`,
          width: mode === 'rows' ? 'auto' : '100%',
          justifyContent: 'center'
        }}
      >
        {showMonthAxis && (
          <div style={{ 
            fontSize: `${fontSize * 1.1}px`, 
            fontWeight: 700, 
            color: colors.text,
            minWidth: mode === 'rows' ? `${MONTH_LABEL_WIDTH}px` : 'auto',
            opacity: 0.8,
            letterSpacing: '-0.02em',
            textAlign: mode === 'rows' ? 'left' : 'center',
            width: mode === 'rows' ? `${MONTH_LABEL_WIDTH}px` : '100%',
            ...rotateStyle
          }}>
            {showMonthNumbers ? `${m.month + 1}` : m.name}
          </div>
        )}

        {granularity === 'day' && mode === 'grid' && showWeekdayAxis && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${dotSize}px)`,
            gap: `${gap}px`
          }}>
            {dayHeaderLabels.map((lbl, idx) => (
              <div 
                key={`header-${idx}`} 
                style={{ 
                  fontSize: `${fontSize * 0.7}px`,
                  height: `${DAY_LABEL_HEIGHT}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  fontWeight: 'bold',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                {lbl.substring(0, 1)}
              </div>
            ))}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 
            granularity === 'week' ? `repeat(${m.weeksInMonth.length}, ${dotSize * 1.5}px)` :
            mode === 'rows' ? `repeat(${m.daysInMonth}, ${dotSize}px)` : 
            `repeat(${mode === 'grid' ? 7 : 1}, ${dotSize}px)`,
          gap: `${gap}px`,
        }}>
          {/* Day Grid Specific: Empty offsets */}
          {granularity === 'day' && mode === 'grid' && Array.from({ length: m.startOffset }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: dotSize, height: dotSize }} />
          ))}

          {/* Day items */}
          {granularity === 'day' && Array.from({ length: m.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const color = getDayColor(m.year, m.month, day, config, currentDate);
            return (
              <Cell
                key={`day-${day}`}
                id={`day-${m.year}-${m.month}-${day}`}
                color={showDayNumbers && !keepCellShapeWithNumbers ? 'transparent' : color}
                dotSize={dotSize}
                radius={radius}
                fontSize={fontSize}
                textColor={showDayNumbers && !keepCellShapeWithNumbers ? color : colors.bg}
                isActive={(m.year * 10000 + m.month * 100 + day) === (currentYear * 10000 + currentMonth * 100 + currentDay)}
                activeText={getActiveCellText(m.year, m.month, config, day)}
                fallbackText={showDayNumbers ? day : null}
                config={config}
                onCellClick={onCellClick}
                isDownloading={isDownloading}
              />
            );
          })}

          {/* Week items */}
          {granularity === 'week' && m.weeksInMonth.map((w: any) => (
            <Cell
              key={`week-${w.weekNum}`}
              id={`week-${m.year}-${w.weekNum}`}
              color={w.color}
              dotSize={dotSize}
              radius={radius}
              fontSize={fontSize}
              textColor={colors.bg}
              isActive={m.year === currentYear && w.weekNum === getWeekNumber(anchorDate)}
              activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)}
              fallbackText={null}
              config={config}
              onCellClick={onCellClick}
              isLarge
              isDownloading={isDownloading}
            />
          ))}
        </div>
      </motion.div>
    );
  };
  
  const renderSideDayAxisColumn = () => {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${gap * 2}px`,
          userSelect: 'none'
        }}
      >
        {showMonthAxis && (
          <div style={{ 
            fontSize: `${fontSize * 1.1}px`, 
            fontWeight: 700, 
            opacity: 0,
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            1
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: `${gap}px`
        }}>
          {Array.from({ length: 31 }).map((_, i) => {
            const dayNum = i + 1;
            return (
              <div
                key={`side-day-${dayNum}`}
                style={{
                  width: `${fontSize * 2.5}px`,
                  height: `${dotSize}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${fontSize * 0.9}px`,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 'bold',
                  opacity: 0.45,
                  color: colors.text
                }}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const LayoutRenderer = getLayoutStrategyRenderer(groupBy);

  return (
    <LayoutRenderer 
      config={config} 
      months={months} 
      renderMonth={renderMonthItem} 
      renderSideAxis={renderSideDayAxisColumn} 
    />
  );
};
