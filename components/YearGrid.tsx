import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppConfig } from '../types';

interface YearGridProps {
  config: AppConfig;
  className?: string;
  domRef?: React.RefObject<HTMLDivElement>;
}

const YearGrid: React.FC<YearGridProps> = ({ config, className, domRef }) => {
  const {
    date,
    isMondayFirst,
    showYearLabel,
    dotSize,
    gap,
    radius,
    fontFamily,
    fontSize = 10,
    colors,
    transparentBg,
    monthsToShow = 12,
    monthsPerRow = 3,
    monthOffset = 0,
    showDayNumbers = false,
    highlightWeekends = true,
    dimPastDays = true,
    showStats = true,
    mode = 'grid',
    startFromJan = false,
    granularity = 'day'
  } = config;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const targetDate = useMemo(() => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [date]);

  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();
  const currentDay = targetDate.getDate();

  const getWeekNumber = (d: Date) => {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
  };

  const currentWeekNumber = getWeekNumber(targetDate);

  // Helper to get day color based on Scriptable logic
  const getDayColor = (year: number, month: number, day: number) => {
    const absCurrent = currentYear * 10000 + currentMonth * 100 + currentDay;
    const absTarget = year * 10000 + month * 100 + day;

    const isPast = absTarget < absCurrent;
    const isToday = absTarget === absCurrent;

    if (isToday) return colors.today;

    // Weekend check
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    if (highlightWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return isPast && dimPastDays ? `${colors.weekend}4D` : colors.weekend;
    }

    if (isPast) {
      return dimPastDays ? `${colors.pastDay}4D` : colors.pastDay;
    }
    return colors.futureDay;
  };

  const months = useMemo(() => {
    const result = [];
    const effectiveOffset = startFromJan ? -currentMonth + (monthOffset * 12) : monthOffset;
    
    for (let i = effectiveOffset; i < effectiveOffset + monthsToShow; i++) {
      let targetMonthIndex = currentMonth + i;
      const year = currentYear + Math.floor(targetMonthIndex / 12);
      const month = ((targetMonthIndex % 12) + 12) % 12;

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const startOffset = (firstDayOfMonth - (isMondayFirst ? 1 : 0) + 7) % 7;

      // Group weeks that start in this month
      const weeksInMonth: { weekNum: number; color: string }[] = [];
      const oneJan = new Date(year, 0, 1);
      
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        if (d.getDay() === (isMondayFirst ? 1 : 0) || day === 1) {
          // If it's a Monday (or Sunday if isMondayFirst is false) or the first of month, check if it starts a week here
          // For simplicity, we'll just check if the date falls in this month
          const weekNum = getWeekNumber(d);
          const isPast = weekNum < currentWeekNumber && year <= currentYear;
          const isToday = weekNum === currentWeekNumber && year === currentYear;
          let color = colors.futureDay;
          if (isToday) color = colors.today;
          else if (isPast) color = dimPastDays ? `${colors.pastDay}4D` : colors.pastDay;

          // Only add if not already added
          if (!weeksInMonth.find(w => w.weekNum === weekNum)) {
            weeksInMonth.push({ weekNum, color });
          }
        }
      }

      result.push({
        year,
        month,
        name: monthNames[month],
        daysInMonth,
        weeksInMonth,
        startOffset
      });
    }
    return result;
  }, [currentYear, currentMonth, monthOffset, monthsToShow, isMondayFirst, startFromJan, colors, currentWeekNumber, dimPastDays]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: transparentBg ? 'transparent' : colors.bg,
    color: colors.text,
    fontFamily: fontFamily,
    padding: '48px',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
    borderRadius: '16px',
    position: 'relative',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  const statsSection = useMemo(() => {
    if (!showStats) return null;

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);
    const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = Math.ceil(Math.abs(targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const percentPassed = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    return (
      <div className="w-full space-y-3 pt-4 border-t border-white/5">
        <div className="flex justify-between items-end gap-10">
          <div className="flex flex-col items-start">
            <span style={{ fontSize: `${fontSize * 0.8}px`, opacity: 0.4, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Year Progress</span>
          </div>
          <span style={{ color: colors.stats, fontSize: `${fontSize * 1.5}px`, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(percentPassed)}%
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentPassed}%` }}
            style={{ height: '100%', background: colors.stats, borderRadius: '2px' }} 
          />
        </div>
      </div>
    );
  }, [showStats, currentYear, targetDate, colors.stats, fontSize]);

  const renderTimeline = () => {
    const allDays = months.flatMap(m => 
      Array.from({ length: m.daysInMonth }).map((_, i) => ({
        year: m.year,
        month: m.month,
        day: i + 1
      }))
    );

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.itemsPerRow || 31}, ${dotSize}px)`,
        gap: `${gap}px`,
      }}>
        {allDays.map((d, i) => (
          <motion.div
            layout
            key={`${d.year}-${d.month}-${d.day}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              backgroundColor: showDayNumbers ? 'transparent' : getDayColor(d.year, d.month, d.day),
              borderRadius: `${radius}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${dotSize * 0.5}px`,
              color: showDayNumbers ? getDayColor(d.year, d.month, d.day) : colors.bg,
              fontWeight: 700,
            }}
          >
            {showDayNumbers ? d.day : null}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderFlatWeeks = () => {
    const weeks = Array.from({ length: 52 }).map((_, i) => {
      const weekNum = i + 1;
      const isPast = weekNum < currentWeekNumber;
      const isToday = weekNum === currentWeekNumber;
      let color = colors.futureDay;
      if (isToday) color = colors.today;
      else if (isPast) color = dimPastDays ? `${colors.pastDay}4D` : colors.pastDay;

      return { weekNum, color };
    });

    const cols = mode === 'columns' ? 1 : mode === 'rows' ? 52 : (config.itemsPerRow || 13);

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${dotSize * 1.5}px)`,
        gap: `${gap * 2}px`,
      }}>
        {weeks.map(w => (
          <motion.div
            layout
            key={w.weekNum}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: `${dotSize * 1.5}px`,
              height: `${dotSize * 1.5}px`,
              backgroundColor: w.color,
              borderRadius: `${radius}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${dotSize * 0.7}px`,
              color: colors.bg,
              fontWeight: 900,
            }}
          >
            {w.weekNum}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderFlatMonths = () => {
    const cols = mode === 'columns' ? 1 : mode === 'rows' ? 12 : (config.itemsPerRow || 4);

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${dotSize * 2.5}px)`,
        gap: `${gap * 3}px`,
      }}>
        {monthNames.map((name, i) => {
          const isPast = i < currentMonth;
          const isToday = i === currentMonth;
          let color = colors.futureDay;
          if (isToday) color = colors.today;
          else if (isPast) color = dimPastDays ? `${colors.pastDay}4D` : colors.pastDay;

          return (
            <motion.div
              layout
              key={name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                width: `${dotSize * 2.5}px`,
                height: `${dotSize * 2.5}px`,
                backgroundColor: color,
                borderRadius: `${radius}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${dotSize * 0.7}px`,
                color: colors.bg,
                fontWeight: 900,
              }}
            >
              {name.toUpperCase()}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyGrid = () => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: mode === 'rows' ? '1fr' : 
                             mode === 'columns' ? `repeat(${months.length}, auto)` : 
                             `repeat(${monthsPerRow}, auto)`,
        gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
        width: '100%'
      }}>
        <AnimatePresence mode="popLayout">
          {months.map((m) => (
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
              <div style={{ 
                fontSize: `${fontSize * 1.1}px`, 
                fontWeight: 700, 
                color: colors.text,
                minWidth: mode === 'rows' ? '48px' : 'auto',
                opacity: 0.8,
                letterSpacing: '-0.02em',
                textAlign: mode === 'columns' ? 'center' : 'left',
                width: mode === 'columns' ? '100%' : 'auto'
              }}>
                {m.name}
              </div>
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
                  const color = getDayColor(m.year, m.month, day);
                  return (
                    <motion.div
                      layout
                      key={`day-${day}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        backgroundColor: showDayNumbers ? 'transparent' : color,
                        borderRadius: `${radius}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${dotSize * 0.5}px`,
                        color: showDayNumbers ? color : colors.bg,
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {showDayNumbers ? day : null}
                    </motion.div>
                  );
                })}

                {/* Week items (if granularity is week and mode is grid) */}
                {granularity === 'week' && m.weeksInMonth.map((w) => (
                   <motion.div
                    layout
                    key={`week-${w.weekNum}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: `${dotSize * 1.5}px`,
                      height: `${dotSize * 1.5}px`,
                      backgroundColor: w.color,
                      borderRadius: `${radius}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: `${dotSize * 0.7}px`,
                      color: colors.bg,
                      fontWeight: 900,
                    }}
                  >
                    {w.weekNum}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div ref={domRef} style={containerStyle} className={className}>
      {showYearLabel && (
        <div style={{ 
          fontSize: `${fontSize * 5}px`, 
          fontWeight: 900, 
          opacity: 0.05, 
          position: 'absolute', 
          top: '24px', 
          right: '48px',
          pointerEvents: 'none',
          fontFamily: "'Inter', sans-serif"
        }}>
          {currentYear}
        </div>
      )}

      {/* Main Content Picker */}
      {(() => {
        // Month view is always "flat" or linear because there's no Month-level grouping needed
        if (granularity === 'month') return renderFlatMonths();

        // Week view can be grouped by Month (Grid) or flat (everything else)
        if (granularity === 'week') {
          if (mode === 'grid') return renderMonthlyGrid();
          return renderFlatWeeks();
        }

        // Day view can be timeline (flat) or grouped monthly (grid, rows, columns)
        if (granularity === 'day') {
          if (mode === 'timeline') return renderTimeline();
          return renderMonthlyGrid();
        }

        return null;
      })()}

      {statsSection}
    </div>
  );
};

export default YearGrid;
