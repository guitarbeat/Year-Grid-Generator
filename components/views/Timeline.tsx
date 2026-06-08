import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDayColor } from '../../utils/colorUtils';
import { getWeekNumber } from '../../utils/dateUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring" as const, stiffness: 350, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    x: 8,
    scale: 0.97, 
    transition: { duration: 0.12, ease: "easeIn" as const } 
  }
};

export const Timeline: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick, isDownloading = false }) => {
  const {
    granularity,
    showMonthAxis,
    showWeekdayAxis,
    showDayNumbers,
    keepCellShapeWithNumbers,
    showWeekNumbers,
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
  const absCurrent = currentYear * 10000 + currentMonth * 100 + currentDay;

  return (
    <motion.div 
      layout 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 4}px` }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {months.map(m => {
          const hasWeekdayAxis = granularity === 'day' && showWeekdayAxis;
          return (
            <motion.div 
              layout
              variants={itemVariants}
              key={`${m.year}-${m.month}`} 
              style={{ display: 'flex', gap: `${gap * 2}px`, alignItems: 'center' }}
            >
              {showMonthAxis && (
                <motion.div layout style={{ minWidth: `${fontSize * 5}px`, fontSize: `${fontSize}px`, fontWeight: 'bold', color: colors.text, opacity: 0.8, ...rotateStyle }}>
                  {config.showMonthNumbers ? (m.month + 1) : m.name}
                </motion.div>
              )}
              <motion.div layout style={{ display: 'flex', gap: `${gap}px` }}>
                {granularity === 'day' && m.startOffset > 0 && Array.from({ length: m.startOffset }).map((_, i) => (
                  <motion.div layout key={`empty-${i}`} style={{ width: dotSize, height: dotSize }} />
                ))}
                
                {granularity === 'day' && Array.from({ length: m.daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(m.year, m.month, day);
                  const dayName = ["S", "M", "T", "W", "T", "F", "S"][dateObj.getDay()];
                  const color = getDayColor(m.year, m.month, day, config, absCurrent);
                  return (
                    <motion.div layout key={`day-${day}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      {hasWeekdayAxis && (
                        <motion.span layout style={{ fontSize: `${fontSize * 0.7}px`, opacity: 0.5, fontWeight: 'bold', fontFamily: 'JetBrains Mono, monospace' }}>
                          {dayName}
                        </motion.span>
                      )}
                      <Cell
                        id={`day-${m.year}-${m.month}-${day}`}
                        color={showDayNumbers && !keepCellShapeWithNumbers ? 'transparent' : color}
                        dotSize={dotSize}
                        radius={radius}
                        fontSize={fontSize}
                        textColor={showDayNumbers && !keepCellShapeWithNumbers ? color : colors.bg}
                        isActive={(m.year * 10000 + m.month * 100 + day) === absCurrent}
                        activeText={getActiveCellText(m.year, m.month, config, day)}
                        fallbackText={showDayNumbers ? day : null}
                        config={config}
                        onCellClick={onCellClick}
                        isDownloading={isDownloading}
                      />
                    </motion.div>
                  );
                })}

                {granularity === 'week' && m.weeksInMonth.map(w => (
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
                    fallbackText={showWeekNumbers ? w.weekNum : null}
                    config={config}
                    onCellClick={onCellClick}
                    isLarge
                    isDownloading={isDownloading}
                  />
                ))}

              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
