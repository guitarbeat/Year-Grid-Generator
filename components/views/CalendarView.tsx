import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDayColor } from '../../utils/colorUtils';
import { getWeekNumber, groupMonthsBySeason } from '../../utils/dateUtils';
import { Cell } from '../ui/Cell';

export const CalendarView: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick }) => {
  const {
    mode,
    granularity,
    groupBy,
    showSeasonLabels,
    seasonsSideBySide,
    showMonthAxis,
    showWeekdayAxis,
    showMonthNumbers,
    showDayNumbers,
    gap,
    fontSize,
    colors,
    radius,
    monthsPerRow = 3,
    dotSize,
    isMondayFirst,
    blockAlignment = 'top',
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
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
                color={showDayNumbers ? 'transparent' : color}
                dotSize={dotSize}
                radius={radius}
                fontSize={fontSize}
                textColor={showDayNumbers ? color : colors.bg}
                isActive={(m.year * 10000 + m.month * 100 + day) === (currentYear * 10000 + currentMonth * 100 + currentDay)}
                activeText={getActiveCellText(m.year, m.month, config, day)}
                fallbackText={showDayNumbers ? day : null}
                config={config}
                onCellClick={onCellClick}
              />
            );
          })}

          {/* Week items (if granularity is week and mode is grid/rows/columns) */}
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
            />
          ))}
        </div>
      </motion.div>
    );
  };

  if (groupBy === 'season') {
    const grouped = groupMonthsBySeason(months);

    const gridColsClass = mode === 'columns' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    return (
      <motion.div 
        layout
        className={seasonsSideBySide ? gridColsClass : undefined}
        style={{ 
          display: seasonsSideBySide ? 'grid' : 'flex', 
          flexDirection: seasonsSideBySide ? undefined : 'column', 
          gap: seasonsSideBySide ? `${gap * 6}px` : `${gap * 10}px`, 
          width: '100%',
          alignItems: seasonsSideBySide ? 'start' : (blockAlignment === 'top' ? 'start' : 'center')
        }}
      >
        {grouped.map(g => (
          <motion.div 
            layout
            key={g.season} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `${gap * 4}px`,
              backgroundColor: `${colors.text}05`,
              padding: `${gap * 4}px`,
              borderRadius: `${radius * 2}px`,
              border: `1px solid ${colors.text}08`,
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {showSeasonLabels && (
              <motion.div layout style={{ 
                fontSize: `${fontSize * 1.3}px`, 
                fontWeight: 900, 
                letterSpacing: '0.2em', 
                opacity: 0.35,
                textAlign: 'center',
                borderBottom: `1px solid ${colors.text}15`,
                paddingBottom: `${gap * 2.5}px`,
                marginBottom: `${gap * 3}px`,
                textTransform: 'uppercase'
              }}>
                {g.season}
              </motion.div>
            )}
            <motion.div layout style={{
              display: 'grid',
              gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${monthsPerRow}, 1fr)`,
              gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
              width: '100%',
              justifyItems: 'center',
              alignItems: blockAlignment === 'top' ? 'start' : 'center'
            }}>
              <AnimatePresence mode="popLayout">
                {g.months.map(m => renderMonthItem(m))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div layout style={{
      display: 'grid',
      gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${monthsPerRow}, 1fr)`,
      gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
      width: '100%',
      justifyItems: 'center',
      alignItems: blockAlignment === 'top' ? 'start' : 'center'
    }}>
      <AnimatePresence mode="popLayout">
        {months.map((m) => renderMonthItem(m))}
      </AnimatePresence>
    </motion.div>
  );
};
