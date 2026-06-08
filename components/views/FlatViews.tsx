import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDimmedColor } from '../../utils/colorUtils';
import { getWeekNumber } from '../../utils/dateUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.02 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 }
  },
  exit: { 
    opacity: 0, y: -8, scale: 0.95, 
    transition: { duration: 0.12, ease: "easeIn" as const } 
  }
};

export const FlatMonths: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick, isDownloading = false }) => {
  const { mode, showMonthAxis, showMonthLabels, gap, fontSize, colors, radius, itemsPerRow = 4, dotSize, blockAlignment = 'top', labelRotation = 0 } = config;
  const rotateStyle: React.CSSProperties = labelRotation ? { transform: `rotate(${labelRotation}deg)`, display: 'inline-block', transformOrigin: 'center center', width: 'max-content' } : {};
  const anchorDate = config.anchorTodayToRealTime ? new Date() : currentDate;
  const currentYear = anchorDate.getFullYear();
  const currentMonth = anchorDate.getMonth();

  const getMonthColor = (year: number, month: number, isToday: boolean, isPast: boolean) => {
    let color = colors.futureDay;
    const id = `month-${year}-${month}`;
    const overrideVal = config.overrides[id];
    if (overrideVal) {
      const colorKey = overrideVal.includes('|') ? overrideVal.split('|')[0] : overrideVal;
      color = colors[colorKey as keyof typeof colors] || colorKey;
    } else if (isToday) color = colors.today;
    else if (isPast) color = getDimmedColor(colors.pastDay, config.dimPastDaysStrength || 50, config.dimPastDays);
    return color;
  };

  const cols = mode === 'columns' ? 1 : mode === 'rows' ? 12 : itemsPerRow;

  return (
    <motion.div layout variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, auto)`, gap: mode === 'grid' ? `${gap * 3}px` : `${gap * 2}px`, justifyContent: 'center', alignItems: blockAlignment === 'top' ? 'start' : 'center' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {months.map(m => {
          const isPast = m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
          const isToday = m.year === currentYear && m.month === currentMonth;
          return (
            <motion.div layout key={`${m.year}-${m.month}`} variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${gap}px` }}>
              {showMonthAxis && <motion.span layout style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5, ...rotateStyle }}>{config.showMonthNumbers ? (m.month + 1) : m.name}</motion.span>}
              <Cell id={`month-${m.year}-${m.month}`} color={getMonthColor(m.year, m.month, isToday, isPast)} dotSize={(dotSize * 2.5) / 1.5} radius={radius} fontSize={fontSize * 1.3} textColor={colors.bg} isActive={isToday} activeText={getActiveCellText(m.year, m.month, config)} fallbackText={showMonthLabels ? m.name.toUpperCase().substring(0, 3) : null} config={config} onCellClick={onCellClick} isLarge isDownloading={isDownloading} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export const FlatWeeks: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick, isDownloading = false }) => {
  const { mode, showMonthAxis, showWeekNumbers, showMonthNumbers, gap, fontSize, colors, radius, itemsPerRow = 13, monthsPerRow = 3, dotSize, blockAlignment = 'top', labelRotation = 0 } = config;
  const rotateStyle: React.CSSProperties = labelRotation ? { transform: `rotate(${labelRotation}deg)`, display: 'inline-block', transformOrigin: 'center center', width: 'max-content' } : {};
  const anchorDate = config.anchorTodayToRealTime ? new Date() : currentDate;
  const currentYear = anchorDate.getFullYear();
  const currentMonth = anchorDate.getMonth();
  const currentWeekNumber = getWeekNumber(anchorDate);

  if (showMonthAxis) {
    return (
      <motion.div layout variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${monthsPerRow}, auto)`, gap: `${gap * 4}px`, justifyContent: 'center', alignItems: blockAlignment === 'top' ? 'start' : 'center' }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {months.map(m => (
            <motion.div layout variants={itemVariants} key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, alignItems: 'center' }}>
              <motion.span layout style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5, ...rotateStyle }}>{showMonthNumbers ? (m.month + 1) : m.name}</motion.span>
              <motion.div layout style={{ display: 'flex', flexDirection: mode === 'columns' ? 'column' : 'row', gap: `${gap}px` }}>
                {m.weeksInMonth.map(w => (
                  <Cell key={w.weekNum} id={`week-${m.year}-${w.weekNum}`} color={w.color} dotSize={dotSize} radius={radius} fontSize={fontSize} textColor={colors.bg} isActive={m.year === currentYear && w.weekNum === currentWeekNumber} activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)} fallbackText={showWeekNumbers ? w.weekNum : (showMonthNumbers ? m.month + 1 : null)} config={config} onCellClick={onCellClick} isLarge isDownloading={isDownloading} />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  const allWeeks = months.flatMap(m => m.weeksInMonth.map(w => ({ ...w, month: m.month, year: m.year })));
  const cols = mode === 'columns' ? 1 : mode === 'rows' ? 52 : itemsPerRow;

  return (
    <motion.div layout variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, auto)`, gap: `${gap}px`, justifyContent: 'center', alignItems: blockAlignment === 'top' ? 'start' : 'center' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {allWeeks.map((w, i) => (
          <motion.div layout key={`${w.identifier}-${i}`} variants={itemVariants}>
            <Cell id={`week-${w.year}-${w.weekNum}`} color={w.color} dotSize={dotSize} radius={radius} fontSize={fontSize} textColor={colors.bg} isActive={w.year === currentYear && w.weekNum === currentWeekNumber} activeText={getActiveCellText(currentYear, currentMonth, config, undefined, currentWeekNumber)} fallbackText={showWeekNumbers ? w.weekNum : null} config={config} onCellClick={onCellClick} isLarge isDownloading={isDownloading} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
