import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { groupMonthsBySeason } from '../../utils/dateUtils';
import { Cell } from '../ui/Cell';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
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
import { getActiveCellText } from '../../utils/formatUtils';
import { getDimmedColor } from '../../utils/colorUtils';

export const FlatMonths: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick }) => {
  const {
    mode,
    groupBy,
    showSeasonLabels,
    seasonsSideBySide,
    showMonthAxis,
    showMonthLabels,
    gap,
    fontSize,
    colors,
    radius,
    itemsPerRow = 4,
    dotSize,
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

  const getMonthColor = (year: number, month: number, isToday: boolean, isPast: boolean) => {
    let color = colors.futureDay;
    const id = `month-${year}-${month}`;
    if (config.overrides[id]) {
      color = colors[config.overrides[id] as keyof typeof colors] || config.overrides[id];
    } else if (isToday) {
      color = colors.today;
    } else if (isPast) {
      color = getDimmedColor(colors.pastDay, config.dimPastDaysStrength || 50, config.dimPastDays);
    }
    return color;
  };

  const cols = mode === 'columns' ? 1 : mode === 'rows' ? 12 : itemsPerRow;

  if (groupBy === 'season') {
    const grouped = groupMonthsBySeason(months);

    const gridColsClass = mode === 'columns' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    return (
      <motion.div layout
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
          <motion.div layout
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
            <motion.div 
              layout 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${g.months.length}, auto)`,
                gap: `${gap * 4}px`, 
                justifyContent: 'center',
                alignItems: blockAlignment === 'top' ? 'start' : 'center'
              }}
            >
              {g.months.map(m => {
                const isPast = m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
                const isToday = m.year === currentYear && m.month === currentMonth;
                const color = getMonthColor(m.year, m.month, isToday, isPast);

                return (
                  <motion.div 
                    layout 
                    key={`${m.year}-${m.month}`} 
                    variants={itemVariants}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${gap}px` }}
                  >
                    {showMonthAxis && <motion.span layout style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5, ...rotateStyle }}>{m.name}</motion.span>}
                    <Cell
                      id={`month-${m.year}-${m.month}`}
                      color={color}
                      dotSize={(dotSize * 2.5) / 1.5} 
                      radius={radius}
                      fontSize={fontSize * 1.5}
                      textColor={colors.bg}
                      isActive={isToday}
                      activeText={getActiveCellText(m.year, m.month, config)}
                      fallbackText={showMonthLabels ? m.name.toUpperCase().substring(0, 3) : null}
                      config={config}
                      onCellClick={onCellClick}
                      isLarge
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, auto)`,
        gap: mode === 'grid' ? `${gap * 3}px` : `${gap * 2}px`,
        justifyContent: 'center',
        alignItems: blockAlignment === 'top' ? 'start' : 'center'
      }}
    >
      <AnimatePresence mode="popLayout">
        {months.map(m => {
          const isPast = m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
          const isToday = m.year === currentYear && m.month === currentMonth;
          const color = getMonthColor(m.year, m.month, isToday, isPast);

          return (
            <motion.div 
              layout
              key={`${m.year}-${m.month}`}
              variants={itemVariants}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${gap}px` }}
             >
              {showMonthAxis && <motion.span layout style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5, ...rotateStyle }}>{m.name}</motion.span>}
              <Cell
                id={`month-${m.year}-${m.month}`}
                color={color}
                // In Cell, isLarge uses dotSize * 1.5. To get dotSize * 2.5, pass custom dotSize
                dotSize={(dotSize * 2.5) / 1.5} 
                radius={radius}
                fontSize={fontSize * 1.3}
                textColor={colors.bg}
                isActive={isToday}
                activeText={getActiveCellText(m.year, m.month, config)}
                fallbackText={showMonthLabels ? m.name.toUpperCase().substring(0, 3) : null}
                config={config}
                onCellClick={onCellClick}
                isLarge
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
