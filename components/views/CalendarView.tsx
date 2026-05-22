import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDayColor } from '../../utils/colorUtils';
import { getWeekNumber, groupMonthsBySeason } from '../../utils/dateUtils';
import { Cell } from '../ui/Cell';

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
    scale: 0.95, 
    transition: { duration: 0.15 } 
  }
};

export const CalendarView: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick, isDownloading = false }) => {
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
    keepCellShapeWithNumbers,
    showSideDayAxis,
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
              isDownloading={isDownloading}
            />
          ))}
        </div>
      </motion.div>
    );
  };
  
  const renderSideDayAxisColumn = (isHidden = false) => {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${gap * 2}px`,
          userSelect: 'none',
          visibility: isHidden ? 'hidden' : 'visible'
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

  const chunkedMonths = React.useMemo(() => {
    const chunks = [];
    for (let i = 0; i < months.length; i += monthsPerRow) {
      chunks.push(months.slice(i, i + monthsPerRow));
    }
    return chunks;
  }, [months, monthsPerRow]);

  if (groupBy === 'season') {
    const grouped = groupMonthsBySeason(months);

    const gridColsClass = mode === 'columns' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    const renderOuterSideAxis = showSideDayAxis && mode === 'columns' && seasonsSideBySide;
    const renderInnerSideAxis = showSideDayAxis && mode === 'columns' && !seasonsSideBySide;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'start',
        gap: `${gap * 4}px`,
        width: '100%',
        justifyContent: 'center'
      }}>
        {renderOuterSideAxis && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: `${gap * 4 + 1}px`,
            paddingBottom: `${gap * 4 + 1}px`,
            boxSizing: 'border-box'
          }}>
            {showSeasonLabels && (
              <div style={{
                fontSize: `${fontSize * 1.3}px`,
                fontWeight: 900,
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
                paddingBottom: `${gap * 2.5}px`,
                marginBottom: `${gap * 3}px`,
                borderBottom: `1.5px solid transparent`,
                textTransform: 'uppercase'
              }}>
                SPACER
              </div>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${gap * 4}px`
            }}>
              {renderSideDayAxisColumn(false)}
            </div>
          </div>
        )}

        <motion.div 
          layout
          className={seasonsSideBySide ? gridColsClass : undefined}
          style={{ 
            display: seasonsSideBySide ? 'grid' : 'flex', 
            flexDirection: seasonsSideBySide ? undefined : 'column', 
            gap: seasonsSideBySide ? `${gap * 6}px` : `${gap * 10}px`, 
            flex: 1,
            alignItems: seasonsSideBySide ? 'start' : (blockAlignment === 'top' ? 'start' : 'center'),
            width: '100%'
          }}
        >
          {grouped.map((g, idx) => (
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
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: blockAlignment === 'top' ? 'start' : 'center',
                gap: `${gap * 4}px`,
                justifyContent: 'center',
                width: '100%'
              }}>
                {renderInnerSideAxis && renderSideDayAxisColumn(false)}
                <motion.div 
                  layout 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: mode === 'rows' 
                      ? '1fr' 
                      : (mode === 'columns' ? `repeat(${monthsPerRow}, ${dotSize}px)` : `repeat(${monthsPerRow}, 1fr)`),
                    gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
                    flex: mode === 'columns' ? 'none' : 1,
                    justifyItems: 'center',
                    alignItems: blockAlignment === 'top' ? 'start' : 'center'
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {g.months.map(m => renderMonthItem(m))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 10}px`,
      width: '100%',
      alignItems: blockAlignment === 'top' ? 'start' : 'center'
    }}>
      {chunkedMonths.map((chunk, rowIdx) => (
        <div 
          key={`row-${rowIdx}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: blockAlignment === 'top' ? 'start' : 'center',
            gap: `${gap * 4}px`,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {showSideDayAxis && mode === 'columns' && renderSideDayAxisColumn()}
          <motion.div 
            layout 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: mode === 'rows' 
                ? '1fr' 
                : (mode === 'columns' ? `repeat(${monthsPerRow}, ${dotSize}px)` : `repeat(${monthsPerRow}, 1fr)`),
              gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
              flex: mode === 'columns' ? 'none' : 1,
              justifyItems: 'center',
              alignItems: blockAlignment === 'top' ? 'start' : 'center'
            }}
          >
            <AnimatePresence mode="popLayout">
              {chunk.map((m) => renderMonthItem(m))}
            </AnimatePresence>
          </motion.div>
        </div>
      ))}
    </div>
  );
};
