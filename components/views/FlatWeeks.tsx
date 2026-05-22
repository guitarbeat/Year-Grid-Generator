import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.02
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
import { getWeekNumber, groupMonthsBySeason } from '../../utils/dateUtils';

export const FlatWeeks: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick, isDownloading = false }) => {
  const {
    mode,
    groupBy,
    showSeasonLabels,
    seasonsSideBySide,
    showMonthAxis,
    showWeekNumbers,
    showMonthNumbers,
    gap,
    fontSize,
    colors,
    radius,
    itemsPerRow = 13,
    monthsPerRow = 3,
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
  const currentWeekNumber = getWeekNumber(anchorDate);

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
            <motion.div layout style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: `${gap * 6}px`, 
              justifyContent: 'center',
              alignItems: blockAlignment === 'top' ? 'start' : 'center'
            }}>
              {g.months.map(m => (
                 <motion.div layout key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, alignItems: 'center' }}>
                  {showMonthAxis && <motion.span layout style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5, ...rotateStyle }}>{m.name}</motion.span>}
                  <motion.div layout style={{ display: 'flex', flexDirection: mode === 'columns' ? 'column' : 'row', gap: `${gap}px` }}>
                    {m.weeksInMonth.map(w => (
                       <Cell
                        key={w.weekNum}
                        id={`week-${m.year}-${w.weekNum}`}
                        color={w.color}
                        dotSize={dotSize}
                        radius={radius}
                        fontSize={fontSize}
                        textColor={colors.bg}
                        isActive={m.year === currentYear && w.weekNum === currentWeekNumber}
                        activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)}
                        fallbackText={showWeekNumbers ? w.weekNum : (showMonthNumbers ? m.month + 1 : null)}
                        config={config}
                        onCellClick={onCellClick}
                        isLarge
                        isDownloading={isDownloading}
                      />
                    ))}
                  </motion.div>
                 </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // If showMonthAxis is on, we'll use a grouped approach to show month labels
  if (showMonthAxis) {
    return (
      <motion.div 
        layout 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${monthsPerRow}, auto)`,
          gap: `${gap * 4}px`,
          justifyContent: 'center',
          alignItems: blockAlignment === 'top' ? 'start' : 'center'
        }}
      >
        <AnimatePresence mode="popLayout">
          {months.map(m => (
            <motion.div 
              layout
              variants={itemVariants}
              key={`${m.year}-${m.month}`} 
              style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, alignItems: 'center' }}
             >
              <motion.span layout style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5, ...rotateStyle }}>{m.name}</motion.span>
              <motion.div layout style={{ display: 'flex', flexDirection: mode === 'columns' ? 'column' : 'row', gap: `${gap}px` }}>
                {m.weeksInMonth.map(w => (
                   <Cell
                    key={w.weekNum}
                    id={`week-${m.year}-${w.weekNum}`}
                    color={w.color}
                    dotSize={dotSize}
                    radius={radius}
                    fontSize={fontSize}
                    textColor={colors.bg}
                    isActive={m.year === currentYear && w.weekNum === currentWeekNumber}
                    activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)}
                    fallbackText={showWeekNumbers ? w.weekNum : (showMonthNumbers ? m.month + 1 : null)}
                    config={config}
                    onCellClick={onCellClick}
                    isLarge
                    isDownloading={isDownloading}
                  />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Fully flat weeks
  const allWeeks = months.flatMap(m => m.weeksInMonth.map(w => ({ ...w, month: m.month, year: m.year })));
  const cols = mode === 'columns' ? 1 : mode === 'rows' ? 52 : itemsPerRow;

  return (
    <motion.div 
      layout 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, auto)`,
        gap: `${gap}px`,
        justifyContent: 'center',
        alignItems: blockAlignment === 'top' ? 'start' : 'center'
      }}
    >
      <AnimatePresence mode="popLayout">
        {allWeeks.map((w, i) => (
          <motion.div 
            layout 
            key={`${w.identifier}-${i}`} 
            variants={itemVariants}
          >
            <Cell
              id={`week-${w.year}-${w.weekNum}`}
              color={w.color}
              dotSize={dotSize}
              radius={radius}
              fontSize={fontSize}
              textColor={colors.bg}
              isActive={w.year === currentYear && w.weekNum === currentWeekNumber}
              activeText={getActiveCellText(currentYear, currentMonth, config, undefined, currentWeekNumber)}
              fallbackText={showWeekNumbers ? w.weekNum : null}
              config={config}
              onCellClick={onCellClick}
              isLarge
              isDownloading={isDownloading}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
