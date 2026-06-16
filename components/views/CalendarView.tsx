import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDayColor } from '../../utils/colorUtils';
import { getWeekNumber } from '../../utils/dateUtils';
import { Cell } from '../ui/Cell';
import { MonthData } from '../../hooks/useGridData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02
    }
  }
};

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
    y: -8,
    scale: 0.97, 
    transition: { duration: 0.12, ease: "easeIn" as const } 
  }
};

export const CalendarView: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick, isDownloading = false, selectedCellId }) => {
  const {
    mode,
    granularity,
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
    labelRotation = 0,
    axisPadding = 0
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
  const absCurrent = currentYear * 10000 + currentMonth * 100 + currentDay;

  const dayHeaderLabels = isMondayFirst 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const DAY_LABEL_HEIGHT = Math.ceil(fontSize * 1.8);
  const MONTH_LABEL_WIDTH = Math.ceil(fontSize * 5.5);

  const renderMonthItem = (m: MonthData) => {
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
            fontSize: `${fontSize * (config.monthLabelScale ?? 1.0) * 1.1}px`, 
            fontWeight: 700, 
            color: colors.text,
            minWidth: mode === 'rows' ? `${MONTH_LABEL_WIDTH}px` : 'auto',
            opacity: 0.8,
            letterSpacing: '-0.02em',
            textAlign: mode === 'rows' ? 'left' : 'center',
            width: mode === 'rows' ? `${MONTH_LABEL_WIDTH}px` : '100%',
            marginBottom: mode !== 'rows' ? `${axisPadding}px` : undefined,
            marginRight: mode === 'rows' ? `${axisPadding}px` : undefined,
            ...rotateStyle
          }}>
            {showMonthNumbers ? `${m.month + 1}` : m.name}
          </div>
        )}

        {granularity === 'day' && mode === 'grid' && showWeekdayAxis && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${dotSize}px)`,
            gap: `${gap}px`,
            marginBottom: `${axisPadding}px`
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
            const color = getDayColor(m.year, m.month, day, config, absCurrent);
            const cellId = `day-${m.year}-${m.month}-${day}`;
            return (
              <Cell
                key={`day-${day}`}
                id={cellId}
                color={showDayNumbers && !keepCellShapeWithNumbers ? 'transparent' : color}
                dotSize={dotSize}
                radius={radius}
                fontSize={fontSize}
                textColor={showDayNumbers && !keepCellShapeWithNumbers ? color : colors.bg}
                isActive={(m.year * 10000 + m.month * 100 + day) === absCurrent}
                isSelected={selectedCellId === cellId}
                activeText={getActiveCellText(m.year, m.month, config, day)}
                fallbackText={showDayNumbers ? day : null}
                config={config}
                onCellClick={onCellClick}
                isDownloading={isDownloading}
              />
            );
          })}

          {/* Week items */}
          {granularity === 'week' && m.weeksInMonth.map(w => {
            const cellId = `week-${m.year}-${w.weekNum}`;
            return (
              <Cell
                key={`week-${w.weekNum}`}
                id={cellId}
                color={w.color}
                dotSize={dotSize}
                radius={radius}
                fontSize={fontSize}
                textColor={colors.bg}
                isActive={m.year === currentYear && w.weekNum === getWeekNumber(anchorDate)}
                isSelected={selectedCellId === cellId}
                activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)}
                fallbackText={null}
                config={config}
                onCellClick={onCellClick}
                isLarge
                isDownloading={isDownloading}
              />
            );
          })}

          {/* Month items (single dot per month) */}
          {granularity === 'month' && (() => {
            const cellId = `month-${m.year}-${m.month}`;
            return (
              <Cell
                key={`month-${m.month}`}
                id={cellId}
                color={getDayColor(m.year, m.month, 1, config, absCurrent)}
                dotSize={dotSize * 3}
                radius={radius}
                fontSize={fontSize}
                textColor={colors.bg}
                isActive={m.year === currentYear && m.month === currentMonth}
                isSelected={selectedCellId === cellId}
                activeText={getActiveCellText(m.year, m.month, config, undefined, undefined)}
                fallbackText={null}
                config={config}
                onCellClick={onCellClick}
                isLarge
                isDownloading={isDownloading}
              />
            );
          })()}
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
          userSelect: 'none',
          marginRight: `${axisPadding}px`
        }}
      >
        {showMonthAxis && (
          <div style={{ 
            fontSize: `${fontSize * (config.monthLabelScale ?? 1.0) * 1.1}px`, 
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

  // In-line chunked grouping logic directly
  const groupedMonths = React.useMemo(() => {
    if (mode !== 'grid') {
      return [{ id: 'all-months', months }];
    }
    const chunks = [];
    const size = config.monthsPerRow || 3;
    for (let i = 0; i < months.length; i += size) {
      chunks.push({
        id: `chunk-${i}`,
        months: months.slice(i, i + size)
      });
    }
    return chunks;
  }, [months, mode, config.monthsPerRow]);

  const blockAlignment = config.blockAlignment || 'top';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 10}px`,
      width: '100%',
      alignItems: blockAlignment === 'top' ? 'start' : 'center'
    }}>
      {groupedMonths.map((group, rowIdx) => (
        <div 
          key={group.id || `row-${rowIdx}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: blockAlignment === 'top' ? 'start' : 'center',
            gap: `${gap * 4}px`,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {config.showSideDayAxis && mode === 'columns' && renderSideDayAxisColumn()}
          <motion.div 
            layout 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: mode === 'rows' 
                ? '1fr' 
                : (mode === 'columns' ? `repeat(${config.monthsPerRow || 3}, ${dotSize}px)` : `repeat(${config.monthsPerRow || 3}, 1fr)`),
              gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
              flex: mode === 'columns' ? 'none' : 1,
              justifyItems: 'center',
              alignItems: blockAlignment === 'top' ? 'start' : 'center'
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {group.months.map((m) => renderMonthItem(m))}
            </AnimatePresence>
          </motion.div>
        </div>
      ))}
    </div>
  );
};
