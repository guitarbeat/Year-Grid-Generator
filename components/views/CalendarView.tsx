import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDayColor } from '../../utils/colorUtils';
import { getWeekNumber } from '../../utils/dateUtils';
import { Cell } from '../ui/Cell';

export const CalendarView: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick }) => {
  const {
    mode,
    granularity,
    groupBy,
    showSeasonLabels,
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
    isMondayFirst
  } = config;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

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
          alignItems: mode === 'rows' ? 'center' : 'flex-start',
          gap: `${gap * 2}px` 
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
            textAlign: mode === 'columns' ? 'center' : 'left',
            width: mode === 'columns' ? '100%' : (mode === 'rows' ? `${MONTH_LABEL_WIDTH}px` : 'auto')
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
              isActive={m.year === currentYear && w.weekNum === getWeekNumber(currentDate)}
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
    const seasonsOrder = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const grouped = seasonsOrder.map(s => ({
      season: s,
      months: months.filter(m => m.season === s).sort((a, b) => {
        const wA = (a.month + 1) % 12;
        const wB = (b.month + 1) % 12;
        return wA - wB;
      })
    })).filter(g => g.months.length > 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 10}px`, width: '100%' }}>
        {grouped.map(g => (
          <div 
            key={g.season} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `${gap * 4}px`,
              backgroundColor: `${colors.text}05`,
              padding: `${gap * 4}px`,
              borderRadius: `${radius * 2}px`,
              border: `1px solid ${colors.text}08`
            }}
          >
            {showSeasonLabels && (
              <div style={{ 
                fontSize: `${fontSize * 1.5}px`, 
                fontWeight: 900, 
                letterSpacing: '0.25em', 
                opacity: 0.3,
                textAlign: 'center',
                borderBottom: `1px solid ${colors.text}22`,
                paddingBottom: `${gap * 2}px`,
                marginBottom: `${gap * 2}px`,
                textTransform: 'uppercase'
              }}>
                {g.season}
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${monthsPerRow}, auto)`,
              gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
              width: '100%'
            }}>
              {g.months.map(m => renderMonthItem(m))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${monthsPerRow}, auto)`,
      gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
      width: '100%'
    }}>
      <AnimatePresence mode="popLayout">
        {months.map((m) => renderMonthItem(m))}
      </AnimatePresence>
    </div>
  );
};
